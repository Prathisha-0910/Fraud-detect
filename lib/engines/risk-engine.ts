// SENTRA Central Risk Engine
// The core Intent and Pattern Engine that combines all signals

import {
  RiskAssessmentResult,
  RiskSignal,
  RiskLevel,
  InterventionType,
  DEFAULT_RISK_CONFIG,
  TransactionInput,
  VelocityAnalysis,
  ReputationAnalysis,
  DocumentAnalysis,
  EventSeverity,
} from '@/types'
import { scoreToRiskLevel, riskLevelToIntervention, clamp } from '@/lib/utils'

interface CumulativeContext {
  recentRiskScores: number[]
  previousWarnings: number
  cumulativeExposure: number
}

export class SentraRiskEngine {
  private config = DEFAULT_RISK_CONFIG

  /**
   * Calculate the main SENTRA risk score
   * This is the central engine that combines all signals
   */
  async calculateRisk(
    transaction: TransactionInput,
    cumulativeContext: CumulativeContext,
    velocityAnalysis?: VelocityAnalysis,
    reputationAnalysis?: ReputationAnalysis,
    documentAnalysis?: DocumentAnalysis
  ): Promise<RiskAssessmentResult> {
    const signals: RiskSignal[] = []
    const weights = this.config.weights

    // === CONTEXT RISK ===
    let contextScore = 0

    if (transaction.suspiciousCall) {
      contextScore += weights.suspiciousContext
      signals.push({
        type: 'suspicious_call',
        severity: 'suspicious',
        score: weights.suspiciousContext,
        description: 'Payment follows a suspicious call context',
      })
    }

    if (transaction.urgentMessage) {
      contextScore += weights.urgentMessage
      signals.push({
        type: 'urgent_message',
        severity: 'caution',
        score: weights.urgentMessage,
        description: 'Urgent message context detected before payment',
      })
    }

    if (transaction.suspiciousUrl) {
      contextScore += weights.suspiciousUrl
      signals.push({
        type: 'suspicious_url',
        severity: 'high_risk',
        score: weights.suspiciousUrl,
        description: 'Suspicious URL present in payment context',
      })
    }

    // === BEHAVIOUR RISK ===
    let behaviourScore = 0

    if (transaction.payeeIsNew) {
      behaviourScore += weights.newPayee
      signals.push({
        type: 'new_payee',
        severity: 'caution',
        score: weights.newPayee,
        description: `"${transaction.payee}" is a recently added recipient`,
      })
    }

    if (transaction.previousWarning) {
      behaviourScore += weights.previousWarning
      signals.push({
        type: 'previous_warning',
        severity: 'suspicious',
        score: weights.previousWarning,
        description: 'Previous fraud warning exists for this user',
      })
    }

    // === VELOCITY RISK ===
    let velocityScore = 0
    if (velocityAnalysis) {
      velocityScore = velocityAnalysis.velocityScore * 0.3 // Normalized contribution
      if (velocityAnalysis.velocityScore > 20) {
        signals.push({
          type: 'velocity_alert',
          severity: velocityAnalysis.velocityScore > 60 ? 'high_risk' : velocityAnalysis.velocityScore > 30 ? 'suspicious' : 'caution',
          score: velocityScore,
          description: velocityAnalysis.detectedPatterns[0] ?? 'Unusual transaction velocity',
        })
      }
    }

    // === REPUTATION RISK ===
    let reputationScore = 0
    if (reputationAnalysis) {
      reputationScore = reputationAnalysis.reputationScore * 0.5
      if (reputationAnalysis.reputationScore > 30) {
        signals.push({
          type: 'reputation_concern',
          severity: reputationAnalysis.reputationScore > 70 ? 'high_risk' : 'suspicious',
          score: reputationScore,
          description: reputationAnalysis.explanation,
        })
      }
    }

    // === DOCUMENT RISK ===
    let documentScore = 0
    if (documentAnalysis) {
      documentScore = documentAnalysis.documentScore * 0.5
      if (documentAnalysis.documentScore > 20) {
        const docSeverity: EventSeverity = documentAnalysis.riskLevel === 'safe'
          ? 'info'
          : documentAnalysis.riskLevel === 'caution'
          ? 'caution'
          : documentAnalysis.riskLevel === 'suspicious'
          ? 'suspicious'
          : documentAnalysis.riskLevel === 'high_risk'
          ? 'high_risk'
          : 'critical'
        signals.push({
          type: 'document_risk',
          severity: docSeverity,
          score: documentScore,
          description: `Document analysis: ${documentAnalysis.detectedIndicators[0]?.type ?? 'suspicious content'}`,
        })
      }
    }

    // === CUMULATIVE EXPOSURE ===
    let cumulativeScore = 0
    if (cumulativeContext.recentRiskScores.length > 0) {
      // Risk accumulates from recent suspicious transactions
      const recentAvg = cumulativeContext.recentRiskScores
        .slice(-5) // Last 5 transactions
        .reduce((a, b) => a + b, 0) / Math.min(cumulativeContext.recentRiskScores.length, 5)

      // Progressive accumulation model
      const accumFactor = Math.min(cumulativeContext.recentRiskScores.length * 0.1, 0.5)
      cumulativeScore = recentAvg * accumFactor

      if (cumulativeScore > 10) {
        signals.push({
          type: 'cumulative_risk',
          severity: cumulativeScore > 30 ? 'high_risk' : cumulativeScore > 15 ? 'suspicious' : 'caution',
          score: cumulativeScore,
          description: `Cumulative risk from ${cumulativeContext.recentRiskScores.length} recent transaction(s)`,
        })
      }
    }

    // === FINAL SCORE CALCULATION ===
    const rawScore =
      contextScore +
      behaviourScore +
      (velocityAnalysis?.velocityScore ?? 0) * 0.5 +
      (reputationAnalysis?.reputationScore ?? 0) * 0.4 +
      (documentAnalysis?.documentScore ?? 0) * 0.4 +
      cumulativeScore

    const finalScore = clamp(rawScore, 0, 100)
    const riskLevel = scoreToRiskLevel(finalScore)
    const intervention = riskLevelToIntervention(riskLevel)

    // Confidence increases with more signals
    const baseConfidence = 0.3 + signals.length * 0.1
    const confidence = clamp(baseConfidence, 0.1, 0.95)

    return {
      finalScore,
      riskLevel,
      confidence,
      intervention,
      explanation: this.generateExplanation(finalScore, riskLevel, signals, transaction),
      detectedSignals: signals,
      componentScores: {
        contextScore,
        behaviourScore,
        velocityScore,
        reputationScore,
        documentScore,
        cumulativeScore,
      },
      velocityAnalysis,
      reputationAnalysis,
      documentAnalysis,
    }
  }

  private generateExplanation(
    score: number,
    level: RiskLevel,
    signals: RiskSignal[],
    transaction: TransactionInput
  ): string {
    if (signals.length === 0) {
      return `This payment to "${transaction.payee}" shows no unusual patterns. SENTRA has not detected any fraud signals for this transaction.`
    }

    const interventionMessages: Record<RiskLevel, string> = {
      safe: 'This transaction appears safe.',
      caution: 'This payment looks slightly unusual. Please verify the recipient before proceeding.',
      suspicious: 'This payment looks unusual. SENTRA has detected patterns associated with potential fraud.',
      high_risk: 'This payment has been paused. Multiple high-risk signals have been detected.',
      critical: 'CRITICAL: A suspicious payment pattern has been detected. Your trusted guardian has been notified.',
    }

    const signalDescriptions = signals
      .slice(0, 3)
      .map(s => s.description)
      .join('; ')

    const base = interventionMessages[level]

    if (level === 'safe') return base

    const cumulativeNote = signals.some(s => s.type === 'cumulative_risk')
      ? ' Note: Individually small amounts have accumulated into a high-risk pattern.'
      : ''

    return `${base} SENTRA noticed: ${signalDescriptions}.${cumulativeNote} Risk Score: ${Math.round(score)}/100.`
  }

  /**
   * Calculate cumulative risk with decay
   * Older events lose importance over time (risk decay)
   */
  static calculateDecayedRisk(
    historicalScores: Array<{ score: number; timestamp: Date }>
  ): number {
    const now = new Date()
    let decayedTotal = 0

    for (const { score, timestamp } of historicalScores) {
      const ageHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)
      // Decay factor: halves every 24 hours
      const decayFactor = Math.pow(0.5, ageHours / 24)
      decayedTotal += score * decayFactor
    }

    return clamp(decayedTotal / Math.max(historicalScores.length, 1), 0, 100)
  }
}

// Singleton instance
export const sentraEngine = new SentraRiskEngine()
