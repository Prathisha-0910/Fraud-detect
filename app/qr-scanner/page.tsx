'use client'

import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { QREngine } from '@/lib/engines/qr-engine'
import { RiskScoreCard } from '@/components/sentra/RiskScoreCard'
import { QRAnalysisResult } from '@/types'
import { getRiskLevelConfig, formatCurrency } from '@/lib/utils'
import {
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  AlertOctagon,
  CheckCircle,
  Loader2,
  RefreshCcw,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const DEMO_SCENARIOS = [
  {
    id: 'receive',
    label: 'Receive Money (Safe)',
    description: 'A payment from a friend — you receive money',
    type: 'receive' as const,
    emoji: '✅',
    qrString: 'upi://pay?pa=yourfriend@upi&pn=Friend+Name&am=500&tn=Splitting+bill',
  },
  {
    id: 'payment_request',
    label: 'Payment Request (Warning)',
    description: 'Collect request — you will SEND money',
    type: 'payment_request' as const,
    emoji: '⚠️',
    qrString: 'upi://collect?pa=unknown123@paytm&pn=Unknown+Merchant&am=5000&tn=Payment+Required',
  },
  {
    id: 'suspicious',
    label: 'Suspicious QR (Critical)',
    description: 'Fake bank KYC fee QR code',
    type: 'suspicious' as const,
    emoji: '🚨',
    qrString: 'upi://collect?pa=kyc-update@scam.ml&pn=SBI+Bank+Official&am=299&tn=KYC+Processing+Fee+URGENT',
  },
]

export default function QRScannerPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'scan'>('generate')

  // Scan tab state
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<QRAnalysisResult | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [manualQR, setManualQR] = useState('')
  const [scannedQrImage, setScannedQrImage] = useState<string | null>(null)

  // Generator tab state
  const [genAction, setGenAction] = useState<'pay' | 'collect'>('pay')
  const [genVpa, setGenVpa] = useState('arun.sharma@okhdfcbank')
  const [genName, setGenName] = useState('Arun Sharma')
  const [genAmount, setGenAmount] = useState('500')
  const [genNote, setGenNote] = useState('Dinner split')
  const [genQrImage, setGenQrImage] = useState<string | null>(null)
  const [genAnalysis, setGenAnalysis] = useState<QRAnalysisResult | null>(null)
  const [copied, setCopied] = useState(false)

  // Construct live UPI string for generator
  const currentUpiString = `${genAction === 'collect' ? 'upi://collect' : 'upi://pay'}?pa=${encodeURIComponent(genVpa.trim())}&pn=${encodeURIComponent(genName.trim())}${genAmount ? `&am=${encodeURIComponent(genAmount.trim())}` : ''}${genNote ? `&tn=${encodeURIComponent(genNote.trim())}` : ''}`

  // Debounced QR generation and live SENTRA analysis (300ms)
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const dataUrl = await QRCode.toDataURL(currentUpiString, {
          width: 260,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        })
        setGenQrImage(dataUrl)
      } catch (err) {
        console.error('Failed to generate QR data URL:', err)
      }

      // Run live SENTRA QR analysis immediately
      const analysis = QREngine.analyzeQR(currentUpiString)
      setGenAnalysis(analysis)
    }, 280)

    return () => clearTimeout(timer)
  }, [currentUpiString])

  // Scan tab analyze function
  const analyze = async (qrString: string, scenarioId?: string) => {
    setLoading(true)
    setResult(null)
    if (scenarioId) setSelectedScenario(scenarioId)

    // Generate visual QR image for the scanned code
    try {
      const img = await QRCode.toDataURL(qrString, { width: 220, margin: 1 })
      setScannedQrImage(img)
    } catch {
      setScannedQrImage(null)
    }

    await new Promise(r => setTimeout(r, 600))
    const analysis = QREngine.analyzeQR(qrString)
    setResult(analysis)
    setLoading(false)
  }

  const copyPayload = () => {
    navigator.clipboard.writeText(currentUpiString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const applyPreset = (preset: {
    action: 'pay' | 'collect'
    vpa: string
    name: string
    amount: string
    note: string
  }) => {
    setGenAction(preset.action)
    setGenVpa(preset.vpa)
    setGenName(preset.name)
    setGenAmount(preset.amount)
    setGenNote(preset.note)
  }

  const scanConfig = result ? getRiskLevelConfig(result.riskLevel) : null
  const genConfig = genAnalysis ? getRiskLevelConfig(genAnalysis.riskLevel) : null

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">QR Safety & Payment Engine</h1>
          <p className="text-slate-500 mt-0.5">
            Generate verified UPI payment codes or analyze suspicious QR requests in real time
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('generate')}
            className={cn(
              'px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
              activeTab === 'generate'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate Payment QR
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={cn(
              'px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
              activeTab === 'scan'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <QrCode className="w-3.5 h-3.5" />
            Scan & Analyze QR
          </button>
        </div>
      </div>

      {/* Critical education banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h2 className="font-bold text-amber-900 text-sm mb-0.5">
              The QR Direction Rule: QR Codes Can SEND or RECEIVE Money
            </h2>
            <p className="text-xs text-amber-800 leading-relaxed">
              Scammers often send victims a &quot;receive prize / cashback&quot; QR code. In reality, scanning a <strong>collect request</strong> instructs your bank app to <strong>SEND</strong> funds. SENTRA analyzes the protocol to protect you.
            </p>
          </div>
        </div>
      </div>

      {/* TAB 1: GENERATE PAYMENT QR */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          {/* Presets row */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Live Demo Presets:
              </span>
              <span className="text-xs text-slate-400">Click to load into live generator:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    action: 'pay',
                    vpa: 'arun.sharma@okhdfcbank',
                    name: 'Arun Sharma',
                    amount: '500',
                    note: 'Dinner bill split',
                  })
                }
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-colors"
              >
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                  <span>✅ Safe Bill Split</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 truncate">upi://pay · ₹500 · Personal</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    action: 'collect',
                    vpa: 'merchant-unknown@paytm',
                    name: 'Fast Rewards Claim',
                    amount: '4999',
                    note: 'Collect request for processing',
                  })
                }
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-left transition-colors"
              >
                <div className="flex items-center gap-1 text-xs font-bold text-amber-700">
                  <span>⚠️ Collect Request</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 truncate">upi://collect · ₹4,999 · Suspicious</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    action: 'collect',
                    vpa: 'kyc-update@sbi-secure.ml',
                    name: 'SBI Bank Official',
                    amount: '299',
                    note: 'Urgent KYC Verification Fee',
                  })
                }
                className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-left transition-colors"
              >
                <div className="flex items-center gap-1 text-xs font-bold text-rose-700">
                  <span>🚨 Phishing KYC Scam</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 truncate">upi://collect · ₹299 · Critical Scam</div>
              </button>
            </div>
          </div>

          {/* Generator Form & Live Visual QR + Risk Verdict */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
              <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Payment QR Parameters
              </h2>

              {/* Action type */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Payment Protocol Action
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGenAction('pay')}
                    className={cn(
                      'py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5',
                      genAction === 'pay'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                    Receive Pay (`upi://pay`)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenAction('collect')}
                    className={cn(
                      'py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5',
                      genAction === 'collect'
                        ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                    Collect Request (`upi://collect`)
                  </button>
                </div>
              </div>

              {/* Payee VPA */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                  Payee UPI ID (VPA)
                </label>
                <input
                  type="text"
                  value={genVpa}
                  onChange={e => setGenVpa(e.target.value)}
                  placeholder="e.g. name@okhdfcbank or kyc-verify@scam.ml"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Payee Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                  Payee Name
                </label>
                <input
                  type="text"
                  value={genName}
                  onChange={e => setGenName(e.target.value)}
                  placeholder="e.g. Arun Sharma or SBI Customer Support"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Amount & Note */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={genAmount}
                    onChange={e => setGenAmount(e.target.value)}
                    placeholder="500"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                    Note / Purpose
                  </label>
                  <input
                    type="text"
                    value={genNote}
                    onChange={e => setGenNote(e.target.value)}
                    placeholder="e.g. Urgent verification"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Live Payload Preview */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Generated UPI Payload String:
                  </span>
                  <button
                    type="button"
                    onClick={copyPayload}
                    className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs text-slate-700 break-all select-all">
                  {currentUpiString}
                </div>
              </div>
            </div>

            {/* Live Scannable QR Code + Live SENTRA Risk Verdict */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              {/* QR Image Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col items-center justify-center text-center shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Live Scannable QR Code
                </span>

                {genQrImage ? (
                  <div className="p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-inner">
                    <img
                      src={genQrImage}
                      alt="Live Payment QR Code"
                      className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                  </div>
                )}

                <p className="text-[11px] text-slate-400 mt-3 max-w-xs">
                  Scan this image with any smartphone camera or UPI banking app (Google Pay, PhonePe, Paytm).
                </p>
              </div>

              {/* Live SENTRA Verdict Card */}
              {genAnalysis && genConfig && (
                <div className={cn('bg-white rounded-2xl border-2 p-5 shadow-sm transition-all', genConfig.border)}>
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Live SENTRA Evaluation:
                      </span>
                      <span className={cn('text-xs font-black px-2.5 py-0.5 rounded-full', genConfig.badge)}>
                        {genConfig.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      {genAnalysis.direction === 'send' ? (
                        <span className="text-red-600 flex items-center gap-1">
                          <ArrowUpRight className="w-4 h-4" /> USER SENDS MONEY
                        </span>
                      ) : (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <ArrowDownLeft className="w-4 h-4" /> USER RECEIVES MONEY
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <RiskScoreCard score={genAnalysis.riskScore} riskLevel={genAnalysis.riskLevel} showArc size="md" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {genAnalysis.explanation}
                      </p>
                    </div>
                  </div>

                  {genAnalysis.warnings.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      {genAnalysis.warnings.map((w, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800"
                        >
                          <AlertOctagon className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCAN & ANALYZE QR */}
      {activeTab === 'scan' && (
        <div className="space-y-6">
          {/* Demo scenarios */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-700 mb-4">Try Demo QR Scenarios</h2>
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              {DEMO_SCENARIOS.map(scenario => (
                <button
                  key={scenario.id}
                  onClick={() => analyze(scenario.qrString, scenario.id)}
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
              <p className="text-sm text-slate-600 font-medium">Analyzing QR protocol & risk...</p>
            </div>
          )}

          {/* Result */}
          {result && scanConfig && !loading && (
            <div className="space-y-4 animate-slide-in">
              {/* Direction card */}
              <div
                className={cn(
                  'rounded-2xl border-2 p-6 text-center',
                  result.direction === 'send'
                    ? result.riskScore > 50
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-amber-400 bg-amber-50'
                    : 'border-emerald-400 bg-emerald-50'
                )}
              >
                <div className="flex justify-center mb-3">
                  {result.direction === 'send' ? (
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center shadow-inner">
                      <ArrowUpRight className="w-8 h-8 text-red-600" />
                    </div>
                  ) : result.direction === 'receive' ? (
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center shadow-inner">
                      <ArrowDownLeft className="w-8 h-8 text-emerald-600" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center shadow-inner">
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
                {result.payee && <p className="text-sm text-slate-600 mt-1">to {result.payee}</p>}
              </div>

              {/* Scanned QR visual preview & Risk assessment */}
              <div className={cn('bg-white rounded-2xl border-2 p-5', scanConfig.border)}>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {scannedQrImage && (
                    <div className="p-2 border border-slate-200 rounded-xl bg-white shadow-sm flex-shrink-0">
                      <img src={scannedQrImage} alt="Scanned QR" className="w-36 h-36 object-contain" />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
                    <RiskScoreCard score={result.riskScore} riskLevel={result.riskLevel} showArc size="md" />
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className={cn('font-bold text-base', scanConfig.color)}>{scanConfig.label}</h3>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">{result.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-700 mb-3">⚠ Safety Warnings</h3>
                  <div className="space-y-2">
                    {result.warnings.map((warning, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700"
                      >
                        <AlertOctagon className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setResult(null)
                  setSelectedScenario(null)
                  setManualQR('')
                  setScannedQrImage(null)
                }}
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
      )}
    </div>
  )
}
