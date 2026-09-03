'use client'

import { cn, getRiskLevelConfig } from '@/lib/utils'
import { RiskLevel, DemoScenario } from '@/types'
import { Play, CheckCircle, Loader2 } from 'lucide-react'

interface DemoScenarioCardProps {
  scenario: DemoScenario
  isActive?: boolean
  isCompleted?: boolean
  isLoading?: boolean
  onPlay?: (id: string) => void
  className?: string
}

const RISK_LEVEL_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  normal: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  kyc_scam: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  repeated_small: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  suspicious_url: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  qr_scam: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  document_scam: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
}

export function DemoScenarioCard({
  scenario,
  isActive,
  isCompleted,
  isLoading,
  onPlay,
  className,
}: DemoScenarioCardProps) {
  const colors = RISK_LEVEL_COLORS[scenario.category] ?? RISK_LEVEL_COLORS.normal

  return (
    <div
      className={cn(
        'rounded-xl border-2 p-5 transition-all duration-200 cursor-pointer',
        isActive
          ? cn(colors.border, colors.bg, 'shadow-md')
          : isCompleted
          ? 'border-emerald-300 bg-emerald-50'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
        className
      )}
      onClick={() => onPlay?.(scenario.id)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="text-2xl">{scenario.icon}</div>
        <div>
          {isCompleted ? (
            <div className="flex items-center gap-1 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Done</span>
            </div>
          ) : isLoading ? (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          ) : (
            <button
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                isActive ? cn(colors.text, colors.bg, 'border', colors.border) : 'bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600'
              )}
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <h3 className="font-bold text-slate-800 text-sm mb-1">{scenario.title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{scenario.description}</p>

      {/* Steps preview */}
      <div className="mt-3 flex items-center gap-1">
        {scenario.steps.slice(0, 4).map((step, i) => {
          const config = getRiskLevelConfig(step.riskLevel)
          return (
            <div
              key={i}
              className={cn('flex-1 h-1.5 rounded-full', config.dot)}
              title={`Step ${i + 1}: ${step.riskLevel}`}
            />
          )
        })}
      </div>
    </div>
  )
}
