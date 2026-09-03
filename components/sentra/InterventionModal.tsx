'use client'

import { cn, getRiskLevelConfig, getInterventionConfig } from '@/lib/utils'
import { RiskLevel, InterventionType, RiskSignal } from '@/types'
import { X, ArrowLeft, RotateCcw, UserCheck, AlertOctagon, ChevronRight } from 'lucide-react'
import { RiskScoreCard } from './RiskScoreCard'
import { FraudSignalCard } from './FraudSignalCard'

interface InterventionModalProps {
  isOpen: boolean
  onClose: () => void
  onGoBack?: () => void
  onContinue?: () => void
  onGuardian?: () => void
  riskLevel: RiskLevel
  riskScore: number
  confidence: number
  explanation: string
  detectedSignals: RiskSignal[]
  intervention: InterventionType
  payee?: string
  amount?: number
}

export function InterventionModal({
  isOpen,
  onClose,
  onGoBack,
  onContinue,
  onGuardian,
  riskLevel,
  riskScore,
  confidence,
  explanation,
  detectedSignals,
  intervention,
  payee,
  amount,
}: InterventionModalProps) {
  if (!isOpen) return null

  const config = getRiskLevelConfig(riskLevel)
  const interventionConfig = getInterventionConfig(intervention)
  const isCritical = riskLevel === 'critical' || riskLevel === 'high_risk'
  const isPaused = intervention === 'pause' || intervention === 'guardian_review'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-in">
        {/* Header */}
        <div className={cn('rounded-t-2xl p-6 border-b', config.bg, config.border)}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {isCritical ? (
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertOctagon className="w-5 h-5 text-red-600" />
                </div>
              ) : (
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', config.bg, 'border', config.border)}>
                  <span className="text-lg">⚠️</span>
                </div>
              )}
              <div>
                <h2 className={cn('font-bold text-lg', config.color)}>
                  {isPaused ? 'Transaction Paused' : 'This Payment Looks Unusual'}
                </h2>
                <p className="text-sm text-slate-600">{interventionConfig.description}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/50 rounded-lg transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Risk score */}
          <div className="flex items-center gap-4 justify-center">
            <RiskScoreCard
              score={riskScore}
              riskLevel={riskLevel}
              confidence={confidence}
              showArc={true}
              size="md"
            />
            {payee && amount && (
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">
                  ₹{amount.toLocaleString('en-IN')}
                </div>
                <div className="text-sm text-slate-500">to {payee}</div>
              </div>
            )}
          </div>

          {/* What SENTRA noticed */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <span>🔍</span> What SENTRA Noticed
            </h3>
            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed">
              {explanation}
            </p>
          </div>

          {/* Detected signals */}
          {detectedSignals.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Risk Signals Detected</h3>
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

          {/* What to do */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 What You Can Do</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Verify the recipient's identity independently</li>
              <li>• Do not share OTPs or bank details with anyone</li>
              <li>• Call your bank directly if you received a suspicious call</li>
              {isCritical && <li>• Consider asking a trusted family member to review</li>}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-100 space-y-2">
          {onGuardian && (
            <button
              onClick={onGuardian}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              Ask Trusted Guardian
            </button>
          )}
          {!isPaused && onContinue && (
            <button
              onClick={onContinue}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
            >
              Continue Anyway
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onGoBack ?? onClose}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-600 font-medium py-2.5 px-4 rounded-xl transition-colors border border-slate-200 text-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
