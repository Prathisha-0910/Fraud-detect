'use client'

import { useState } from 'react'
import { QREngine } from '@/lib/engines/qr-engine'
import { RiskScoreCard } from '@/components/sentra/RiskScoreCard'
import { FraudSignalCard } from '@/components/sentra/FraudSignalCard'
import { QRAnalysisResult } from '@/types'
import { getRiskLevelConfig, formatCurrency } from '@/lib/utils'
import { QrCode, ArrowUpRight, ArrowDownLeft, AlertOctagon, CheckCircle, Loader2, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEMO_SCENARIOS = [
  {
    id: 'receive',
    label: 'Receive Money (Safe)',
    description: 'A payment from a friend — you receive money',
    type: 'receive' as const,
    emoji: '✅',
  },
  {
    id: 'payment_request',
    label: 'Payment Request (Warning)',
    description: 'Collect request — you will SEND money',
    type: 'payment_request' as const,
    emoji: '⚠️',
  },
  {
    id: 'suspicious',
    label: 'Suspicious QR (Critical)',
    description: 'Fake bank KYC fee QR code',
    type: 'suspicious' as const,
    emoji: '🚨',
  },
]

export default function QRScannerPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<QRAnalysisResult | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [manualQR, setManualQR] = useState('')

  const analyze = async (qrString: string, scenarioId?: string) => {
    setLoading(true)
    setResult(null)
    if (scenarioId) setSelectedScenario(scenarioId)
    await new Promise(r => setTimeout(r, 900))
    const analysis = QREngine.analyzeQR(qrString)
    setResult(analysis)
    setLoading(false)
  }

  const config = result ? getRiskLevelConfig(result.riskLevel) : null

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">QR Safety Scanner</h1>
        <p className="text-slate-500 mt-0.5">
          Understand exactly what any QR code will do before scanning it
        </p>
      </div>

      {/* Critical education card */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h2 className="font-bold text-amber-800 mb-1">Important: QR Codes Can SEND Your Money</h2>
            <p className="text-sm text-amber-700 leading-relaxed">
              Scammers send you a "receive money" QR code — but when you scan it, your bank app asks you to <strong>pay</strong>, not receive. Always check the payment direction before confirming.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
            <ArrowUpRight className="w-7 h-7 text-red-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-red-700">SEND MONEY</p>
            <p className="text-xs text-red-500">Collect / Payment Request QR</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
            <ArrowDownLeft className="w-7 h-7 text-emerald-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-emerald-700">RECEIVE MONEY</p>
            <p className="text-xs text-emerald-500">Pay / Static QR</p>
          </div>
        </div>
      </div>

      {/* Demo scenarios */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-700 mb-4">Try Demo QR Scenarios</h2>
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          {DEMO_SCENARIOS.map(scenario => (
            <button
              key={scenario.id}
              onClick={() => analyze(scenario.type, scenario.id)}
              className={cn(
                'p-4 rounded-xl border-2 text-left transition-all duration-150',
                selectedScenario === scenario.id
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <div className="text-2xl mb-2">{scenario.emoji}</div>
              <div className="text-sm font-semibold text-slate-700">{scenario.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{scenario.description}</div>
            </button>
          ))}
        </div>

        {/* Manual QR input */}
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-medium text-slate-500 mb-2">Or paste a UPI QR string:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualQR}
              onChange={e => setManualQR(e.target.value)}
              placeholder="upi://pay?pa=someone@upi&pn=Name..."
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => analyze(manualQR)}
              disabled={!manualQR.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Analyze
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
          <p className="text-sm text-slate-600 font-medium">Analyzing QR code...</p>
        </div>
      )}

      {/* Result */}
      {result && config && !loading && (
        <div className="space-y-4 animate-slide-in">
          {/* Direction - the most critical info */}
          <div className={cn(
            'rounded-2xl border-2 p-6 text-center',
            result.direction === 'send'
              ? result.riskScore > 50 ? 'border-rose-400 bg-rose-50' : 'border-amber-400 bg-amber-50'
              : 'border-emerald-400 bg-emerald-50'
          )}>
            <div className="flex justify-center mb-3">
              {result.direction === 'send' ? (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="w-8 h-8 text-red-600" />
                </div>
              ) : result.direction === 'receive' ? (
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <ArrowDownLeft className="w-8 h-8 text-emerald-600" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-slate-500" />
                </div>
              )}
            </div>

            {result.direction === 'send' && (
              <div>
                <p className="text-xl font-black text-red-700 tracking-wide">YOU WILL SEND MONEY</p>
                {result.isPaymentRequest && (
                  <div className="mt-2 inline-block bg-red-200 text-red-800 px-3 py-1 rounded-full text-xs font-bold">
                    ⚠ This is a PAYMENT REQUEST — not receive
                  </div>
                )}
              </div>
            )}
            {result.direction === 'receive' && (
              <p className="text-xl font-black text-emerald-700">YOU WILL RECEIVE MONEY</p>
            )}
            {result.direction === 'unknown' && (
              <p className="text-lg font-bold text-slate-600">Payment direction unclear</p>
            )}

            {result.amount && (
              <p className="text-3xl font-bold text-slate-800 mt-2">{formatCurrency(result.amount)}</p>
            )}
            {result.payee && (
              <p className="text-sm text-slate-600 mt-1">to {result.payee}</p>
            )}
          </div>

          {/* Risk assessment */}
          <div className={cn('bg-white rounded-2xl border-2 p-5', config.border)}>
            <div className="flex items-center gap-4">
              <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} showArc size="md" />
              <div className="flex-1">
                <h3 className={cn('font-bold', config.color)}>{config.label}</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{result.explanation}</p>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-700 mb-3">⚠ Safety Warnings</h3>
              <div className="space-y-2">
                {result.warnings.map((warning, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                    <AlertOctagon className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => { setResult(null); setSelectedScenario(null); setManualQR('') }}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mx-auto"
          >
            <RefreshCcw className="w-4 h-4" />
            Scan another QR code
          </button>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
          <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700">Ready to Scan</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
            Select a demo scenario above or paste a UPI QR string to analyze
          </p>
        </div>
      )}
    </div>
  )
}
