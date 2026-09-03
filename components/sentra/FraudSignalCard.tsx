'use client'

import { cn, getRiskLevelConfig } from '@/lib/utils'
import { EventSeverity } from '@/types'
import { AlertTriangle, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react'

interface FraudSignalCardProps {
  type: string
  severity: EventSeverity
  score: number
  description: string
  detail?: string
  onClick?: () => void
  className?: string
}

const SEVERITY_ICONS = {
  info: Info,
  caution: AlertCircle,
  suspicious: AlertTriangle,
  high_risk: XCircle,
  critical: XCircle,
}

const SEVERITY_MAP: Record<EventSeverity, 'safe' | 'caution' | 'suspicious' | 'high_risk' | 'critical'> = {
  info: 'safe',
  caution: 'caution',
  suspicious: 'suspicious',
  high_risk: 'high_risk',
  critical: 'critical',
}

const SIGNAL_TYPE_LABELS: Record<string, string> = {
  suspicious_call: 'Suspicious Call Context',
  urgent_message: 'Urgency Pressure',
  suspicious_url: 'Malicious URL',
  new_payee: 'New Recipient',
  previous_warning: 'Prior Warning',
  velocity_alert: 'Transaction Velocity',
  reputation_concern: 'Reputation Risk',
  document_risk: 'Document Alert',
  cumulative_risk: 'Cumulative Exposure',
  repeated_payment: 'Repeated Payment',
  fan_out: 'Fan-out Pattern',
}

export function FraudSignalCard({
  type,
  severity,
  score,
  description,
  detail,
  onClick,
  className,
}: FraudSignalCardProps) {
  const riskLevel = SEVERITY_MAP[severity]
  const config = getRiskLevelConfig(riskLevel)
  const Icon = SEVERITY_ICONS[severity]
  const label = SIGNAL_TYPE_LABELS[type] ?? type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all duration-150',
        config.border,
        config.bg,
        onClick && 'cursor-pointer hover:shadow-sm',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/50')}>
          <Icon className={cn('w-4 h-4', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className={cn('text-sm font-semibold', config.color)}>{label}</span>
            <div className="flex items-center gap-1">
              <div className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
              <span className="text-xs font-bold text-slate-600">+{Math.round(score)}</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{description}</p>
          {detail && (
            <p className="text-xs text-slate-400 mt-1">{detail}</p>
          )}
        </div>
      </div>
    </div>
  )
}
