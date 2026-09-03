'use client'

import { cn, getRiskLevelConfig } from '@/lib/utils'
import { RiskLevel } from '@/types'

interface RiskIndicatorProps {
  level: RiskLevel
  score?: number
  size?: 'xs' | 'sm' | 'md'
  showLabel?: boolean
  animated?: boolean
  className?: string
}

export function RiskIndicator({
  level,
  score,
  size = 'sm',
  showLabel = true,
  animated,
  className,
}: RiskIndicatorProps) {
  const config = getRiskLevelConfig(level)
  const dotSize = size === 'xs' ? 'w-1.5 h-1.5' : size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'
  const textSize = size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className={cn('rounded-full', dotSize, config.dot, animated && 'animate-pulse')} />
      {showLabel && (
        <span className={cn('font-semibold', textSize, config.color)}>
          {config.label}
          {score !== undefined && ` (${Math.round(score)})`}
        </span>
      )}
    </div>
  )
}
