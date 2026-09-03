'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SafetyStatusCard } from '@/components/sentra/SafetyStatusCard'
import { TransactionCard } from '@/components/sentra/TransactionCard'
import { RiskScoreCard } from '@/components/sentra/RiskScoreCard'
import { PatternTimeline } from '@/components/sentra/PatternTimeline'
import { RiskIndicator } from '@/components/sentra/RiskIndicator'
import {
  DEMO_SAFETY_STATS,
  ALL_DEMO_TRANSACTIONS,
  DEMO_FRAUD_EVENTS,
  DEMO_TIMELINE_EVENTS,
} from '@/lib/demo-data'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const greeting = getGreeting()
  const stats = DEMO_SAFETY_STATS
  const recentTransactions = ALL_DEMO_TRANSACTIONS.slice(0, 5)

  // Timeline events for dashboard preview
  const timelineEvents = DEMO_TIMELINE_EVENTS.slice(-5).map(e => ({
    id: e.id,
    timestamp: e.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    amount: e.amount,
    payee: e.payee,
    riskScore: e.riskScore,
    riskLevel: e.riskLevel,
    signals: e.type === 'context' ? ['Suspicious Call'] : e.type === 'intervention' ? ['Pattern Detected'] : [],
    isIntervention: e.type === 'intervention',
    interventionMessage: 'SENTRA detected a connected fraud pattern and paused the transaction.',
  }))

  const activeAlerts = DEMO_FRAUD_EVENTS.filter(e => !e.acknowledged).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-slide-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {greeting} 👋
        </h1>
        <p className="text-slate-500 mt-0.5">Your financial safety is being monitored by SENTRA.</p>
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
          label="Paused"
          value={stats.blockedCount}
          icon={XCircle}
          iconColor="text-red-500"
          iconBg="bg-red-50"
          suffix="transactions"
        />
        <StatCard
          label="Active Alerts"
          value={activeAlerts}
          icon={Activity}
          iconColor="text-rose-500"
          iconBg="bg-rose-50"
          suffix="unread"
          highlight={activeAlerts > 0}
        />
      </div>

      {/* Main grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-800">Recent Transactions</h2>
              <p className="text-xs text-slate-500">Risk-scored by SENTRA</p>
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
            {recentTransactions.map(txn => (
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
                suspiciousCall={txn.suspiciousCall}
                urgentMessage={txn.urgentMessage}
                compact
              />
            ))}
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

        {/* Risk Score + Recent Alerts */}
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
                Risk score based on last 24h activity
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
      {DEMO_FRAUD_EVENTS.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-800">Recent Fraud Alerts</h2>
              <p className="text-xs text-slate-500">SENTRA intelligence events</p>
            </div>
            <Link href="/intelligence" className="text-xs text-blue-600 font-medium flex items-center gap-1">
              View Intel Center <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {DEMO_FRAUD_EVENTS.slice(0, 3).map(event => {
              const config = getRiskLevelConfig(event.severity)
              return (
                <div
                  key={event.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl border',
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
                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">New</span>
                      )}
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
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-slate-800">Payment Pattern</h2>
            <p className="text-xs text-slate-500">How risk escalated over recent transactions</p>
          </div>
          <Link href="/timeline" className="text-xs text-blue-600 font-medium flex items-center gap-1">
            Full Timeline <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <PatternTimeline
          events={timelineEvents}
          showInsight
          insightText="SENTRA detected that four individually small payments to a new recipient — each ₹2,000 or less — formed a connected fraud pattern. The risk accumulated from 20 to 92 across just 25 minutes."
        />
      </div>
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
  icon: React.ElementType
  iconColor: string
  iconBg: string
  suffix?: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border p-4',
        highlight ? 'border-red-200' : 'border-slate-200'
      )}
    >
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', iconBg)}>
        <Icon className={cn('w-4 h-4', iconColor)} />
      </div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      {suffix && <div className="text-xs text-slate-400">{suffix}</div>}
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
        'flex items-center gap-3 p-2.5 rounded-lg transition-all',
        highlight
          ? 'bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
          : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
      )}
    >
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className={cn('text-sm font-medium', highlight ? 'text-indigo-700' : 'text-slate-700')}>{label}</div>
        <div className="text-xs text-slate-400">{description}</div>
      </div>
      <ArrowRight className={cn('w-3.5 h-3.5', highlight ? 'text-indigo-400' : 'text-slate-300')} />
    </Link>
  )
}
