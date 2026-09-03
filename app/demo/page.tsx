'use client'

import { useState, useEffect, useRef } from 'react'
import { PatternTimeline } from '@/components/sentra/PatternTimeline'
import { RiskScoreCard } from '@/components/sentra/RiskScoreCard'
import { DemoScenarioCard } from '@/components/sentra/DemoScenarioCard'
import { InterventionModal } from '@/components/sentra/InterventionModal'
import { DemoScenario, DemoStep, RiskLevel, RiskSignal } from '@/types'
import { getRiskLevelConfig, formatCurrency } from '@/lib/utils'
import {
  Zap,
  Play,
  RotateCcw,
  Shield,
  AlertOctagon,
  ArrowRight,
  CheckCircle,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'normal',
    title: 'Normal Payment',
    description: 'Regular grocery payment to a known merchant. SENTRA confirms this is safe.',
    category: 'normal',
    icon: '🛒',
    color: 'emerald',
    steps: [
      { id: 's1', title: 'Payment Initiated', description: 'Paying BigMart Superstore for groceries', amount: 1847, riskScore: 5, riskLevel: 'safe', delay: 800, signals: ['Known merchant', 'Regular pattern'] },
      { id: 's2', title: 'SENTRA Analysis', description: 'Analyzing payment context and history', amount: 1847, riskScore: 5, riskLevel: 'safe', delay: 1200 },
      { id: 's3', title: 'Payment Approved', description: 'Transaction approved — no fraud signals detected', amount: 1847, riskScore: 5, riskLevel: 'safe', delay: 800, signals: ['SAFE'] },
    ],
  },
  {
    id: 'kyc_scam',
    title: 'Fake KYC Scam',
    description: 'Someone posing as a bank asks for a KYC "processing fee". SENTRA detects the pattern.',
    category: 'kyc_scam',
    icon: '🏦',
    color: 'orange',
    steps: [
      { id: 's1', title: 'Suspicious SMS Received', description: 'User receives a fake bank KYC update request', riskScore: 15, riskLevel: 'caution', delay: 1000, signals: ['Urgency detected', 'Authority impersonation'] },
      { id: 's2', title: 'User Clicks Link', description: 'User opens a suspicious link from the message', riskScore: 40, riskLevel: 'caution', delay: 1200, signals: ['Suspicious URL', 'Bank impersonation'] },
      { id: 's3', title: 'Payment Attempt: ₹299', description: 'User about to pay "KYC processing fee"', amount: 299, riskScore: 75, riskLevel: 'high_risk', delay: 1000, signals: ['Advance fee request', 'New payee', 'Suspicious URL'] },
      { id: 's4', title: 'SENTRA INTERVENES', description: 'Transaction paused — KYC fee fraud pattern detected', amount: 299, riskScore: 85, riskLevel: 'critical', delay: 800, signals: ['CRITICAL', 'Fraud Pattern'] },
    ],
  },
  {
    id: 'repeated_small',
    title: 'Repeated Small Payment Scam',
    description: 'This is SENTRA\'s core innovation — detecting individual small payments that collectively form a fraud pattern.',
    category: 'repeated_small',
    icon: '🔄',
    color: 'red',
    steps: [
      { id: 's1', title: 'Payment 1: ₹2,000', description: 'First payment to new contact Rajesh Kumar', amount: 2000, riskScore: 20, riskLevel: 'caution', delay: 1000, signals: ['New recipient', 'First contact'] },
      { id: 's2', title: 'Payment 2: ₹2,000', description: 'Second identical payment — pattern begins forming', amount: 2000, riskScore: 42, riskLevel: 'caution', delay: 1200, signals: ['Repeated amount', 'Suspicious call'] },
      { id: 's3', title: 'Payment 3: ₹2,000', description: 'Risk escalates sharply — three payments in 15 minutes', amount: 2000, riskScore: 68, riskLevel: 'suspicious', delay: 1000, signals: ['Pattern detected', 'Urgency pressure', 'Prior warning'] },
      { id: 's4', title: 'SENTRA INTERVENES', description: 'Fourth payment paused — critical fraud pattern confirmed', amount: 2500, riskScore: 92, riskLevel: 'critical', delay: 800, signals: ['CRITICAL', 'Connected fraud', '₹8,500 total'] },
    ],
  },
  {
    id: 'suspicious_url',
    title: 'Suspicious URL Warning',
    description: 'User receives a link claiming to be their bank. SENTRA detects banking impersonation.',
    category: 'suspicious_url',
    icon: '🔗',
    color: 'amber',
    steps: [
      { id: 's1', title: 'Link Received', description: 'User receives: sbi-kyc-update.ml/verify-account', riskScore: 25, riskLevel: 'caution', delay: 800, signals: ['Unusual TLD', 'Banking keyword'] },
      { id: 's2', title: 'URL Analysis', description: 'SENTRA scans the URL for fraud patterns', riskScore: 65, riskLevel: 'suspicious', delay: 1200, signals: ['Bank impersonation', 'Free domain', 'KYC keywords'] },
      { id: 's3', title: 'HIGH RISK URL DETECTED', description: 'URL confirmed as banking phishing site', riskScore: 82, riskLevel: 'high_risk', delay: 800, signals: ['DO NOT CLICK', 'Impersonation confirmed'] },
    ],
  },
  {
    id: 'qr_scam',
    title: 'QR Receive-Money Scam',
    description: 'User believes they are receiving money, but the QR code initiates a payment.',
    category: 'qr_scam',
    icon: '📱',
    color: 'purple',
    steps: [
      { id: 's1', title: 'QR Code Received', description: 'User told: "Scan to receive your refund"', riskScore: 15, riskLevel: 'caution', delay: 1000, signals: ['QR received', 'Unverified source'] },
      { id: 's2', title: 'QR Direction Analysis', description: 'SENTRA analyzes payment direction', riskScore: 45, riskLevel: 'caution', delay: 1200, signals: ['Collect request detected', 'Payment request'] },
      { id: 's3', title: 'WARNING: You Will SEND Money', description: 'QR requires YOU to pay — not receive', riskScore: 75, riskLevel: 'high_risk', delay: 800, signals: ['Confirmed: SEND direction', 'Deception detected'] },
    ],
  },
  {
    id: 'document_scam',
    title: 'Fake Document Scam',
    description: 'A fraudulent document claims to be from the government, demanding advance fees.',
    category: 'document_scam',
    icon: '📄',
    color: 'rose',
    steps: [
      { id: 's1', title: 'Document Received', description: 'User receives "official" government notice', riskScore: 20, riskLevel: 'caution', delay: 800, signals: ['Unknown sender', 'Authority claims'] },
      { id: 's2', title: 'Document Analysis', description: 'SENTRA OCR extracts and analyzes text', riskScore: 50, riskLevel: 'suspicious', delay: 1500, signals: ['Urgency keywords', 'Authority impersonation'] },
      { id: 's3', title: 'FRAUD INDICATORS DETECTED', description: 'Multiple scam patterns found in document', riskScore: 80, riskLevel: 'high_risk', delay: 800, signals: ['Advance fee request', 'Secrecy instructions', 'Pressure tactics'] },
    ],
  },
]

interface TimelineEvent {
  id: string
  timestamp: string
  amount?: number
  payee?: string
  riskScore: number
  riskLevel: RiskLevel
  signals?: string[]
  isIntervention?: boolean
  interventionMessage?: string
}

interface StepState {
  step: DemoStep
  completed: boolean
  active: boolean
}

export default function DemoPage() {
  const [activeScenario, setActiveScenario] = useState<DemoScenario | null>(null)
  const [stepStates, setStepStates] = useState<StepState[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([])
  const [showIntervention, setShowIntervention] = useState(false)
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const runRef = useRef(false)

  const handleSelectScenario = (scenario: DemoScenario) => {
    if (isRunning) return
    setActiveScenario(scenario)
    setStepStates(scenario.steps.map(s => ({ step: s, completed: false, active: false })))
    setCurrentStepIndex(-1)
    setIsRunning(false)
    setIsComplete(false)
    setShowIntervention(false)
    setTimelineEvents([])
  }

  const runScenario = async () => {
    if (!activeScenario || isRunning) return
    setIsRunning(true)
    setIsComplete(false)
    runRef.current = true

    const now = new Date()
    const events: TimelineEvent[] = []

    for (let i = 0; i < activeScenario.steps.length; i++) {
      if (!runRef.current) break
      const step = activeScenario.steps[i]

      setCurrentStepIndex(i)
      setStepStates(prev => prev.map((s, idx) => ({
        ...s,
        active: idx === i,
        completed: idx < i,
      })))

      await new Promise(r => setTimeout(r, step.delay + 400))

      const stepTime = new Date(now.getTime() + i * 7 * 60000)
      const timeStr = stepTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      const isLast = i === activeScenario.steps.length - 1
      const isCritical = step.riskLevel === 'critical'

      events.push({
        id: `step_${i}`,
        timestamp: timeStr,
        amount: step.amount,
        payee: activeScenario.category === 'repeated_small' ? 'Rajesh Kumar' : step.amount ? 'Payee' : undefined,
        riskScore: step.riskScore,
        riskLevel: step.riskLevel,
        signals: step.signals,
        isIntervention: isCritical,
        interventionMessage: isCritical
          ? `SENTRA detected a critical fraud pattern. Transaction paused. Total exposure: ${step.amount ? formatCurrency(step.amount) : 'Blocked'}.`
          : undefined,
      })

      setTimelineEvents([...events])

      if (isCritical && isLast) {
        await new Promise(r => setTimeout(r, 600))
        setShowIntervention(true)
      }
    }

    setStepStates(prev => prev.map(s => ({ ...s, active: false, completed: true })))
    setCurrentStepIndex(-1)
    setIsRunning(false)
    setIsComplete(true)
    if (activeScenario) setCompletedScenarios(prev => [...new Set([...prev, activeScenario.id])])
  }

  const handleReset = () => {
    runRef.current = false
    setIsRunning(false)
    setIsComplete(false)
    setCurrentStepIndex(-1)
    setShowIntervention(false)
    setTimelineEvents([])
    if (activeScenario) {
      setStepStates(activeScenario.steps.map(s => ({ step: s, completed: false, active: false })))
    }
  }

  const currentStep = currentStepIndex >= 0 ? activeScenario?.steps[currentStepIndex] : null
  const lastStep = activeScenario?.steps[activeScenario.steps.length - 1]
  const lastConfig = lastStep ? getRiskLevelConfig(lastStep.riskLevel) : null

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">DEMO MODE</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Hackathon Demo Mode</h1>
          <p className="text-slate-500 mt-0.5">
            Watch SENTRA detect fraud patterns in real-time simulations
          </p>
        </div>
        {activeScenario && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>

      {/* Core message */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex-1">
            <p className="font-bold text-lg leading-tight mb-1">
              "Every Rupee Protected — Not Just the Big Ones"
            </p>
            <p className="text-blue-200 text-sm leading-relaxed">
              SENTRA's core innovation: individual small transactions appear safe, but connected patterns reveal fraud. Watch the repeated small payment scenario for the key demo.
            </p>
          </div>
          <div className="flex-shrink-0 bg-white/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-black">₹2,000</div>
            <div className="text-xs text-blue-200">Risk: 20 → 92</div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Scenario cards */}
        <div>
          <h2 className="font-bold text-slate-700 mb-3">Select a Scenario</h2>
          <div className="grid grid-cols-2 gap-3">
            {DEMO_SCENARIOS.map(scenario => (
              <DemoScenarioCard
                key={scenario.id}
                scenario={scenario}
                isActive={activeScenario?.id === scenario.id}
                isCompleted={completedScenarios.includes(scenario.id)}
                isLoading={isRunning && activeScenario?.id === scenario.id}
                onPlay={() => handleSelectScenario(scenario)}
              />
            ))}
          </div>

          {/* Highlight repeated small */}
          <div className="mt-3 bg-red-50 border-2 border-red-300 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <div>
                <p className="text-sm font-bold text-red-700">Key Demo: Repeated Small Payment Scam</p>
                <p className="text-xs text-red-500">This demonstrates SENTRA's core innovation — watch risk grow from 20 to 92</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active scenario view */}
        <div>
          {!activeScenario && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 flex flex-col items-center justify-center min-h-64 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="font-bold text-slate-700">Select a Scenario</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">
                Choose a fraud scenario to watch SENTRA detect and respond to the threat in real time.
              </p>
            </div>
          )}

          {activeScenario && (
            <div className="space-y-4">
              {/* Scenario header */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{activeScenario.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{activeScenario.title}</h3>
                    <p className="text-xs text-slate-500">{activeScenario.description}</p>
                  </div>
                </div>

                {/* Current step indicator */}
                {currentStep && (
                  <div className={cn('rounded-xl p-3 mb-3 border', getRiskLevelConfig(currentStep.riskLevel).border, getRiskLevelConfig(currentStep.riskLevel).bg)}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={cn('w-2 h-2 rounded-full animate-pulse', getRiskLevelConfig(currentStep.riskLevel).dot)} />
                      <span className={cn('text-xs font-bold', getRiskLevelConfig(currentStep.riskLevel).color)}>
                        {currentStep.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{currentStep.description}</p>
                    {currentStep.amount && (
                      <p className="font-bold text-slate-800 mt-1">{formatCurrency(currentStep.amount)}</p>
                    )}
                  </div>
                )}

                {/* Live risk score */}
                {currentStep && (
                  <div className="flex items-center justify-center py-2">
                    <RiskScoreCard
                      score={currentStep.riskScore}
                      riskLevel={currentStep.riskLevel}
                      showArc
                      size="md"
                      label="Live Risk Score"
                    />
                  </div>
                )}

                {/* Steps progress */}
                <div className="flex gap-1.5 mt-3">
                  {activeScenario.steps.map((step, i) => {
                    const state = stepStates[i]
                    const stepConfig = getRiskLevelConfig(step.riskLevel)
                    return (
                      <div
                        key={i}
                        className={cn(
                          'flex-1 h-2 rounded-full transition-all duration-300',
                          state?.completed ? stepConfig.dot : state?.active ? cn(stepConfig.dot, 'animate-pulse') : 'bg-slate-200'
                        )}
                      />
                    )
                  })}
                </div>

                {/* Controls */}
                {!isRunning && !isComplete && (
                  <button
                    onClick={runScenario}
                    className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Run Scenario
                  </button>
                )}

                {isRunning && (
                  <div className="mt-4 text-center text-sm text-slate-500 font-medium">
                    Simulating scenario step by step...
                  </div>
                )}

                {isComplete && lastStep && lastConfig && (
                  <div className={cn('mt-4 rounded-xl p-3 border', lastConfig.border, lastConfig.bg)}>
                    {lastStep.riskLevel === 'critical' ? (
                      <div className="flex items-center gap-2">
                        <AlertOctagon className={cn('w-5 h-5', lastConfig.color)} />
                        <span className={cn('font-bold text-sm', lastConfig.color)}>SENTRA INTERVENED — Scenario Complete</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span className="font-bold text-sm text-emerald-700">Safe Scenario Complete</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Timeline */}
              {timelineEvents.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-700 mb-3 text-sm">Live Risk Timeline</h3>
                  <PatternTimeline
                    events={timelineEvents}
                    showInsight={isComplete && timelineEvents.some(e => e.riskScore > 60)}
                    insightText={
                      activeScenario.id === 'repeated_small'
                        ? 'SENTRA detected that these individually small transactions formed a connected fraud pattern. Risk escalated from 20 to 92 across just 4 payments.'
                        : 'SENTRA connected the signals from this session into a fraud pattern.'
                    }
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Intervention Modal */}
      {showIntervention && lastStep && (
        <InterventionModal
          isOpen={showIntervention}
          onClose={() => setShowIntervention(false)}
          onGoBack={() => setShowIntervention(false)}
          onGuardian={() => setShowIntervention(false)}
          riskLevel={lastStep.riskLevel}
          riskScore={lastStep.riskScore}
          confidence={0.95}
          explanation={
            activeScenario?.id === 'repeated_small'
              ? 'SENTRA detected that four individually small payments to a new recipient occurred in rapid succession following a suspicious call. Each payment appeared safe alone, but the pattern is a confirmed fraud signature.'
              : 'SENTRA detected critical fraud signals and has paused this transaction to protect you.'
          }
          detectedSignals={
            lastStep.signals?.map(s => ({
              type: s.toLowerCase().replace(/\s/g, '_'),
              severity: 'high_risk' as const,
              score: 20,
              description: s,
            })) ?? []
          }
          intervention="guardian_review"
          payee={activeScenario?.id === 'repeated_small' ? 'Rajesh Kumar' : undefined}
          amount={lastStep.amount}
        />
      )}
    </div>
  )
}
