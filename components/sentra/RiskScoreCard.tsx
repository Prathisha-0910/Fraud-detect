'use client'

import { cn, getRiskLevelConfig } from '@/lib/utils'
import { RiskLevel } from '@/types'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface RiskScoreCardProps {
  score: number
  riskLevel: RiskLevel
  confidence?: number
  label?: string
  previousScore?: number
  size?: 'sm' | 'md' | 'lg'
  showArc?: boolean
  className?: string
}

export function RiskScoreCard({
  score,
  riskLevel,
  confidence,
  label = 'Risk Score',
  previousScore,
  size = 'md',
  showArc = true,
  className,
}: RiskScoreCardProps) {
  const config = getRiskLevelConfig(riskLevel)
  const roundedScore = Math.round(score)
  
  // SVG arc calculation
  const radius = size === 'lg' ? 52 : size === 'md' ? 40 : 28
  const strokeWidth = size === 'lg' ? 8 : size === 'md' ? 6 : 4
  const circumference = 2 * Math.PI * radius
  const arc = circumference * 0.75 // 75% arc
  const offset = arc - (roundedScore / 100) * arc

  const strokeColors: Record<RiskLevel, string> = {
    safe: '#10b981',
    caution: '#f59e0b',
    suspicious: '#f97316',
    high_risk: '#ef4444',
    critical: '#e11d48',
  }
  const strokeColor = strokeColors[riskLevel]

  const sizeDim = size === 'lg' ? 130 : size === 'md' ? 100 : 70
  const center = sizeDim / 2

  const trend =
    previousScore !== undefined
      ? roundedScore > previousScore
        ? 'up'
        : roundedScore < previousScore
        ? 'down'
        : 'same'
      : null

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {label && (
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      )}
      
      {showArc ? (
        <div className="relative" style={{ width: sizeDim, height: sizeDim * 0.75 }}>
          <svg
            width={sizeDim}
            height={sizeDim}
            viewBox={`0 0 ${sizeDim} ${sizeDim}`}
            className="-rotate-[135deg]"
          >
            {/* Background track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
              strokeDasharray={`${arc} ${circumference}`}
              strokeLinecap="round"
            />
            {/* Score arc */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arc} ${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="score-ring"
            />
          </svg>
          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingBottom: '25%' }}>
            <span
              className={cn(
                'font-bold tabular-nums',
                size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-lg',
                config.color
              )}
            >
              {roundedScore}
            </span>
            <span className="text-xs text-slate-400">/100</span>
          </div>
        </div>
      ) : (
        <div className={cn('font-bold tabular-nums', size === 'lg' ? 'text-4xl' : 'text-2xl', config.color)}>
          {roundedScore}
        </div>
      )}

      {/* Risk level badge */}
      <div className={cn('px-3 py-1 rounded-full text-xs font-bold tracking-wider', config.badge)}>
        {config.label}
      </div>

      {/* Trend indicator */}
      {trend && (
        <div className="flex items-center gap-1 text-xs">
          {trend === 'up' && <TrendingUp className="w-3 h-3 text-red-500" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3 text-emerald-500" />}
          {trend === 'same' && <Minus className="w-3 h-3 text-slate-400" />}
          <span className={cn(
            trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-emerald-500' : 'text-slate-400'
          )}>
            {trend === 'up' ? `+${roundedScore - (previousScore ?? 0)}` : trend === 'down' ? `${roundedScore - (previousScore ?? 0)}` : 'No change'}
          </span>
        </div>
      )}

      {/* Confidence */}
      {confidence !== undefined && (
        <div className="text-xs text-slate-400">
          {Math.round(confidence * 100)}% confidence
        </div>
      )}
    </div>
  )
}
