'use client'

import { cn, getRiskLevelConfig } from '@/lib/utils'
import { RiskLevel } from '@/types'
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react'

interface SafetyStatusCardProps {
  riskLevel: RiskLevel
  riskScore: number
  userName?: string
  message?: string
  className?: string
}

const STATUS_ICONS = {
  safe: ShieldCheck,
  caution: Shield,
  suspicious: AlertTriangle,
  high_risk: ShieldAlert,
  critical: AlertOctagon,
}

const STATUS_MESSAGES = {
  safe: {
    title: 'PROTECTED',
    subtitle: 'No immediate threats detected.',
    detail: 'Your financial activity is within normal parameters. SENTRA is actively monitoring.',
  },
  caution: {
    title: 'ATTENTION',
    subtitle: 'Minor risk signals detected.',
    detail: 'Some patterns warrant your attention. Review recent activity and verify recipients.',
  },
  suspicious: {
    title: 'SUSPICIOUS ACTIVITY',
    subtitle: 'A suspicious payment pattern requires review.',
    detail: 'SENTRA has detected signals that may indicate fraud risk. Please review carefully.',
  },
  high_risk: {
    title: 'HIGH RISK DETECTED',
    subtitle: 'A suspicious payment has been paused.',
    detail: 'Multiple risk factors were detected. Your transaction requires confirmation before proceeding.',
  },
  critical: {
    title: 'CRITICAL ALERT',
    subtitle: 'Immediate attention required.',
    detail: 'SENTRA has detected a critical fraud pattern. Your guardian has been notified.',
  },
}

export function SafetyStatusCard({
  riskLevel,
  riskScore,
  userName,
  message,
  className,
}: SafetyStatusCardProps) {
  const config = getRiskLevelConfig(riskLevel)
  const Icon = STATUS_ICONS[riskLevel]
  const status = STATUS_MESSAGES[riskLevel]
  const isCritical = riskLevel === 'critical' || riskLevel === 'high_risk'

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-6',
        config.border,
        className
      )}
    >
      {/* Background gradient */}
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-40', config.gradient)} />
      
      {/* Animated indicator for critical */}
      {isCritical && (
        <div className="absolute top-4 right-4">
          <span className="relative flex h-3 w-3">
            <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', config.dot)} />
            <span className={cn('relative inline-flex rounded-full h-3 w-3', config.dot)} />
          </span>
        </div>
      )}

      <div className="relative flex items-start gap-4">
        {/* Icon */}
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', config.bg, 'border', config.border)}>
          <Icon className={cn('w-6 h-6', config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className={cn('text-lg font-bold tracking-wide', config.color)}>
              {status.title}
            </h2>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-bold', config.badge)}>
              Score: {Math.round(riskScore)}
            </span>
          </div>
          <p className="font-semibold text-slate-800 mt-0.5">{status.subtitle}</p>
          <p className="text-sm text-slate-600 mt-1">{message ?? status.detail}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative mt-4">
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-700', config.dot)}
            style={{ width: `${riskScore}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>Safe</span>
          <span>Critical</span>
        </div>
      </div>
    </div>
  )
}
