'use client'

import { cn, getRiskLevelConfig, formatCurrency } from '@/lib/utils'
import { RiskLevel } from '@/types'
import { ArrowDown, AlertOctagon, CheckCircle } from 'lucide-react'

interface TimelineEvent {
  id: string
  timestamp: string
  amount?: number
  payee?: string
  riskScore: number
  riskLevel: RiskLevel
  signals?: string[]
  isIntervention?: boolean
  interventionMessage?: string
}

interface PatternTimelineProps {
  events: TimelineEvent[]
  showInsight?: boolean
  insightText?: string
  className?: string
}

export function PatternTimeline({ events, showInsight, insightText, className }: PatternTimelineProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {events.map((event, index) => {
        const config = getRiskLevelConfig(event.riskLevel)
        const isLast = index === events.length - 1
        const prevScore = index > 0 ? events[index - 1].riskScore : undefined
        const increased = prevScore !== undefined && event.riskScore > prevScore

        if (event.isIntervention) {
          return (
            <div key={event.id} className="relative pl-12 py-3">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-red-100 border-2 border-red-400 rounded-full flex items-center justify-center">
                <AlertOctagon className="w-4 h-4 text-red-600" />
              </div>
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-red-700 tracking-wide">⚡ SENTRA INTERVENES</span>
                </div>
                <p className="text-sm text-red-600">{event.interventionMessage}</p>
              </div>
            </div>
          )
        }

        return (
          <div key={event.id} className="relative flex gap-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 bg-white shadow-sm',
                config.border,
                config.bg
              )}>
                {event.riskLevel === 'safe' ? (
                  <CheckCircle className={cn('w-4 h-4', config.color)} />
                ) : (
                  <span className={cn('text-xs font-bold', config.color)}>
                    {Math.round(event.riskScore)}
                  </span>
                )}
              </div>
              {!isLast && (
                <div className="flex-1 flex flex-col items-center gap-1 py-1">
                  <div className="w-px h-3 bg-slate-200" />
                  {increased && <ArrowDown className="w-3 h-3 text-slate-400" />}
                  <div className="w-px h-3 bg-slate-200" />
                </div>
              )}
            </div>

            {/* Event card */}
            <div className={cn(
              'flex-1 mb-3 rounded-xl border p-4 bg-white shadow-sm',
              config.border
            )}>
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono">{event.timestamp}</span>
                    {increased && prevScore !== undefined && (
                      <span className="text-xs text-red-500 font-semibold">
                        +{Math.round(event.riskScore - prevScore)} risk
                      </span>
                    )}
                  </div>
                  {event.amount !== undefined && (
                    <div className="text-lg font-bold text-slate-800 mt-0.5">
                      {formatCurrency(event.amount)}
                    </div>
                  )}
                  {event.payee && (
                    <div className="text-sm text-slate-500">to {event.payee}</div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn('text-xs font-bold px-2 py-1 rounded-full', config.badge)}>
                    {config.label}
                  </span>
                  <span className="text-xs text-slate-400">Score: {Math.round(event.riskScore)}</span>
                </div>
              </div>

              {/* Signals */}
              {event.signals && event.signals.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {event.signals.map((signal, i) => (
                    <span
                      key={i}
                      className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                    >
                      {signal}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* SENTRA Insight */}
      {showInsight && insightText && (
        <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-sm">🔍</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800 mb-1">SENTRA INSIGHT</p>
              <p className="text-sm text-blue-700">{insightText}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
