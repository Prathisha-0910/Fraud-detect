// SENTRA Reputation Engine
// Simulated identity and reputation analysis for MVP

import { ReputationAnalysis, URLAnalysisResult, RiskLevel } from '@/types'
import { scoreToRiskLevel, clamp } from '@/lib/utils'

// Simulated reputation database
const KNOWN_SCAM_PATTERNS = [
  'kyc', 'kycupdate', 'kycverify', 'kycblock', 'kycfreeze',
  'sbi-secure', 'hdfc-safe', 'icici-verify', 'axis-confirm',
  'paytm-support', 'gpay-verify', 'phonepe-secure',
  'refund-process', 'lottery-claim', 'prize-winner',
  'gov-india-reward', 'pm-relief', 'ration-card-update',
]

const SUSPICIOUS_EXTENSIONS = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.club', '.top']

const LEGITIMATE_BANKING_DOMAINS = [
  'sbi.co.in', 'hdfcbank.com', 'icicibank.com', 'axisbank.com',
  'kotak.com', 'bob.co.in', 'pnb.co.in', 'bankofbaroda.com',
  'paytm.com', 'phonepe.com', 'google.com', 'npci.org.in',
]

export class ReputationEngine {
  /**
   * Analyze a URL for fraud indicators
   */
  static analyzeURL(url: string): URLAnalysisResult {
    if (!url || url.trim() === '') {
      return {
        url,
        riskScore: 0,
        riskLevel: 'safe',
        indicators: [],
        explanation: 'No URL provided.',
        isBankingImpersonation: false,
      }
    }

    const lowerUrl = url.toLowerCase().replace(/\s/g, '')
    const indicators: string[] = []
    let riskScore = 0

    // Check legitimate domains first
    const isLegit = LEGITIMATE_BANKING_DOMAINS.some(domain => {
      try {
        const hostname = new URL(lowerUrl.startsWith('http') ? lowerUrl : `https://${lowerUrl}`).hostname
        return hostname === domain || hostname.endsWith(`.${domain}`)
      } catch {
        return false
      }
    })

    if (isLegit) {
      return {
        url,
        riskScore: 0,
        riskLevel: 'safe',
        indicators: ['Known legitimate banking domain'],
        explanation: 'This URL belongs to a known legitimate banking or payment service.',
        isBankingImpersonation: false,
      }
    }

    // 1. Banking impersonation keywords
    const hasBankKeyword = KNOWN_SCAM_PATTERNS.some(p => lowerUrl.includes(p))
    if (hasBankKeyword) {
      riskScore += 35
      indicators.push('Contains banking impersonation keywords')
    }

    // 2. Bank name + non-official domain
    const bankNames = ['sbi', 'hdfc', 'icici', 'axis', 'kotak', 'paytm', 'phonepe', 'gpay', 'upi', 'npci']
    const hasBankName = bankNames.some(b => lowerUrl.includes(b))
    if (hasBankName && !isLegit) {
      riskScore += 30
      indicators.push('Uses bank/payment brand name on unofficial domain')
    }

    // 3. Suspicious TLD
    const hasSuspiciousTLD = SUSPICIOUS_EXTENSIONS.some(ext => lowerUrl.includes(ext))
    if (hasSuspiciousTLD) {
      riskScore += 20
      indicators.push('Uses high-risk free domain extension')
    }

    // 4. Excessive hyphens or numbers
    const hyphenCount = (lowerUrl.match(/-/g) || []).length
    if (hyphenCount >= 3) {
      riskScore += 10
      indicators.push('Excessive hyphens in URL — common in phishing sites')
    }

    // 5. IP address as hostname
    const ipPattern = /https?:\/\/(\d{1,3}\.){3}\d{1,3}/
    if (ipPattern.test(lowerUrl)) {
      riskScore += 30
      indicators.push('URL uses IP address instead of domain name')
    }

    // 6. Suspicious keywords
    const suspiciousWords = ['secure', 'verify', 'update', 'blocked', 'suspended', 'urgent', 'reward', 'winner', 'claim', 'free']
    const foundSuspiciousWords = suspiciousWords.filter(w => lowerUrl.includes(w))
    if (foundSuspiciousWords.length >= 2) {
      riskScore += 15
      indicators.push(`Contains suspicious keywords: ${foundSuspiciousWords.join(', ')}`)
    }

    // 7. Overly long URL
    if (url.length > 100) {
      riskScore += 5
      indicators.push('Unusually long URL — often used to hide true destination')
    }

    const normalizedScore = clamp(riskScore, 0, 100)
    const riskLevel = scoreToRiskLevel(normalizedScore)
    const isBankingImpersonation = hasBankKeyword || (hasBankName && !isLegit)

    return {
      url,
      riskScore: normalizedScore,
      riskLevel,
      indicators,
      explanation: this.generateURLExplanation(normalizedScore, indicators, isBankingImpersonation),
      isBankingImpersonation,
    }
  }

  /**
   * Analyze phone number risk
   */
  static analyzePhone(phone: string): {
    risk: 'trusted' | 'unknown' | 'suspicious' | 'scam'
    score: number
    explanation: string
  } {
    if (!phone) {
      return { risk: 'unknown', score: 30, explanation: 'Contact number not provided.' }
    }

    // Simulated known scam numbers (in real system: telecom DB)
    const knownScamPrefixes = ['9000000', '9111111', '9999000', '1800', '0120']
    const trustedNumbers = ['100', '101', '102', '112', '1800180']

    const cleaned = phone.replace(/\s|-/g, '')

    if (trustedNumbers.some(n => cleaned.startsWith(n))) {
      return { risk: 'trusted', score: 0, explanation: 'Number identified as trusted official contact.' }
    }

    if (knownScamPrefixes.some(p => cleaned.startsWith(p))) {
      return { risk: 'scam', score: 80, explanation: 'This number pattern matches known scam number profiles. (Simulated data)' }
    }

    // Unknown number — moderate risk
    return {
      risk: 'unknown',
      score: 25,
      explanation: 'Number not found in trusted contact database. Exercise caution with unsolicited calls.',
    }
  }

  /**
   * Comprehensive reputation analysis
   */
  static analyze(params: {
    payee?: string
    url?: string
    phone?: string
  }): ReputationAnalysis {
    const indicators: string[] = []
    let totalScore = 0

    const urlAnalysis = params.url ? this.analyzeURL(params.url) : null
    const phoneAnalysis = params.phone ? this.analyzePhone(params.phone) : null

    if (urlAnalysis && urlAnalysis.riskScore > 0) {
      totalScore += urlAnalysis.riskScore * 0.6
      indicators.push(...urlAnalysis.indicators)
    }

    if (phoneAnalysis && phoneAnalysis.risk !== 'trusted') {
      totalScore += phoneAnalysis.score * 0.4
      if (phoneAnalysis.risk === 'scam') {
        indicators.push('Phone number matches known scam profile')
      }
    }

    const normalizedScore = clamp(totalScore, 0, 100)

    return {
      reputationScore: normalizedScore,
      phoneRisk: phoneAnalysis?.risk ?? 'unknown',
      urlRisk: urlAnalysis
        ? normalizedScore > 70
          ? 'malicious'
          : normalizedScore > 40
          ? 'suspicious'
          : normalizedScore > 0
          ? 'unknown'
          : 'clean'
        : 'unknown',
      confidence: indicators.length > 0 ? 0.8 : 0.3,
      indicators,
      explanation: normalizedScore > 50
        ? 'Reputation analysis found indicators commonly associated with fraudulent entities.'
        : normalizedScore > 20
        ? 'Some reputation concerns detected. Proceed with caution.'
        : 'No significant reputation concerns detected.',
    }
  }

  private static generateURLExplanation(
    score: number,
    indicators: string[],
    isBankingImpersonation: boolean
  ): string {
    if (score === 0) return 'URL appears legitimate based on available reputation data.'

    if (isBankingImpersonation) {
      return 'This URL appears to impersonate a banking or payment service. Do NOT enter any credentials or payment details on this site.'
    }

    if (score >= 70) {
      return `High-risk URL detected. Indicators include: ${indicators.slice(0, 2).join('; ')}. This site should not be trusted for financial transactions.`
    }

    if (score >= 40) {
      return `This URL shows suspicious characteristics: ${indicators[0] ?? 'Unknown risk factors'}. Verify the sender before clicking.`
    }

    return `Minor URL concerns detected. ${indicators[0] ?? 'Proceed with caution.'}`
  }
}
