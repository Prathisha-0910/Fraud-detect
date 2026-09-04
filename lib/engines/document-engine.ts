// SENTRA Document Analysis Engine
// OCR abstraction + fraud indicator detection

import { DocumentAnalysis, DocumentIndicator, RiskLevel } from '@/types'
import { scoreToRiskLevel, clamp } from '@/lib/utils'

// Fraud indicator patterns
const FRAUD_PATTERNS = {
  urgency: {
    keywords: ['urgent', 'immediately', 'within 24 hours', 'today only', 'expire', 'asap', 'right now', 'instantly', 'as soon as', 'deadline'],
    severity: 'caution' as const,
    label: 'Urgency Language',
    score: 15,
  },
  authority: {
    keywords: ['rbi', 'reserve bank', 'income tax', 'government of india', 'ministry', 'police', 'court order', 'enforcement directorate', 'ed notice', 'legal notice', 'official warning'],
    severity: 'suspicious' as const,
    label: 'Authority Impersonation',
    score: 25,
  },
  advance_fee: {
    keywords: ['processing fee', 'registration fee', 'tax payment', 'advance payment', 'refundable deposit', 'clearance fee', 'handling charge', 'activation fee'],
    severity: 'high_risk' as const,
    label: 'Advance Fee Request',
    score: 30,
  },
  kyc: {
    keywords: ['kyc update', 'kyc verification', 'kyc expired', 'link aadhaar', 'update pan', 'account blocked', 'account suspended', 'verify account'],
    severity: 'suspicious' as const,
    label: 'Fake KYC Request',
    score: 25,
  },
  secrecy: {
    keywords: ['keep this confidential', 'do not tell', 'secret', 'private matter', 'do not share', 'between us only', 'trust no one', "don't inform anyone"],
    severity: 'high_risk' as const,
    label: 'Secrecy Instructions',
    score: 20,
  },
  pressure: {
    keywords: ['or your account will', 'failure to comply', 'will result in arrest', 'will be penalized', 'action will be taken', 'final notice', 'last warning'],
    severity: 'high_risk' as const,
    label: 'Pressure Tactics',
    score: 25,
  },
  suspicious_instruction: {
    keywords: ['send money to', 'transfer to', 'pay to this account', 'upi id', 'google pay', 'phonepe', 'paytm karo', 'scan the qr', 'click the link below'],
    severity: 'suspicious' as const,
    label: 'Suspicious Payment Instructions',
    score: 20,
  },
}

// Demo document text for MVP
const DEMO_DOCUMENTS = {
  safe: `Dear Customer,

Thank you for shopping at BigMart Superstore.

Your purchase receipt:
Date: Today
Items: Groceries, Household
Total: ₹1,847

For queries, contact: support@bigmart.com`,

  kyc_scam: `URGENT NOTICE FROM STATE BANK OF INDIA
KYC Verification Required

Dear Account Holder,

Your account has been flagged for mandatory KYC update.

FAILURE TO COMPLY WITHIN 24 HOURS WILL RESULT IN PERMANENT ACCOUNT SUSPENSION.

Please pay a nominal KYC processing fee of ₹299 to:
UPI ID: kyc-update@sbi-secure.ml

This is a government mandatory requirement.
Do NOT share this with anyone.

— KYC Department, SBI`, 

  lottery: `CONGRATULATIONS! You have won ₹15,00,000 in the India Digital Lottery 2024!

To claim your prize immediately:
1. Pay a processing fee of ₹2,500
2. Keep this confidential until the prize is transferred
3. Contact us within 24 hours or the prize expires

Transfer to: lottery.claim@prize-winner.tk
Claim code: IND-PRIZE-2024-88721

This is your final notice.`,
}

export class DocumentEngine {
  /**
   * Analyze document text for fraud indicators
   * In production, this would use Tesseract.js or cloud OCR
   */
  static analyzeText(text: string): DocumentAnalysis {
    if (!text || text.trim() === '') {
      return {
        documentScore: 0,
        extractedText: '',
        detectedIndicators: [],
        confidence: 0,
        explanation: 'No document content to analyze.',
        riskLevel: 'safe',
      }
    }

    const lowerText = text.toLowerCase()
    const detectedIndicators: DocumentIndicator[] = []
    let totalScore = 0

    // Check each fraud pattern category
    for (const [type, pattern] of Object.entries(FRAUD_PATTERNS)) {
      const foundKeywords = pattern.keywords.filter(k => lowerText.includes(k))
      if (foundKeywords.length > 0) {
        detectedIndicators.push({
          type: type as DocumentIndicator['type'],
          text: `Found: "${foundKeywords[0]}"${foundKeywords.length > 1 ? ` (+${foundKeywords.length - 1} more)` : ''}`,
          severity: pattern.severity,
        })
        totalScore += pattern.score
      }
    }

    const normalizedScore = clamp(totalScore, 0, 100)
    const riskLevel = scoreToRiskLevel(normalizedScore)
    const confidence = detectedIndicators.length > 0
      ? clamp(0.5 + detectedIndicators.length * 0.1, 0, 0.9)
      : 0.2

    return {
      documentScore: normalizedScore,
      extractedText: text,
      detectedIndicators,
      confidence,
      explanation: this.generateExplanation(normalizedScore, detectedIndicators, riskLevel),
      riskLevel,
    }
  }

  /**
   * Real text extraction from an uploaded file.
   * - Images  -> OCR in-browser via Tesseract.js
   * - PDFs    -> sent to /api/document/extract-pdf (pdf-parse runs server-side;
   *              pdf-parse is a Node-only library and cannot run in the browser)
   * - Plain text files -> read directly
   */
  static async extractText(file: File): Promise<string> {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    const isImage = file.type.startsWith('image/')

    if (isPdf) {
      const buffer = await file.arrayBuffer()
      const res = await fetch('/api/document/extract-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/pdf' },
        body: buffer,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Failed to extract text from this PDF.')
      }
      const { text } = await res.json()
      if (!text || !text.trim()) {
        throw new Error('No readable text found in this PDF. It may be a scanned image — try uploading it as an image instead.')
      }
      return text
    }

    if (isImage) {
      // Dynamic import: tesseract.js is client-only and fairly heavy, so it's
      // only pulled in when someone actually uploads an image.
      const Tesseract = await import('tesseract.js')
      const { data } = await Tesseract.recognize(file, 'eng')
      if (!data.text || !data.text.trim()) {
        throw new Error("Couldn't read any text from this image. Try a clearer photo or a higher-resolution scan.")
      }
      return data.text
    }

    // .txt / .doc-ish fallback: attempt a direct text read
    try {
      const text = await file.text()
      if (!text.trim()) throw new Error('empty')
      return text
    } catch {
      throw new Error('Unsupported file type. Please upload an image (JPG/PNG) or a PDF.')
    }
  }

  /**
   * @deprecated Use extractText() for real uploads. This is kept only for
   * the "Try demo documents" buttons, which call getDemoText() directly and
   * don't use this method — retained for backward compatibility only.
   */
  static async simulateOCR(file: File): Promise<string> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const fileName = file.name.toLowerCase()
    
    if (fileName.includes('kyc') || fileName.includes('sbi') || fileName.includes('bank')) {
      return DEMO_DOCUMENTS.kyc_scam
    }
    
    if (fileName.includes('prize') || fileName.includes('lottery') || fileName.includes('winner')) {
      return DEMO_DOCUMENTS.lottery
    }
    
    // Default: return safe document
    return DEMO_DOCUMENTS.safe
  }

  /**
   * Get demo document text for testing
   */
  static getDemoText(type: 'safe' | 'kyc_scam' | 'lottery'): string {
    return DEMO_DOCUMENTS[type]
  }

  private static generateExplanation(
    score: number,
    indicators: DocumentIndicator[],
    level: RiskLevel
  ): string {
    if (score === 0) {
      return 'No fraud indicators found in this document. The content appears to be legitimate.'
    }

    const hasAuthority = indicators.some(i => i.type === 'authority')
    const hasAdvanceFee = indicators.some(i => i.type === 'advance_fee')
    const hasSecrecy = indicators.some(i => i.type === 'secrecy')

    if (hasAuthority && hasAdvanceFee) {
      return 'This document contains indicators commonly associated with government impersonation scams. Real government agencies do not ask for advance payments through UPI or mobile banking.'
    }

    if (hasAdvanceFee) {
      return 'This document requests an advance or processing payment. Legitimate businesses rarely require upfront payments to release prizes, refunds, or services.'
    }

    if (hasSecrecy) {
      return 'This document instructs you to keep information secret. Legitimate organizations never ask you to hide financial transactions from family or friends — this is a major scam warning sign.'
    }

    if (indicators.length >= 3) {
      return `This document contains multiple indicators commonly associated with scams: ${indicators.map(i => i.type.replace(/_/g, ' ')).join(', ')}. Exercise extreme caution.`
    }

    return `This document contains ${indicators.length} indicator(s) that are sometimes associated with fraudulent communications. Verify the sender's identity independently before taking any action.`
  }
}
