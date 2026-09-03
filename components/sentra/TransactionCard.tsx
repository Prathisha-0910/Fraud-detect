'use client'

import { cn, getRiskLevelConfig, formatCurrency, formatRelativeTime } from '@/lib/utils'
import { RiskLevel } from '@/types'
import { ArrowUpRight, Clock, User, AlertCircle } from 'lucide-react'

interface TransactionCardProps {
  id: string
  amount: number
  payee: string
  payeeIsNew?: boolean
  timestamp: Date | string
  riskScore?: number
  riskLevel?: RiskLevel
  status?: string
  suspiciousCall?: boolean
  urgentMessage?: boolean
  onClick?: () => void
  className?: string
  compact?: boolean
}

export function TransactionCard({
  id,
  amount,
  payee,
  payeeIsNew,
  timestamp,
  riskScore,
  riskLevel = 'safe',
  status = 'completed',
  suspiciousCall,
  urgentMessage,
  onClick,
  className,
  compact = false,
}: TransactionCardProps) {
  const config = getRiskLevelConfig(riskLevel)
  const hasRisk = (riskScore ?? 0) > 25

  return (
    <div
      className={cn(
        'bg-white border rounded-xl p-4 transition-all duration-150 cursor-pointer',
        hasRisk ? cn(config.border, 'hover:shadow-md') : 'border-slate-200 hover:border-slate-300 hover:shadow-sm',
        compact ? 'p-3' : 'p-4',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Payee info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
            hasRisk ? cn(config.bg) : 'bg-slate-100'
          )}>
            <User className={cn('w-4 h-4', hasRisk ? config.color : 'text-slate-500')} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-800 text-sm truncate">{payee}</span>
              {payeeIsNew && (
                <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                  New
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">{formatRelativeTime(timestamp)}</span>
              {(suspiciousCall || urgentMessage) && (
                <AlertCircle className="w-3 h-3 text-amber-500" />
              )}
            </div>
          </div>
        </div>

        {/* Right: Amount + Risk */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-bold text-slate-800 text-sm">{formatCurrency(amount)}</span>
          </div>
          {riskScore !== undefined && (
            <div className="flex items-center gap-1.5">
              <div className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
              <span className={cn('text-xs font-semibold', config.color)}>
                {config.label}
              </span>
            </div>
          )}
          {status === 'paused' && (
            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">
              Paused
            </span>
          )}
        </div>
      </div>

      {/* Risk bar */}
      {riskScore !== undefined && hasRisk && !compact && (
        <div className="mt-3">
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full', config.dot)}
              style={{ width: `${riskScore}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
