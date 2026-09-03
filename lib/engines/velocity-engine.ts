// SENTRA Velocity & Structuring Engine
// Analyzes transaction patterns over rolling time windows

import { VelocityAnalysis } from '@/types'
import { clamp } from '@/lib/utils'

interface TransactionRecord {
  amount: number
  payee: string
  payeeIsNew: boolean
  timestamp: Date
  riskScore?: number
  suspiciousCall?: boolean
  urgentMessage?: boolean
}

export class VelocityEngine {
  /**
   * Analyze transaction velocity and structuring patterns
   */
  static async analyze(
    recentTransactions: TransactionRecord[],
    currentTransaction: TransactionRecord
  ): Promise<VelocityAnalysis> {
    const now = currentTransaction.timestamp || new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const lastHour = recentTransactions.filter(t => t.timestamp >= oneHourAgo)
    const last24Hours = recentTransactions.filter(t => t.timestamp >= oneDayAgo)
    const last7Days = recentTransactions.filter(t => t.timestamp >= sevenDaysAgo)

    const detectedPatterns: string[] = []
    let velocityScore = 0

    // 1. Rapid transaction frequency (last hour)
    if (lastHour.length >= 3) {
      velocityScore += 15
      detectedPatterns.push(`${lastHour.length} transactions in the last hour`)
    } else if (lastHour.length >= 2) {
      velocityScore += 8
    }

    // 2. Repeated small payments to same payee
    const samePayeeInDay = last24Hours.filter(
      t => t.payee.toLowerCase() === currentTransaction.payee.toLowerCase()
    )
    if (samePayeeInDay.length >= 2) {
      velocityScore += 20
      detectedPatterns.push(
        `${samePayeeInDay.length + 1} payments to "${currentTransaction.payee}" in 24 hours`
      )
    }

    // 3. Fan-out to multiple new payees
    const newPayeesInDay = [...new Set(last24Hours.filter(t => t.payeeIsNew).map(t => t.payee))]
    if (newPayeesInDay.length >= 3) {
      velocityScore += 15
      detectedPatterns.push(`Payments to ${newPayeesInDay.length} different new recipients today`)
    }

    // 4. Similar amounts (structuring pattern)
    const similarAmounts = last24Hours.filter(t => {
      const diff = Math.abs(t.amount - currentTransaction.amount)
      return diff < currentTransaction.amount * 0.15 // Within 15% of current amount
    })
    if (similarAmounts.length >= 2) {
      velocityScore += 20
      detectedPatterns.push(
        `${similarAmounts.length + 1} similar-amount transactions — possible structuring pattern`
      )
    }

    // 5. High daily transaction count
    if (last24Hours.length >= 8) {
      velocityScore += 10
      detectedPatterns.push(`${last24Hours.length} transactions today — unusually high activity`)
    }

    // 6. Previous suspicious events
    const hasPreviousSuspicious = recentTransactions.some(
      t => (t.riskScore ?? 0) > 50
    )
    if (hasPreviousSuspicious) {
      velocityScore += 15
      detectedPatterns.push('Previous suspicious activity detected in recent history')
    }

    // 7. Suspicious call context with payment
    const suspiciousCallWithPayment = lastHour.filter(t => t.suspiciousCall).length
    if (suspiciousCallWithPayment > 0 || currentTransaction.suspiciousCall) {
      velocityScore += 10
      detectedPatterns.push('Payment initiated following suspicious call context')
    }

    const normalizedScore = clamp(velocityScore, 0, 100)
    const confidence = detectedPatterns.length > 0
      ? clamp(0.4 + detectedPatterns.length * 0.15, 0, 0.95)
      : 0.1

    const explanation = this.generateExplanation(detectedPatterns, last24Hours.length, samePayeeInDay.length)

    return {
      velocityScore: normalizedScore,
      detectedPatterns,
      confidence,
      explanation,
      relevantTransactions: last24Hours.length,
      windowAnalysis: {
        lastHour: {
          count: lastHour.length,
          amount: lastHour.reduce((s, t) => s + t.amount, 0),
        },
        last24Hours: {
          count: last24Hours.length,
          amount: last24Hours.reduce((s, t) => s + t.amount, 0),
        },
        last7Days: {
          count: last7Days.length,
          amount: last7Days.reduce((s, t) => s + t.amount, 0),
        },
      },
    }
  }

  private static generateExplanation(
    patterns: string[],
    dailyCount: number,
    samePayeeCount: number
  ): string {
    if (patterns.length === 0) {
      return 'No unusual transaction velocity detected. Transaction frequency is within normal range.'
    }

    if (samePayeeCount >= 2) {
      return `SENTRA detected that ${samePayeeCount + 1} similar payments were made to the same recipient within a short period. This pattern is commonly associated with payment scams where victims are coached to send multiple small amounts.`
    }

    if (patterns.length >= 3) {
      return `Multiple velocity signals detected: ${patterns.join('; ')}. This combination of patterns may indicate coordinated fraud activity.`
    }

    return `Velocity analysis detected: ${patterns[0]}. ${patterns.length > 1 ? `Additionally: ${patterns.slice(1).join('; ')}.` : ''}`
  }
}
