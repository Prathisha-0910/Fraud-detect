'use client'

import { PatternTimeline } from '@/components/sentra/PatternTimeline'
import { RiskScoreCard } from '@/components/sentra/RiskScoreCard'
import { DEMO_SUSPICIOUS_TRANSACTIONS } from '@/lib/demo-data'
import { formatCurrency } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUp, Shield, AlertOctagon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RiskLevel } from '@/types'

const TIMELINE_EVENTS = [
  {
    id: 'te_1',
    timestamp: '10:01 AM',
    amount: 2000,
    payee: 'Rajesh Kumar',
    riskScore: 20,
    riskLevel: 'caution' as RiskLevel,
    signals: ['New Recipient', 'First Contact'],
  },
  {
    id: 'te_2',
    timestamp: '10:07 AM',
    amount: 2000,
    payee: 'Rajesh Kumar',
    riskScore: 42,
    riskLevel: 'caution' as RiskLevel,
    signals: ['Repeated Amount', 'Suspicious Call'],
  },
  {
    id: 'te_3',
    timestamp: '10:15 AM',
    amount: 2000,
    payee: 'Rajesh Kumar',
    riskScore: 68,
    riskLevel: 'suspicious' as RiskLevel,
    signals: ['Pattern Detected', 'Urgency Pressure', 'Prior Warning'],
  },
  {
    id: 'te_4',
    timestamp: '10:21 AM',
    amount: 2500,
    payee: 'Rajesh Kumar',
    riskScore: 92,
    riskLevel: 'critical' as RiskLevel,
    signals: ['CRITICAL', 'Connected Pattern', 'Transaction Paused'],
    isIntervention: true,
    interventionMessage: 'SENTRA detected a connected fraud pattern. This transaction has been paused. ₹8,500 in total exposure detected across 4 linked transactions in 20 minutes.',
  },
]

const CHART_DATA = [
  { time: '10:00', score: 0, label: 'Baseline' },
  { time: '10:01', score: 20, label: '₹2,000' },
  { time: '10:07', score: 42, label: '₹2,000' },
  { time: '10:15', score: 68, label: '₹2,000' },
  { time: '10:21', score: 92, label: '₹2,500' },
]

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
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Payment Pattern Timeline</h1>
        <p className="text-slate-500 mt-0.5">
          See how risk evolves through connected transactions over time
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">4</div>
          <div className="text-xs text-slate-500">Connected Transactions</div>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4 text-center bg-red-50">
          <div className="text-2xl font-bold text-red-700">₹8,500</div>
          <div className="text-xs text-red-500">Total Exposure</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">20 min</div>
          <div className="text-xs text-slate-500">Time Window</div>
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
            <p className="text-xs text-slate-500">How SENTRA's risk score accumulated across transactions</p>
          </div>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CHART_DATA} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
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
          <PatternTimeline
            events={TIMELINE_EVENTS}
            showInsight
            insightText="SENTRA detected that these four individually small transactions form a connected risk pattern. Each transaction appeared safe in isolation, but the pattern reveals a coached payment scam."
          />
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
                <h3 className="font-bold text-slate-800">SENTRA Intervention</h3>
                <p className="text-xs text-rose-600 font-semibold">Transaction Paused</p>
              </div>
            </div>
            <RiskScoreCard
              score={92}
              riskLevel="critical"
              confidence={0.95}
              showArc
              size="md"
              className="mb-4"
            />
            <p className="text-sm text-slate-600 leading-relaxed">
              SENTRA detected that four individually small payments connected into a <strong>critical fraud pattern</strong>. Risk escalated from 20 to 92 in 20 minutes. The transaction was automatically paused.
            </p>
          </div>

          {/* Pattern breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-800 mb-3">Why This Pattern is Dangerous</h3>
            <div className="space-y-2">
              {[
                { icon: '🔄', text: 'Repeated identical amounts (₹2,000) to same new recipient', severity: 'caution' },
                { icon: '📞', text: 'Payment initiated during suspicious call context', severity: 'suspicious' },
                { icon: '⚡', text: 'High transaction velocity — 4 payments in 20 minutes', severity: 'high_risk' },
                { icon: '📈', text: 'Cumulative exposure reached ₹8,500 — beyond safe threshold', severity: 'critical' },
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
              "Each ₹2,000 payment looked safe individually. SENTRA connected them into evidence of a coordinated scam."
            </p>
            <p className="text-xs text-blue-300 mt-2 font-medium">Every Rupee Protected — Not Just the Big Ones</p>
          </div>
        </div>
      </div>
    </div>
  )
}
