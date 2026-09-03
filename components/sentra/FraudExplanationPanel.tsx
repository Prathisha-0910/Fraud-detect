'use client'

import { cn, getRiskLevelConfig, getInterventionConfig } from '@/lib/utils'
import { RiskLevel, InterventionType, RiskSignal } from '@/types'
import { FraudSignalCard } from './FraudSignalCard'
import { Info } from 'lucide-react'

interface FraudExplanationPanelProps {
  riskLevel: RiskLevel
  riskScore: number
  confidence: number
  explanation: string
  detectedSignals: RiskSignal[]
  intervention: InterventionType
  className?: string
}

export function FraudExplanationPanel({
  riskLevel,
  riskScore,
  confidence,
  explanation,
  detectedSignals,
  intervention,
  className,
}: FraudExplanationPanelProps) {
  const config = getRiskLevelConfig(riskLevel)
  const interventionConfig = getInterventionConfig(intervention)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Explanation */}
      <div className={cn('rounded-xl border p-4', config.border, config.bg)}>
        <div className="flex items-start gap-3">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/70')}>
            <Info className={cn('w-4 h-4', config.color)} />
          </div>
          <div>
            <p className={cn('text-sm font-semibold mb-1', config.color)}>
              SENTRA Analysis
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">{explanation}</p>
          </div>
        </div>
      </div>

      {/* Intervention recommendation */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Recommended Action</p>
            <p className="font-bold text-slate-800 mt-0.5">{interventionConfig.label}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Confidence</p>
            <p className="font-semibold text-slate-700">{Math.round(confidence * 100)}%</p>
          </div>
        </div>
      </div>

      {/* Signals */}
      {detectedSignals.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-2">
            {detectedSignals.length} Signal{detectedSignals.length > 1 ? 's' : ''} Detected
          </h4>
          <div className="space-y-2">
            {detectedSignals.map((signal, i) => (
              <FraudSignalCard
                key={i}
                type={signal.type}
                severity={signal.severity}
                score={signal.score}
                description={signal.description}
              />
            ))}
          </div>
        </div>
      )}

      {detectedSignals.length === 0 && (
        <div className="text-center py-4 text-slate-400 text-sm">
          No fraud signals detected for this transaction.
        </div>
      )}
    </div>
  )
}
