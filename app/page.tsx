'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { SafetyStatusCard } from '@/components/sentra/SafetyStatusCard'
import { TransactionCard } from '@/components/sentra/TransactionCard'
import { RiskScoreCard } from '@/components/sentra/RiskScoreCard'
import { PatternTimeline } from '@/components/sentra/PatternTimeline'
import { useLivePoll } from '@/lib/hooks/useLivePoll'
import { formatCurrency, formatRelativeTime, getGreeting, getRiskLevelConfig } from '@/lib/utils'
import {
  Shield,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Activity,
  Clock,
  Zap,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { RiskLevel } from '@/types'

interface TransactionItem {
  id: string
  amount: number
  payee: string
  payeeIsNew: boolean
  timestamp: string
  riskScore: number
  riskLevel: RiskLevel
  status: string
  pausedUntil: string | null
  suspiciousCall: boolean
  urgentMessage: boolean
}

interface FraudEventItem {
  id: string
  eventType: string
  description: string
  riskScore: number
  severity: RiskLevel
  timestamp: string
  acknowledged: boolean
}

export default function DashboardPage() {
  const greeting = getGreeting()

  // 1. Live Poll: Recent Transactions (every 5s)
  const { data: txnsData, refresh: refreshTxns } = useLivePoll<{
    success: boolean
    count: number
    transactions: TransactionItem[]
  }>('/api/transactions?userId=demo-user&limit=10', 5000)

  // 2. Live Poll: Active Unacknowledged Alerts (every 3s)
  const { data: activeAlertsData, refresh: refreshActiveAlerts } = useLivePoll<{
    success: boolean
    count: number
    events: FraudEventItem[]
  }>('/api/fraud-events?userId=demo-user&acknowledged=false', 3000)

  // 3. Live Poll: All Recent Fraud Events (every 5s)
  const { data: allAlertsData, refresh: refreshAllAlerts } = useLivePoll<{
    success: boolean
    count: number
    events: FraudEventItem[]
  }>('/api/fraud-events?userId=demo-user&limit=5', 5000)

  const transactions = useMemo(() => txnsData?.transactions ?? [], [txnsData])
  const activeAlertsCount = activeAlertsData?.count ?? 0
  const recentAlerts = useMemo(() => allAlertsData?.events ?? [], [allAlertsData])

  // Compute live safety stats
  const stats = useMemo(() => {
    const safeCount = transactions.filter(t => (t.riskScore ?? 0) <= 25).length
    const warningCount = transactions.filter(
      t => (t.riskScore ?? 0) > 25 && (t.riskScore ?? 0) <= 70
    ).length
    const blockedCount = transactions.filter(
      t => t.status === 'paused' || t.status === 'blocked'
    ).length

    const latestTxn = transactions[0]
    const currentScore = latestTxn?.riskScore !== undefined ? Math.round(latestTxn.riskScore) : 10
    const currentLevel: RiskLevel = latestTxn?.riskLevel ?? 'safe'

    return {
      safeTransactions: safeCount,
      warningCount,
      blockedCount,
      activeAlerts: activeAlertsCount,
      currentRiskScore: currentScore,
      currentRiskLevel: currentLevel,
    }
  }, [transactions, activeAlertsCount])

  // Build live timeline preview from recent transactions
  const timelineEvents = useMemo(() => {
    return transactions.slice(0, 5).reverse().map(t => ({
      id: t.id,
      timestamp: new Date(t.timestamp).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      amount: t.amount,
      payee: t.payee,
      riskScore: Math.round(t.riskScore ?? 0),
      riskLevel: t.riskLevel ?? 'safe',
      signals: [
        t.payeeIsNew ? 'New Recipient' : '',
        t.suspiciousCall ? 'Suspicious Call' : '',
        t.urgentMessage ? 'Urgent Message' : '',
        t.status === 'paused' ? 'Paused (Cooldown)' : '',
        t.status === 'blocked' ? 'Blocked' : '',
      ].filter(Boolean),
      isIntervention: t.status === 'paused' || t.status === 'blocked',
      interventionMessage:
        t.status === 'paused'
          ? 'SENTRA detected high cumulative risk and placed a safety cooldown on this transaction.'
          : t.status === 'blocked'
          ? 'SENTRA blocked this transaction and notified designated guardians.'
          : undefined,
    }))
  }, [transactions])

  const handleTxnResumed = () => {
    refreshTxns()
    refreshActiveAlerts()
    refreshAllAlerts()
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-slide-in">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {greeting} 👋
          </h1>
          <p className="text-slate-500 mt-0.5">Your financial safety is actively monitored by SENTRA.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Polling Active
          </span>
        </div>
      </div>

      {/* Main safety status */}
      <SafetyStatusCard
        riskLevel={stats.currentRiskLevel}
        riskScore={stats.currentRiskScore}
        userName="Priya"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Safe Transactions"
          value={stats.safeTransactions}
          icon={CheckCircle}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50"
          suffix="today"
        />
        <StatCard
          label="Warnings"
          value={stats.warningCount}
          icon={AlertTriangle}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
          suffix="detected"
        />
        <StatCard
          label="Paused / Blocked"
          value={stats.blockedCount}
          icon={XCircle}
          iconColor="text-red-500"
          iconBg="bg-red-50"
          suffix="transactions"
        />
        <StatCard
          label="Active Alerts"
          value={stats.activeAlerts}
          icon={Activity}
          iconColor="text-rose-500"
          iconBg="bg-rose-50"
          suffix="unread"
          highlight={stats.activeAlerts > 0}
        />
      </div>

      {/* Main grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-800">Recent Transactions</h2>
              <p className="text-xs text-slate-500">Live risk-scored by SENTRA</p>
            </div>
            <Link
              href="/simulator"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Simulate
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No recent transactions recorded.
              </div>
            ) : (
              transactions.slice(0, 6).map(txn => (
                <TransactionCard
                  key={txn.id}
                  id={txn.id}
                  amount={txn.amount}
                  payee={txn.payee}
                  payeeIsNew={txn.payeeIsNew}
                  timestamp={txn.timestamp}
                  riskScore={txn.riskScore}
                  riskLevel={txn.riskLevel}
                  status={txn.status}
                  pausedUntil={txn.pausedUntil}
                  suspiciousCall={txn.suspiciousCall}
                  urgentMessage={txn.urgentMessage}
                  onResumed={handleTxnResumed}
                  compact
                />
              ))
            )}
          </div>

          <Link
            href="/risk-timeline"
            className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 pt-3 border-t border-slate-100"
          >
            <Clock className="w-4 h-4" />
            View full activity timeline
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Risk Score + Quick Actions */}
        <div className="space-y-4">
          {/* Current Risk */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-bold text-slate-800 mb-4">Current Risk Level</h2>
            <div className="flex flex-col items-center">
              <RiskScoreCard
                score={stats.currentRiskScore}
                riskLevel={stats.currentRiskLevel}
                confidence={0.95}
                showArc={true}
                size="lg"
              />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 text-center">
                Real-time risk based on recent activity momentum
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-bold text-slate-800 mb-3">Quick Scan</h2>
            <div className="space-y-2">
              <QuickAction href="/url-scanner" icon="🔗" label="Scan URL" description="Check suspicious links" />
              <QuickAction href="/qr-scanner" icon="📱" label="Scan QR Code" description="Verify QR payments" />
              <QuickAction href="/document-scanner" icon="📄" label="Scan Document" description="Check documents" />
              <QuickAction href="/demo" icon="⚡" label="Demo Mode" description="See SENTRA in action" highlight />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Fraud Events */}
      {recentAlerts.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-800">Recent Fraud Alerts</h2>
              <p className="text-xs text-slate-500">Live SENTRA intelligence feed</p>
            </div>
            <Link href="/guardian" className="text-xs text-rose-600 font-medium flex items-center gap-1">
              Guardian Center <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentAlerts.slice(0, 4).map(event => {
              const config = getRiskLevelConfig(event.severity)
              return (
                <div
                  key={event.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl border transition-all',
                    event.acknowledged ? 'border-slate-200 bg-slate-50' : cn(config.border, config.bg)
                  )}
                >
                  <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', config.dot, !event.acknowledged && 'animate-pulse')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('text-xs font-semibold', event.acknowledged ? 'text-slate-500' : config.color)}>
                        {event.eventType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                      {!event.acknowledged && (
                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">New Alert</span>
                      )}
                      <span className="text-xs text-slate-400 font-mono">Score: {Math.round(event.riskScore)}/100</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{event.description}</p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{formatRelativeTime(event.timestamp)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Risk Pattern Preview */}
      {timelineEvents.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-800">Live Payment Pattern</h2>
              <p className="text-xs text-slate-500">Real-time risk trajectory across recent transactions</p>
            </div>
            <Link href="/timeline" className="text-xs text-blue-600 font-medium flex items-center gap-1">
              Full Timeline <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <PatternTimeline
            events={timelineEvents}
            showInsight
            insightText="SENTRA evaluates payments contextually. Notice how sequential transfers and social engineering signals accumulate momentum, triggering protective intervention before significant losses occur."
          />
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  suffix,
  highlight,
}: {
  label: string
  value: number
  icon: any
  iconColor: string
  iconBg: string
  suffix?: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'bg-white border rounded-2xl p-4 transition-all',
        highlight ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 font-medium">{label}</span>
        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon className={cn('w-3.5 h-3.5', iconColor)} />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      {suffix && <div className="text-xs text-slate-400 mt-0.5">{suffix}</div>}
    </div>
  )
}

function QuickAction({
  href,
  icon,
  label,
  description,
  highlight,
}: {
  href: string
  icon: string
  label: string
  description: string
  highlight?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-150',
        highlight
          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
          : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
      )}
    >
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-slate-800">{label}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
    </Link>
  )
}
