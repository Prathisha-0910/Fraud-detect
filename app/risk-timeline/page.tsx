'use client'

import { useState, useMemo } from 'react'
import { useLivePoll } from '@/lib/hooks/useLivePoll'
import { getRiskLevelConfig, formatCurrency, formatRelativeTime } from '@/lib/utils'
import { RiskLevel } from '@/types'
import { Clock, Filter, ShoppingCart, UserPlus, Phone, AlertTriangle, ArrowUpRight, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'today' | '24h' | '7d'

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
  riskAssessment?: {
    intervention: string
    explanation: string
  }
}

const EVENT_TYPE_CONFIG = {
  payment: { icon: ArrowUpRight, label: 'Payment', color: 'text-blue-500', bg: 'bg-blue-50' },
  new_contact: { icon: UserPlus, label: 'New Contact', color: 'text-amber-500', bg: 'bg-amber-50' },
  context: { icon: Phone, label: 'Suspicious Context', color: 'text-orange-500', bg: 'bg-orange-50' },
  intervention: { icon: Shield, label: 'SENTRA Action', color: 'text-red-500', bg: 'bg-red-50' },
  safe_payment: { icon: ShoppingCart, label: 'Safe Payment', color: 'text-emerald-500', bg: 'bg-emerald-50' },
}

export default function RiskTimelinePage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const { data: txnsData } = useLivePoll<{
    success: boolean
    count: number
    transactions: TransactionItem[]
  }>('/api/transactions?userId=demo-user&limit=50', 5000)

  const rawTransactions = useMemo(() => txnsData?.transactions ?? [], [txnsData])

  const allEvents = useMemo(() => {
    return rawTransactions.map(t => {
      let type: 'intervention' | 'context' | 'new_contact' | 'safe_payment' | 'payment' = 'payment'

      if (t.status === 'paused' || t.status === 'blocked') {
        type = 'intervention'
      } else if (t.suspiciousCall || t.urgentMessage) {
        type = 'context'
      } else if (t.payeeIsNew) {
        type = 'new_contact'
      } else if (t.riskLevel === 'safe') {
        type = 'safe_payment'
      }

      const description =
        t.riskAssessment?.explanation ||
        (t.status === 'paused'
          ? 'Transaction paused under safety cooldown'
          : t.status === 'blocked'
          ? 'Transaction blocked; guardian alert dispatched'
          : t.suspiciousCall
          ? 'Payment made during suspicious incoming call'
          : t.payeeIsNew
          ? 'Payment to newly registered recipient'
          : 'Standard transfer')

      return {
        id: t.id,
        type,
        amount: t.amount,
        payee: t.payee,
        timestamp: new Date(t.timestamp),
        riskScore: t.riskScore ?? 0,
        riskLevel: t.riskLevel ?? 'safe',
        description,
      }
    })
  }, [rawTransactions])

  const filteredEvents = useMemo(() => {
    const now = Date.now()
    return allEvents.filter(event => {
      const age = now - event.timestamp.getTime()
      if (filter === 'today') return age < 86400000 && event.timestamp.getDate() === new Date().getDate()
      if (filter === '24h') return age < 86400000
      if (filter === '7d') return age < 7 * 86400000
      return true
    })
  }, [allEvents, filter])

  const stats = useMemo(() => ({
    total: filteredEvents.length,
    safe: filteredEvents.filter(e => e.riskLevel === 'safe').length,
    suspicious: filteredEvents.filter(e => ['suspicious', 'high_risk', 'critical'].includes(e.riskLevel)).length,
    interventions: filteredEvents.filter(e => e.type === 'intervention').length,
  }), [filteredEvents])

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Risk Timeline</h1>
          <p className="text-slate-500 mt-0.5">Chronological view of all financial activity and SENTRA events</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Polling
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Events', value: stats.total, color: 'text-slate-700' },
          { label: 'Safe', value: stats.safe, color: 'text-emerald-600' },
          { label: 'Suspicious', value: stats.suspicious, color: 'text-red-500' },
          { label: 'Interventions', value: stats.interventions, color: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-3 text-center">
            <div className={cn('text-xl font-bold', s.color)}>{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
        {(['all', 'today', '24h', '7d'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {f === 'all' ? 'All Activity' : f === 'today' ? 'Today' : f === '24h' ? 'Last 24h' : 'Last 7 Days'}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />

          <div className="space-y-3">
            {filteredEvents.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No events recorded in this time range</p>
              </div>
            )}

            {filteredEvents.map(event => {
              const riskConfig = getRiskLevelConfig(event.riskLevel)
              const typeConfig = EVENT_TYPE_CONFIG[event.type] ?? EVENT_TYPE_CONFIG.payment
              const Icon = typeConfig.icon
              const isIntervention = event.type === 'intervention'

              return (
                <div
                  key={event.id}
                  className={cn(
                    'relative flex gap-4 pl-12 transition-all',
                    hoveredId === event.id && 'opacity-100',
                    isIntervention && 'z-10'
                  )}
                  onMouseEnter={() => setHoveredId(event.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Node */}
                  <div
                    className={cn(
                      'absolute left-3 w-5 h-5 -translate-x-1/2 rounded-full border-2 flex items-center justify-center',
                      isIntervention
                        ? 'bg-red-100 border-red-400 w-6 h-6 -left-0.5'
                        : cn('bg-white border-slate-300', riskConfig.border)
                    )}
                  >
                    <Icon className={cn('w-2.5 h-2.5', isIntervention ? 'text-red-600' : riskConfig.color)} />
                  </div>

                  {/* Event card */}
                  <div
                    className={cn(
                      'flex-1 rounded-xl border p-3 transition-all duration-150',
                      isIntervention
                        ? 'border-red-300 bg-red-50 shadow-sm'
                        : hoveredId === event.id
                        ? cn(riskConfig.border, riskConfig.bg)
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          'text-xs font-semibold px-2 py-0.5 rounded-full',
                          isIntervention ? 'bg-red-100 text-red-700' : cn(typeConfig.bg, 'text-slate-700')
                        )}>
                          {isIntervention ? '⚡ SENTRA INTERVENES' : typeConfig.label}
                        </span>
                        <span className={cn('text-xs font-bold', riskConfig.color)}>
                          {riskConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-mono">
                          {formatRelativeTime(event.timestamp)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1.5 gap-2 flex-wrap">
                      <div>
                        {event.amount && (
                          <span className="font-bold text-slate-800 text-sm">{formatCurrency(event.amount)}</span>
                        )}
                        {event.payee && (
                          <span className="text-xs text-slate-500 ml-2">→ {event.payee}</span>
                        )}
                        {event.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={cn('w-1.5 h-1.5 rounded-full', riskConfig.dot)} />
                        <span className="text-xs text-slate-500">Risk {Math.round(event.riskScore)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
