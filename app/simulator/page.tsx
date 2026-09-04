'use client'

import { useState } from 'react'
import { RiskScoreCard } from '@/components/sentra/RiskScoreCard'
import { FraudExplanationPanel } from '@/components/sentra/FraudExplanationPanel'
import { InterventionModal } from '@/components/sentra/InterventionModal'
import { RiskBreakdownChart } from '@/components/sentra/RiskBreakdownChart'
import { RiskAssessmentResult } from '@/types'
import { formatCurrency, getRiskLevelConfig, looksLikeUrlAttempt, isValidIndianPhone } from '@/lib/utils'
import {
  Send,
  Shield,
  AlertTriangle,
  User,
  Phone,
  Link2,
  FileText,
  Clock,
  Info,
  Loader2,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PAYEE_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'merchant', label: 'Merchant / Business' },
  { value: 'utility', label: 'Utility / Govt' },
  { value: 'unknown', label: 'Unknown' },
]

interface FormState {
  amount: string
  payee: string
  payeeType: string
  payeeIsNew: boolean
  suspiciousCall: boolean
  urgentMessage: boolean
  suspiciousUrl: boolean
  previousWarning: boolean
  url: string
  phone: string
  documentContext: string
}

export default function SimulatorPage() {
  const [form, setForm] = useState<FormState>({
    amount: '',
    payee: '',
    payeeType: 'individual',
    payeeIsNew: false,
    suspiciousCall: false,
    urgentMessage: false,
    suspiciousUrl: false,
    previousWarning: false,
    url: '',
    phone: '',
    documentContext: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    assessment: RiskAssessmentResult
    transaction: { id: string; amount: number; payee: string; status: string }
  } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)

  const updateForm = (field: keyof FormState, value: boolean | string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (field === 'url') setUrlError(null)
    if (field === 'phone') setPhoneError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.amount || !form.payee) return

    // Only validate the optional fields if the user actually entered
    // something in them — an empty field is fine, a wrong one is not.
    let hasValidationError = false
    if (form.url.trim() && !looksLikeUrlAttempt(form.url)) {
      setUrlError("That doesn't look like a URL. Enter a real web address, e.g. example.com, or leave it blank.")
      hasValidationError = true
    } else {
      setUrlError(null)
    }
    if (form.phone.trim() && !isValidIndianPhone(form.phone)) {
      setPhoneError('Enter a valid 10-digit mobile number (e.g. 98765 43210), or leave it blank.')
      hasValidationError = true
    } else {
      setPhoneError(null)
    }
    if (hasValidationError) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          amount: parseFloat(form.amount),
          payee: form.payee,
          payeeType: form.payeeType,
          payeeIsNew: form.payeeIsNew,
          suspiciousCall: form.suspiciousCall,
          urgentMessage: form.urgentMessage,
          suspiciousUrl: form.suspiciousUrl,
          previousWarning: form.previousWarning,
          url: form.url || undefined,
          phone: form.phone || undefined,
          documentContext: form.documentContext || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed')

      setResult(data)

      // Auto-show modal for high risk
      if (
        data.assessment.riskLevel === 'high_risk' ||
        data.assessment.riskLevel === 'critical' ||
        data.assessment.riskLevel === 'suspicious'
      ) {
        setShowModal(true)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const config = result ? getRiskLevelConfig(result.assessment.riskLevel) : null

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Transaction Simulator</h1>
        <p className="text-slate-500 mt-0.5">
          Simulate a payment and let SENTRA analyze it for fraud signals
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-500" />
              Payment Details
            </h2>

            {/* Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Transaction Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => updateForm('amount', e.target.value)}
                  placeholder="0"
                  min="1"
                  required
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-lg font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Payee */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Recipient Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={form.payee}
                  onChange={e => updateForm('payee', e.target.value)}
                  placeholder="Payee or UPI ID"
                  required
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Payee type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Recipient Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PAYEE_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateForm('payeeType', value)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium border transition-all',
                      form.payeeType === value
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* New recipient toggle */}
            <Toggle
              label="New Recipient"
              description="Not previously paid before"
              value={form.payeeIsNew}
              onChange={v => updateForm('payeeIsNew', v)}
              warnColor="amber"
            />
          </div>

          {/* Context Signals */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Context Signals
              <span className="text-xs text-slate-400 font-normal">(Toggle to simulate fraud context)</span>
            </h2>

            <div className="space-y-3">
              <Toggle
                label="Suspicious Call Before Payment"
                description="Received a call asking to make payment"
                value={form.suspiciousCall}
                onChange={v => updateForm('suspiciousCall', v)}
                warnColor="orange"
                icon={<Phone className="w-4 h-4 text-orange-500" />}
              />
              <Toggle
                label="Urgent Message Pressure"
                description="Received urgent message demanding immediate payment"
                value={form.urgentMessage}
                onChange={v => updateForm('urgentMessage', v)}
                warnColor="orange"
                icon={<Clock className="w-4 h-4 text-orange-500" />}
              />
              <Toggle
                label="Suspicious URL in Context"
                description="Payment linked from a suspicious website"
                value={form.suspiciousUrl}
                onChange={v => updateForm('suspiciousUrl', v)}
                warnColor="red"
                icon={<Link2 className="w-4 h-4 text-red-500" />}
              />
              <Toggle
                label="Previous Fraud Warning"
                description="User has received prior warnings"
                value={form.previousWarning}
                onChange={v => updateForm('previousWarning', v)}
                warnColor="red"
                icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
              />
            </div>
          </div>

          {/* Optional fields */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400" />
              Optional Context
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Suspicious URL (for analysis)</label>
                <input
                  type="text"
                  value={form.url}
                  onChange={e => updateForm('url', e.target.value)}
                  placeholder="https://example.com..."
                  className={cn(
                    'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent',
                    urlError ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-blue-500'
                  )}
                />
                {urlError && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    {urlError}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Contact Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => updateForm('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className={cn(
                    'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent',
                    phoneError ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-blue-500'
                  )}
                />
                {phoneError && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    {phoneError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !form.amount || !form.payee}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-150 flex items-center justify-center gap-3 text-base shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing with SENTRA...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                ANALYZE WITH SENTRA
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}
        </form>

        {/* Results */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 flex flex-col items-center justify-center text-center min-h-64">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-700">SENTRA Ready</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">
                Fill in the payment details and click Analyze to see SENTRA's fraud assessment.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 flex flex-col items-center justify-center min-h-64">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <h3 className="font-semibold text-slate-700">Analyzing...</h3>
              <div className="mt-3 space-y-1.5 text-xs text-slate-400 text-center">
                <p>Running velocity analysis</p>
                <p>Checking reputation signals</p>
                <p>Calculating cumulative risk</p>
                <p>Generating explanation</p>
              </div>
            </div>
          )}

          {result && config && (
            <>
              {/* Score card */}
              <div className={cn('bg-white rounded-2xl border-2 p-5', config.border)}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-slate-800">SENTRA Assessment</h2>
                    <p className="text-xs text-slate-500">
                      {result.transaction.status === 'paused' ? (
                        <span className="text-red-600 font-medium">⚠ Transaction Paused</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">✓ Transaction Completed</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Details
                  </button>
                </div>

                <div className="flex items-center justify-center gap-8">
                  <RiskScoreCard
                    score={result.assessment.finalScore}
                    riskLevel={result.assessment.riskLevel}
                    confidence={result.assessment.confidence}
                    showArc
                    size="lg"
                  />
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-slate-500">Amount</div>
                      <div className="font-bold text-slate-800">{formatCurrency(result.transaction.amount)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Payee</div>
                      <div className="font-semibold text-slate-700">{result.transaction.payee}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Confidence</div>
                      <div className="font-semibold text-slate-700">
                        {Math.round(result.assessment.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-700 mb-3">Risk Breakdown</h3>
                <RiskBreakdownChart
                  scores={[
                    { label: 'Context', score: result.assessment.componentScores.contextScore, maxScore: 100 },
                    { label: 'Behaviour', score: result.assessment.componentScores.behaviourScore, maxScore: 100 },
                    { label: 'Velocity', score: result.assessment.componentScores.velocityScore, maxScore: 100 },
                    { label: 'Reputation', score: result.assessment.componentScores.reputationScore, maxScore: 100 },
                    { label: 'Cumulative', score: result.assessment.componentScores.cumulativeScore, maxScore: 100 },
                  ]}
                  type="bar"
                />
              </div>

              {/* Explanation */}
              <FraudExplanationPanel
                riskLevel={result.assessment.riskLevel}
                riskScore={result.assessment.finalScore}
                confidence={result.assessment.confidence}
                explanation={result.assessment.explanation}
                detectedSignals={result.assessment.detectedSignals}
                intervention={result.assessment.intervention}
              />
            </>
          )}
        </div>
      </div>

      {/* Intervention Modal */}
      {result && (
        <InterventionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onGoBack={() => setShowModal(false)}
          onContinue={() => setShowModal(false)}
          onGuardian={() => {
            setShowModal(false)
            // Would alert guardian in real system
          }}
          riskLevel={result.assessment.riskLevel}
          riskScore={result.assessment.finalScore}
          confidence={result.assessment.confidence}
          explanation={result.assessment.explanation}
          detectedSignals={result.assessment.detectedSignals}
          intervention={result.assessment.intervention}
          payee={result.transaction.payee}
          amount={result.transaction.amount}
        />
      )}
    </div>
  )
}

function Toggle({
  label,
  description,
  value,
  onChange,
  warnColor,
  icon,
}: {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
  warnColor?: 'amber' | 'orange' | 'red'
  icon?: React.ReactNode
}) {
  const activeColors = {
    amber: 'bg-amber-50 border-amber-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200',
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150',
        value && warnColor ? activeColors[warnColor] : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
      )}
      onClick={() => onChange(!value)}
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-700">{label}</div>
        <div className="text-xs text-slate-400">{description}</div>
      </div>
      <div className="flex-shrink-0">
        {value ? (
          <ToggleRight className="w-6 h-6 text-blue-500" />
        ) : (
          <ToggleLeft className="w-6 h-6 text-slate-300" />
        )}
      </div>
    </div>
  )
}
