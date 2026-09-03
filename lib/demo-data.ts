// SENTRA Demo Data Store
// Simulated data for the hackathon demo — no real user data

import { RiskLevel } from '@/types'

export interface DemoTransaction {
  id: string
  amount: number
  payee: string
  payeeIsNew: boolean
  payeeType: string
  timestamp: Date
  riskScore: number
  riskLevel: RiskLevel
  status: string
  suspiciousCall: boolean
  urgentMessage: boolean
  suspiciousUrl: boolean
  previousWarning: boolean
  explanation: string
}

export interface DemoFraudEvent {
  id: string
  eventType: string
  riskScore: number
  severity: RiskLevel
  timestamp: Date
  description: string
  acknowledged: boolean
}

// Safe user transaction history
const now = new Date()
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000)
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60000)

export const DEMO_SAFE_TRANSACTIONS: DemoTransaction[] = [
  {
    id: 'txn_safe_1',
    amount: 1847,
    payee: 'BigMart Superstore',
    payeeIsNew: false,
    payeeType: 'merchant',
    timestamp: hoursAgo(2),
    riskScore: 8,
    riskLevel: 'safe',
    status: 'completed',
    suspiciousCall: false,
    urgentMessage: false,
    suspiciousUrl: false,
    previousWarning: false,
    explanation: 'Regular grocery purchase at known merchant.',
  },
  {
    id: 'txn_safe_2',
    amount: 599,
    payee: 'Netflix India',
    payeeIsNew: false,
    payeeType: 'merchant',
    timestamp: hoursAgo(24),
    riskScore: 5,
    riskLevel: 'safe',
    status: 'completed',
    suspiciousCall: false,
    urgentMessage: false,
    suspiciousUrl: false,
    previousWarning: false,
    explanation: 'Regular subscription payment.',
  },
  {
    id: 'txn_safe_3',
    amount: 2200,
    payee: 'BESCOM (Electricity)',
    payeeIsNew: false,
    payeeType: 'utility',
    timestamp: hoursAgo(48),
    riskScore: 3,
    riskLevel: 'safe',
    status: 'completed',
    suspiciousCall: false,
    urgentMessage: false,
    suspiciousUrl: false,
    previousWarning: false,
    explanation: 'Regular utility bill payment.',
  },
  {
    id: 'txn_safe_4',
    amount: 500,
    payee: 'Rahul Sharma (Friend)',
    payeeIsNew: false,
    payeeType: 'individual',
    timestamp: hoursAgo(72),
    riskScore: 10,
    riskLevel: 'safe',
    status: 'completed',
    suspiciousCall: false,
    urgentMessage: false,
    suspiciousUrl: false,
    previousWarning: false,
    explanation: 'Payment to known contact.',
  },
]

// Suspicious user transaction history (the main demo scenario)
export const DEMO_SUSPICIOUS_TRANSACTIONS: DemoTransaction[] = [
  {
    id: 'txn_sus_1',
    amount: 2000,
    payee: 'Rajesh Kumar',
    payeeIsNew: true,
    payeeType: 'individual',
    timestamp: minutesAgo(25),
    riskScore: 20,
    riskLevel: 'caution',
    status: 'completed',
    suspiciousCall: false,
    urgentMessage: false,
    suspiciousUrl: false,
    previousWarning: false,
    explanation: 'Payment to a recently added recipient.',
  },
  {
    id: 'txn_sus_2',
    amount: 2000,
    payee: 'Rajesh Kumar',
    payeeIsNew: true,
    payeeType: 'individual',
    timestamp: minutesAgo(18),
    riskScore: 42,
    riskLevel: 'caution',
    status: 'completed',
    suspiciousCall: true,
    urgentMessage: false,
    suspiciousUrl: false,
    previousWarning: false,
    explanation: 'Second payment to same new recipient. Suspicious call context detected.',
  },
  {
    id: 'txn_sus_3',
    amount: 2000,
    payee: 'Rajesh Kumar',
    payeeIsNew: true,
    payeeType: 'individual',
    timestamp: minutesAgo(10),
    riskScore: 68,
    riskLevel: 'suspicious',
    status: 'completed',
    suspiciousCall: true,
    urgentMessage: true,
    suspiciousUrl: false,
    previousWarning: true,
    explanation: 'Pattern of repeated payments detected. Risk is escalating.',
  },
  {
    id: 'txn_sus_4',
    amount: 2500,
    payee: 'Rajesh Kumar',
    payeeIsNew: true,
    payeeType: 'individual',
    timestamp: minutesAgo(2),
    riskScore: 92,
    riskLevel: 'critical',
    status: 'paused',
    suspiciousCall: true,
    urgentMessage: true,
    suspiciousUrl: false,
    previousWarning: true,
    explanation: 'CRITICAL: Connected fraud pattern detected. Transaction paused.',
  },
]

// All demo transactions combined
export const ALL_DEMO_TRANSACTIONS: DemoTransaction[] = [
  ...DEMO_SUSPICIOUS_TRANSACTIONS,
  ...DEMO_SAFE_TRANSACTIONS,
].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

// Demo fraud events
export const DEMO_FRAUD_EVENTS: DemoFraudEvent[] = [
  {
    id: 'evt_1',
    eventType: 'pattern_detected',
    riskScore: 92,
    severity: 'critical',
    timestamp: minutesAgo(2),
    description: 'Repeated small payment pattern detected — 4 payments totaling ₹8,500 to new recipient',
    acknowledged: false,
  },
  {
    id: 'evt_2',
    eventType: 'velocity_alert',
    riskScore: 68,
    severity: 'suspicious',
    timestamp: minutesAgo(10),
    description: 'High transaction velocity detected: 3 payments in 25 minutes',
    acknowledged: false,
  },
  {
    id: 'evt_3',
    eventType: 'context_warning',
    riskScore: 42,
    severity: 'caution',
    timestamp: minutesAgo(18),
    description: 'Suspicious call context before payment detected',
    acknowledged: true,
  },
  {
    id: 'evt_4',
    eventType: 'intervention',
    riskScore: 92,
    severity: 'critical',
    timestamp: minutesAgo(2),
    description: 'Transaction paused by SENTRA. Guardian notified.',
    acknowledged: false,
  },
]

// Demo safety stats
export const DEMO_SAFETY_STATS = {
  totalTransactions: ALL_DEMO_TRANSACTIONS.length,
  safeTransactions: DEMO_SAFE_TRANSACTIONS.length,
  warningCount: 2,
  blockedCount: 1,
  currentRiskLevel: 'critical' as RiskLevel,
  currentRiskScore: 92,
  recentAlerts: 2,
}

// Demo guardian
export const DEMO_GUARDIAN = {
  id: 'guardian_1',
  name: 'Suresh Sharma',
  relationship: 'son',
  contact: '+91 98765 43210',
  active: true,
}

// Demo scenario data for the timeline
export const DEMO_TIMELINE_EVENTS = [
  {
    id: 'tl_1',
    type: 'payment',
    amount: 1847,
    payee: 'BigMart Superstore',
    timestamp: hoursAgo(26),
    riskScore: 8,
    riskLevel: 'safe' as RiskLevel,
    description: 'Grocery purchase',
  },
  {
    id: 'tl_2',
    type: 'new_contact',
    payee: 'Rajesh Kumar',
    timestamp: minutesAgo(30),
    riskScore: 15,
    riskLevel: 'caution' as RiskLevel,
    description: 'New recipient added',
  },
  {
    id: 'tl_3',
    type: 'payment',
    amount: 2000,
    payee: 'Rajesh Kumar',
    timestamp: minutesAgo(25),
    riskScore: 20,
    riskLevel: 'caution' as RiskLevel,
    description: 'First payment to new recipient',
  },
  {
    id: 'tl_4',
    type: 'context',
    timestamp: minutesAgo(22),
    riskScore: 30,
    riskLevel: 'caution' as RiskLevel,
    description: 'Suspicious call activity detected',
  },
  {
    id: 'tl_5',
    type: 'payment',
    amount: 2000,
    payee: 'Rajesh Kumar',
    timestamp: minutesAgo(18),
    riskScore: 42,
    riskLevel: 'caution' as RiskLevel,
    description: 'Repeated payment — same amount, same recipient',
  },
  {
    id: 'tl_6',
    type: 'payment',
    amount: 2000,
    payee: 'Rajesh Kumar',
    timestamp: minutesAgo(10),
    riskScore: 68,
    riskLevel: 'suspicious' as RiskLevel,
    description: 'Third consecutive payment — risk escalating',
  },
  {
    id: 'tl_7',
    type: 'intervention',
    amount: 2500,
    payee: 'Rajesh Kumar',
    timestamp: minutesAgo(2),
    riskScore: 92,
    riskLevel: 'critical' as RiskLevel,
    description: 'SENTRA paused transaction — critical pattern detected',
  },
]
