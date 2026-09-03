// SENTRA Type Definitions

export type RiskLevel = 'safe' | 'caution' | 'suspicious' | 'high_risk' | 'critical'
export type InterventionType = 'allow' | 'educate' | 'confirm' | 'pause' | 'guardian_review'
export type TransactionStatus = 'completed' | 'pending' | 'paused' | 'blocked' | 'cancelled'
export type EventSeverity = 'info' | 'caution' | 'suspicious' | 'high_risk' | 'critical'

export interface RiskConfig {
  weights: {
    newPayee: number
    repeatedPayment: number
    highVelocity: number
    suspiciousContext: number
    suspiciousUrl: number
    suspiciousDocument: number
    previousWarning: number
    urgentMessage: number
    cumulativeExposure: number
  }
  thresholds: {
    safe: number
    caution: number
    suspicious: number
    highRisk: number
    critical: number
  }
}

export const DEFAULT_RISK_CONFIG: RiskConfig = {
  weights: {
    newPayee: 15,
    repeatedPayment: 20,
    highVelocity: 20,
    suspiciousContext: 20,
    suspiciousUrl: 25,
    suspiciousDocument: 25,
    previousWarning: 15,
    urgentMessage: 15,
    cumulativeExposure: 10,
  },
  thresholds: {
    safe: 25,
    caution: 50,
    suspicious: 70,
    highRisk: 85,
    critical: 100,
  },
}

export interface TransactionInput {
  userId: string
  amount: number
  payee: string
  payeeIsNew: boolean
  payeeType: string
  timestamp?: Date
  suspiciousCall: boolean
  urgentMessage: boolean
  suspiciousUrl: boolean
  previousWarning: boolean
  documentContext?: string
}

export interface VelocityAnalysis {
  velocityScore: number
  detectedPatterns: string[]
  confidence: number
  explanation: string
  relevantTransactions: number
  windowAnalysis: {
    lastHour: { count: number; amount: number }
    last24Hours: { count: number; amount: number }
    last7Days: { count: number; amount: number }
  }
}

export interface ReputationAnalysis {
  reputationScore: number
  phoneRisk: 'trusted' | 'unknown' | 'suspicious' | 'scam'
  urlRisk: 'clean' | 'unknown' | 'suspicious' | 'malicious'
  confidence: number
  indicators: string[]
  explanation: string
}

export interface DocumentAnalysis {
  documentScore: number
  extractedText: string
  detectedIndicators: DocumentIndicator[]
  confidence: number
  explanation: string
  riskLevel: RiskLevel
}

export interface DocumentIndicator {
  type: 'urgency' | 'authority' | 'advance_fee' | 'kyc' | 'secrecy' | 'pressure' | 'suspicious_instruction'
  text: string
  severity: EventSeverity
}

export interface RiskAssessmentResult {
  finalScore: number
  riskLevel: RiskLevel
  confidence: number
  intervention: InterventionType
  explanation: string
  detectedSignals: RiskSignal[]
  componentScores: {
    contextScore: number
    behaviourScore: number
    velocityScore: number
    reputationScore: number
    documentScore: number
    cumulativeScore: number
  }
  velocityAnalysis?: VelocityAnalysis
  reputationAnalysis?: ReputationAnalysis
  documentAnalysis?: DocumentAnalysis
}

export interface RiskSignal {
  type: string
  severity: EventSeverity
  score: number
  description: string
}

export interface QRAnalysisResult {
  direction: 'send' | 'receive' | 'unknown'
  amount?: number
  payee?: string
  riskScore: number
  riskLevel: RiskLevel
  warnings: string[]
  explanation: string
  isPaymentRequest: boolean
}

export interface URLAnalysisResult {
  url: string
  riskScore: number
  riskLevel: RiskLevel
  indicators: string[]
  explanation: string
  isBankingImpersonation: boolean
  domainAge?: string
}

export interface DemoScenario {
  id: string
  title: string
  description: string
  category: 'normal' | 'kyc_scam' | 'repeated_small' | 'suspicious_url' | 'qr_scam' | 'document_scam'
  steps: DemoStep[]
  icon: string
  color: string
}

export interface DemoStep {
  id: string
  title: string
  description: string
  amount?: number
  riskScore: number
  riskLevel: RiskLevel
  delay: number
  signals?: string[]
}

export interface SafetyStats {
  totalTransactions: number
  safeTransactions: number
  warningCount: number
  blockedCount: number
  currentRiskLevel: RiskLevel
  currentRiskScore: number
  recentAlerts: number
}
