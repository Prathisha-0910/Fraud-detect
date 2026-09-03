// SENTRA QR Analysis Engine

import { QRAnalysisResult, RiskLevel } from '@/types'
import { scoreToRiskLevel, clamp } from '@/lib/utils'

interface QRData {
  raw: string
  upiId?: string
  amount?: number
  payee?: string
  transactionType?: 'pay' | 'collect'
  note?: string
}

export class QREngine {
  /**
   * Parse a UPI QR code string
   */
  static parseQRCode(qrString: string): QRData {
    const data: QRData = { raw: qrString }

    try {
      // UPI QR format: upi://pay?pa=vpa@bank&pn=Name&am=Amount&tn=Note
      if (qrString.startsWith('upi://')) {
        const url = new URL(qrString)
        const params = url.searchParams

        data.upiId = params.get('pa') ?? undefined
        data.payee = params.get('pn') ?? undefined
        const amount = params.get('am')
        data.amount = amount ? parseFloat(amount) : undefined
        data.note = params.get('tn') ?? undefined
        
        // 'collect' action means user will SEND money (payment request)
        const action = url.pathname.replace('/', '').toLowerCase()
        data.transactionType = action === 'collect' ? 'collect' : 'pay'
      }
    } catch {
      // Failed to parse — treat as unknown
    }

    return data
  }

  /**
   * Generate a demo QR string for testing
   */
  static getDemoQR(type: 'payment_request' | 'receive' | 'suspicious'): string {
    const demos = {
      payment_request: 'upi://collect?pa=unknown123@paytm&pn=Unknown+Merchant&am=5000&tn=Payment+Required',
      receive: 'upi://pay?pa=yourfriend@upi&pn=Friend+Name&am=500&tn=Splitting+bill',
      suspicious: 'upi://collect?pa=kyc-update@scam.ml&pn=SBI+Bank+Official&am=299&tn=KYC+Processing+Fee+URGENT',
    }
    return demos[type]
  }

  /**
   * Analyze QR code for fraud risks
   */
  static analyzeQR(qrStringOrDemoType: string): QRAnalysisResult {
    let qrString = qrStringOrDemoType

    // Handle demo types
    if (['payment_request', 'receive', 'suspicious'].includes(qrStringOrDemoType)) {
      qrString = this.getDemoQR(qrStringOrDemoType as 'payment_request' | 'receive' | 'suspicious')
    }

    const parsed = this.parseQRCode(qrString)
    const warnings: string[] = []
    let riskScore = 0

    // Determine payment direction
    // 'collect' = user makes payment (SEND)
    // 'pay' = user receives (but context matters)
    const isPaymentRequest = parsed.transactionType === 'collect' || qrString.includes('collect')
    
    // Direction: if it's a collect request, user will SEND money
    const direction: 'send' | 'receive' | 'unknown' = parsed.transactionType 
      ? (isPaymentRequest ? 'send' : 'receive')
      : 'unknown'

    // Critical warning: user might be confused about direction
    if (isPaymentRequest) {
      riskScore += 20
      warnings.push('This QR code is a PAYMENT REQUEST — you will be SENDING money, not receiving it')
    }

    // Suspicious UPI IDs
    if (parsed.upiId) {
      const suspiciousPatterns = [
        'kyc', 'verify', 'secure', 'update', 'blocked', 'bank-official',
        'govt', 'government', 'rbi', 'reward', 'prize',
      ]
      const lowerUpi = parsed.upiId.toLowerCase()
      
      if (suspiciousPatterns.some(p => lowerUpi.includes(p))) {
        riskScore += 40
        warnings.push(`Suspicious UPI ID pattern detected: "${parsed.upiId}"`)
      }

      // Free/fake domain
      if (lowerUpi.includes('@scam') || lowerUpi.includes('.ml') || lowerUpi.includes('.tk')) {
        riskScore += 30
        warnings.push('UPI ID uses suspicious domain extension')
      }
    }

    // Suspicious notes
    if (parsed.note) {
      const urgencyWords = ['urgent', 'kyc', 'verify', 'fee', 'charge', 'immediately', 'processing']
      const lowerNote = parsed.note.toLowerCase()
      if (urgencyWords.some(w => lowerNote.includes(w))) {
        riskScore += 20
        warnings.push(`Suspicious payment note: "${parsed.note}"`)
      }
    }

    // Unusual amount patterns
    if (parsed.amount) {
      // Round numbers that are commonly used in scams (299, 499, 999, etc.)
      const scamAmounts = [99, 199, 299, 499, 999, 1999, 2999]
      if (scamAmounts.includes(parsed.amount)) {
        riskScore += 10
        warnings.push(`Amount ₹${parsed.amount} is commonly associated with fake fee scams`)
      }
    }

    const normalizedScore = clamp(riskScore, 0, 100)
    const riskLevel = scoreToRiskLevel(normalizedScore)

    return {
      direction,
      amount: parsed.amount,
      payee: parsed.payee,
      riskScore: normalizedScore,
      riskLevel,
      warnings,
      explanation: this.generateExplanation(direction, normalizedScore, warnings, parsed),
      isPaymentRequest,
    }
  }

  private static generateExplanation(
    direction: 'send' | 'receive' | 'unknown',
    score: number,
    warnings: string[],
    parsed: QRData
  ): string {
    const directionText = direction === 'send'
      ? 'This QR code will SEND money from your account.'
      : direction === 'receive'
      ? 'This QR code allows you to receive money.'
      : 'The payment direction of this QR code is unclear.'

    if (score === 0) {
      return `${directionText} No suspicious indicators detected in this QR code.`
    }

    const mainWarning = warnings[0] ?? 'Suspicious patterns detected'
    return `${directionText} ${mainWarning}. ${score > 60 ? 'Do not scan this QR code.' : 'Please verify before proceeding.'}`
  }
}
