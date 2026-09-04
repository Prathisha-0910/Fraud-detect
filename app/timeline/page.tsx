'use client'

import { useMemo } from 'react'
import { PatternTimeline } from '@/components/sentra/PatternTimeline'
import { RiskScoreCard } from '@/components/sentra/RiskScoreCard'
import { useLivePoll } from '@/lib/hooks/useLivePoll'
import { formatCurrency } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUp, Shield, AlertOctagon, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RiskLevel } from '@/types'

interface TransactionRecord {
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
  riskAssessment?: {
    intervention: string
    explanation: string
  }
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    const score = payload[0].value
    const level = score > 85 ? 'CRITICAL' : score > 70 ? 'HIGH RISK' : score > 50 ? 'SUSPICIOUS' : score > 25 ? 'CAUTION' : 'SAFE'
    const color = score > 85 ? '#e11d48' : score > 70 ? '#ef4444' : score > 50 ? '#f97316' : score > 25 ? '#f59e0b' : '#10b981'
    return (
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 text-xs">
        <p className="font-bold text-slate-700">{label}</p>
        <p style={{ color }} className="font-bold text-lg">{score}</p>
        <p style={{ color }} className="font-semibold">{level}</p>
      </div>
    )
  }
  return null
}

export default function TimelinePage() {
  const { data: txnsData } = useLivePoll<{
    success: boolean
    count: number
    transactions: TransactionRecord[]
  }>('/api/transactions?userId=demo-user&limit=15', 5000)

  const transactions = useMemo(() => txnsData?.transactions ?? [], [txnsData])

  // Total exposure and metrics
  const totalExposure = useMemo(() => {
    return transactions.reduce((sum, t) => sum + t.amount, 0)
  }, [transactions])

  const chronologicalTxns = useMemo(() => {
    return [...transactions].reverse()
  }, [transactions])

  // Chart data from real transactions
  const chartData = useMemo(() => {
    if (chronologicalTxns.length === 0) {
      return [{ time: 'Start', score: 0, label: 'Baseline' }]
    }
    return chronologicalTxns.map((t, idx) => ({
      time: new Date(t.timestamp).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      score: Math.round(t.riskScore ?? 0),
      label: `Txn #${idx + 1}: ₹${t.amount.toLocaleString('en-IN')}`,
    }))
  }, [chronologicalTxns])

  // Timeline events for PatternTimeline
  const timelineEvents = useMemo(() => {
    return chronologicalTxns.map(t => ({
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
          ? 'SENTRA detected a cumulative risk pattern and applied a safety cooldown.'
          : t.status === 'blocked'
          ? 'SENTRA blocked the transaction and alerted guardians.'
          : undefined,
    }))
  }, [chronologicalTxns])

  const latestTxn = transactions[0]
  const latestScore = latestTxn ? Math.round(latestTxn.riskScore ?? 0) : 10
  const latestLevel = latestTxn?.riskLevel ?? 'safe'

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payment Pattern Timeline</h1>
          <p className="text-slate-500 mt-0.5">
            Live risk evolution across connected transactions in the database
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Polling (5s)
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{transactions.length}</div>
          <div className="text-xs text-slate-500">Connected Transactions</div>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4 text-center bg-red-50">
          <div className="text-2xl font-bold text-red-700">{formatCurrency(totalExposure)}</div>
          <div className="text-xs text-red-500">Total Exposure</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{latestScore}/100</div>
          <div className="text-xs text-slate-500">Current Risk Peak</div>
        </div>
      </div>

      {/* Risk Evolution Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Risk Score Evolution</h2>
            <p className="text-xs text-slate-500">Real-time risk trajectory from database submissions</p>
          </div>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={25} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Safe', fill: '#10b981', fontSize: 10 }} />
              <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Caution', fill: '#f59e0b', fontSize: 10 }} />
              <ReferenceLine y={70} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'Suspicious', fill: '#f97316', fontSize: 10 }} />
              <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'High Risk', fill: '#ef4444', fontSize: 10 }} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#e11d48"
                strokeWidth={2.5}
                fill="url(#riskGradient)"
                dot={{ fill: '#e11d48', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pattern Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-bold text-slate-800 mb-5">Transaction Sequence</h2>
          {timelineEvents.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No transactions recorded yet. Submit transactions in the Simulator to see the sequence.
            </div>
          ) : (
            <PatternTimeline
              events={timelineEvents}
              showInsight
              insightText="SENTRA connects sequentially linked transactions. Individual small transfers are aggregated into a contextual risk trajectory, triggering intervention before significant financial loss occurs."
            />
          )}
        </div>

        {/* Final assessment */}
        <div className="space-y-4">
          {/* Pattern summary */}
          <div className="bg-white rounded-2xl border-2 border-rose-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                <AlertOctagon className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Current Security Posture</h3>
                <p className="text-xs text-rose-600 font-semibold">
                  {latestTxn?.status === 'paused'
                    ? 'Transaction Paused (Safety Cooldown)'
                    : latestTxn?.status === 'blocked'
                    ? 'Transaction Blocked (Guardian Notified)'
                    : 'System Monitoring Active'}
                </p>
              </div>
            </div>
            <RiskScoreCard
              score={latestScore}
              riskLevel={latestLevel}
              confidence={0.95}
              showArc
              size="md"
              className="mb-4"
            />
            <p className="text-sm text-slate-600 leading-relaxed">
              SENTRA continuously re-evaluates risk. When repeated payments or social coercion indicators are detected, the cumulative momentum automatically blocks or pauses the transfer.
            </p>
          </div>

          {/* Pattern breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-800 mb-3">Core Detection Pillars</h3>
            <div className="space-y-2">
              {[
                { icon: '🔄', text: 'Repeated small payments bypass standard bank value thresholds', severity: 'caution' },
                { icon: '📞', text: 'Active call context indicates possible coercion or digital arrest scam', severity: 'suspicious' },
                { icon: '⚡', text: 'High velocity bursts signal psychological urgency manipulation', severity: 'high_risk' },
                { icon: '📈', text: 'Cumulative exposure tracking protects senior citizens and rural users', severity: 'critical' },
              ].map((item, i) => {
                const colors: Record<string, string> = {
                  caution: 'bg-amber-50 border-amber-200 text-amber-700',
                  suspicious: 'bg-orange-50 border-orange-200 text-orange-700',
                  high_risk: 'bg-red-50 border-red-200 text-red-700',
                  critical: 'bg-rose-50 border-rose-200 text-rose-700',
                }
                return (
                  <div key={i} className={cn('flex items-start gap-2 p-2.5 rounded-lg border text-sm', colors[item.severity])}>
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* SENTRA core message */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5" />
              <span className="font-bold text-sm">SENTRA Core Innovation</span>
            </div>
            <p className="text-sm text-blue-100 leading-relaxed">
              "Small payments look harmless in isolation. SENTRA connects them into evidence of a coordinated scam."
            </p>
            <p className="text-xs text-blue-300 mt-2 font-medium">Every Rupee Protected — Not Just the Big Ones</p>
          </div>
        </div>
      </div>
    </div>
  )
}
