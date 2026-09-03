'use client'

import { useState } from 'react'
import { RiskScoreCard } from '@/components/sentra/RiskScoreCard'
import { FraudSignalCard } from '@/components/sentra/FraudSignalCard'
import { RiskBreakdownChart } from '@/components/sentra/RiskBreakdownChart'
import { DEMO_SUSPICIOUS_TRANSACTIONS, DEMO_FRAUD_EVENTS } from '@/lib/demo-data'
import { getRiskLevelConfig, formatCurrency } from '@/lib/utils'
import { RiskLevel, EventSeverity } from '@/types'
import {
  Activity,
  Shield,
  Globe,
  FileText,
  Clock,
  TrendingUp,
  ChevronRight,
  X,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface IntelCard {
  id: string
  title: string
  category: string
  score: number
  riskLevel: RiskLevel
  confidence: number
  indicators: string[]
  explanation: string
  icon: React.ElementType
  detail: string
}

const INTEL_CARDS: IntelCard[] = [
  {
    id: 'velocity',
    title: 'VELOCITY',
    category: 'Transaction Speed',
    score: 75,
    riskLevel: 'high_risk',
    confidence: 0.92,
    indicators: [
      '4 payments within 25 minutes',
      'Same recipient — repeated pattern',
      'Similar amounts (₹2,000 each)',
    ],
    explanation: 'High transaction velocity detected. Multiple payments to a new recipient in rapid succession matches structuring fraud patterns.',
    icon: Activity,
    detail: 'Velocity analysis examines the speed and frequency of transactions. Rapid payments to new recipients — especially in similar amounts — are a key indicator of scam-coached behavior.',
  },
  {
    id: 'reputation',
    title: 'REPUTATION',
    category: 'Identity Risk',
    score: 45,
    riskLevel: 'caution',
    confidence: 0.65,
    indicators: [
      'Payee not in trusted contact list',
      'Recently added contact',
      'No prior transaction history',
    ],
    explanation: 'Recipient has no established payment history. Unknown contacts with no previous transactions carry elevated risk.',
    icon: Shield,
    detail: 'Reputation analysis uses a simulated database to assess the trustworthiness of recipients. In production, this would integrate with UPI ecosystem data.',
  },
  {
    id: 'context',
    title: 'CONTEXT',
    category: 'Interaction Risk',
    score: 80,
    riskLevel: 'high_risk',
    confidence: 0.88,
    indicators: [
      'Suspicious call before payment',
      'Urgent message pressure detected',
      'Previous fraud warning on record',
    ],
    explanation: 'Multiple behavioral context signals detected. The combination of suspicious calls, urgency pressure, and prior warnings is highly associated with manipulation scams.',
    icon: Clock,
    detail: 'Context signals capture the environment around a payment. Fraud often involves social engineering — calls, messages, and urgency — to override a victim\'s normal judgment.',
  },
  {
    id: 'cumulative',
    title: 'CUMULATIVE RISK',
    category: 'Pattern Exposure',
    score: 88,
    riskLevel: 'critical',
    confidence: 0.95,
    indicators: [
      'Total exposure: ₹8,500 to new recipient',
      'Risk escalated from 20 → 92 across 4 transactions',
      'Pattern strongly matches coached payment scam',
    ],
    explanation: 'This is SENTRA\'s core innovation. Individually small amounts appeared safe, but the accumulated pattern reveals a connected fraud event.',
    icon: TrendingUp,
    detail: 'Cumulative risk analysis connects individual transactions over time. SENTRA tracks how risk evolves across a session to detect scams not visible in any single transaction.',
  },
  {
    id: 'document',
    title: 'DOCUMENT',
    category: 'Document Analysis',
    score: 0,
    riskLevel: 'safe',
    confidence: 0.3,
    indicators: ['No document submitted for this session'],
    explanation: 'No document analysis available for this session. Upload a document in the Document Scanner to analyze for fraud indicators.',
    icon: FileText,
    detail: 'Document analysis uses NLP-based rule detection to identify urgency, authority impersonation, advance fee requests, and other fraud patterns in uploaded documents.',
  },
]

export default function IntelligencePage() {
  const [selectedCard, setSelectedCard] = useState<IntelCard | null>(null)

  const totalScore = 84
  const totalRiskLevel: RiskLevel = 'high_risk'
  const config = getRiskLevelConfig(totalRiskLevel)

  const chartData = INTEL_CARDS.map(c => ({
    label: c.title,
    score: c.score,
    maxScore: 100,
  }))

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Fraud Intelligence Center</h1>
        <p className="text-slate-500 mt-0.5">
          Multi-dimensional fraud analysis across all detection engines
        </p>
      </div>

      {/* Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white rounded-2xl border-2 border-red-200 p-5">
          <h3 className="text-sm font-medium text-slate-500 mb-3">Composite Risk Score</h3>
          <div className="flex flex-col items-center">
            <RiskScoreCard
              score={totalScore}
              riskLevel={totalRiskLevel}
              confidence={0.93}
              showArc
              size="lg"
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">Based on last 25 minutes</p>
            <p className="text-xs text-slate-400 mt-0.5">4 transactions analyzed</p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-500 mb-4">Engine Score Breakdown</h3>
          <RiskBreakdownChart scores={chartData} type="bar" />
        </div>
      </div>

      {/* Intelligence cards */}
      <div>
        <h2 className="font-bold text-slate-700 mb-3">Detection Engine Results</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTEL_CARDS.map(card => {
            const cardConfig = getRiskLevelConfig(card.riskLevel)
            const Icon = card.icon
            return (
              <div
                key={card.id}
                className={cn(
                  'bg-white rounded-xl border-2 p-5 cursor-pointer transition-all duration-150 hover:shadow-md',
                  cardConfig.border
                )}
                onClick={() => setSelectedCard(card)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', cardConfig.bg)}>
                    <Icon className={cn('w-5 h-5', cardConfig.color)} />
                  </div>
                  <div className="text-right">
                    <div className={cn('text-xl font-bold', cardConfig.color)}>{card.score}</div>
                    <div className="text-xs text-slate-400">/100</div>
                  </div>
                </div>

                <h3 className={cn('font-bold text-sm tracking-wide mb-0.5', cardConfig.color)}>
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 mb-3">{card.category}</p>

                {/* Top indicators */}
                <div className="space-y-1 mb-3">
                  {card.indicators.slice(0, 2).map((ind, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <div className={cn('w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0', cardConfig.dot)} />
                      <span className="text-xs text-slate-600">{ind}</span>
                    </div>
                  ))}
                </div>

                {/* Confidence + click */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400">
                    {Math.round(card.confidence * 100)}% confidence
                  </span>
                  <button className={cn('text-xs font-medium flex items-center gap-1', cardConfig.color)}>
                    Details <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent fraud events */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-bold text-slate-800 mb-4">Recent Intelligence Events</h2>
        <div className="space-y-2">
          {DEMO_FRAUD_EVENTS.map(event => {
            const evtConfig = getRiskLevelConfig(event.severity)
            return (
              <div
                key={event.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-xl',
                  event.acknowledged ? 'bg-slate-50' : cn(evtConfig.bg, evtConfig.border, 'border')
                )}
              >
                <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', evtConfig.dot)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('text-xs font-bold', evtConfig.color)}>
                      {event.eventType.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className={cn('text-xs px-1.5 py-0.5 rounded font-semibold', evtConfig.badge)}>
                      Risk {Math.round(event.riskScore)}
                    </span>
                    {!event.acknowledged && (
                      <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Unread</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{event.description}</p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">
                  {event.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail drawer */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedCard(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-slide-in max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-bold text-lg text-slate-800">{selectedCard.title} Engine</h2>
                <p className="text-sm text-slate-500">{selectedCard.category}</p>
              </div>
              <button onClick={() => setSelectedCard(null)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <RiskScoreCard
              score={selectedCard.score}
              riskLevel={selectedCard.riskLevel}
              confidence={selectedCard.confidence}
              showArc
              size="md"
              className="mb-5"
            />

            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-slate-700 leading-relaxed">{selectedCard.explanation}</p>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Detected Indicators</h3>
              <div className="space-y-1.5">
                {selectedCard.indicators.map((ind, i) => {
                  const cardConfig = getRiskLevelConfig(selectedCard.riskLevel)
                  return (
                    <div key={i} className="flex items-start gap-2">
                      <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', cardConfig.dot)} />
                      <span className="text-sm text-slate-600">{ind}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-700 mb-1">How This Engine Works</p>
              <p className="text-sm text-blue-600">{selectedCard.detail}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
