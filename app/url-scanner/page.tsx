'use client'

import { useState } from 'react'
import { RiskScoreCard } from '@/components/sentra/RiskScoreCard'
import { FraudSignalCard } from '@/components/sentra/FraudSignalCard'
import { ReputationEngine } from '@/lib/engines/reputation-engine'
import { URLAnalysisResult } from '@/types'
import { getRiskLevelConfig, looksLikeUrlAttempt } from '@/lib/utils'
import { Link2, Shield, AlertTriangle, CheckCircle, Loader2, ExternalLink, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEMO_URLS = [
  { label: 'Legitimate (HDFC Bank)', url: 'https://hdfcbank.com/login' },
  { label: 'Suspicious (KYC Scam)', url: 'https://sbi-kyc-update.ml/verify-account' },
  { label: 'Phishing (Bank Impersonation)', url: 'http://192.168.1.100/sbi-secure/login.php' },
  { label: 'Unknown Domain', url: 'https://rupee-reward-claim.xyz/get-prize' },
]

export default function URLScannerPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<URLAnalysisResult | null>(null)
  const [inputError, setInputError] = useState<string | null>(null)

  const handleAnalyze = async (urlToAnalyze?: string) => {
    const target = urlToAnalyze ?? url
    if (!target.trim()) return

    if (!looksLikeUrlAttempt(target)) {
      setResult(null)
      setInputError("That doesn't look like a URL. Enter a web address, e.g. example.com or https://example.com")
      return
    }

    setInputError(null)
    setLoading(true)
    setResult(null)
    await new Promise(r => setTimeout(r, 800))
    const analysis = ReputationEngine.analyzeURL(target)
    setResult(analysis)
    setLoading(false)
  }

  const config = result ? getRiskLevelConfig(result.riskLevel) : null

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">URL Scanner</h1>
        <p className="text-slate-500 mt-0.5">
          Analyze suspicious links before clicking or making payments
        </p>
      </div>

      {/* Scanner input */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-blue-500" />
          Analyze a URL
        </h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="url"
              value={url}
              onChange={e => { setUrl(e.target.value); if (inputError) setInputError(null) }}
              placeholder="Paste a URL to analyze..."
              className={cn(
                'w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent',
                inputError ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-blue-500'
              )}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            />
          </div>
          <button
            onClick={() => handleAnalyze()}
            disabled={loading || !url.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold px-5 py-3 rounded-xl transition-colors flex items-center gap-2 text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            Scan
          </button>
        </div>

        {inputError && (
          <p className="text-xs text-red-600 mt-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            {inputError}
          </p>
        )}

        {/* Demo URLs */}
        <div className="mt-4">
          <p className="text-xs font-medium text-slate-500 mb-2">Try demo URLs:</p>
          <div className="flex flex-wrap gap-2">
            {DEMO_URLS.map(({ label, url: demoUrl }) => (
              <button
                key={demoUrl}
                onClick={() => { setUrl(demoUrl); handleAnalyze(demoUrl) }}
                className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
          <p className="text-sm text-slate-600 font-medium">Analyzing URL reputation...</p>
          <p className="text-xs text-slate-400 mt-1">Checking domain patterns, keywords, and known threats</p>
        </div>
      )}

      {/* Result */}
      {result && config && !loading && (
        <div className="space-y-4 animate-slide-in">
          {/* Main result card */}
          <div className={cn('bg-white rounded-2xl border-2 p-5', config.border, config.bg)}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {result.riskScore === 0 ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className={cn('w-5 h-5 flex-shrink-0', config.color)} />
                  )}
                  <span className={cn('font-bold', config.color)}>{config.label}</span>
                  {result.isBankingImpersonation && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">IMPERSONATION</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <p className="text-xs text-slate-600 break-all font-mono">{result.url}</p>
                </div>
                <p className="text-sm text-slate-700 mt-3 leading-relaxed">{result.explanation}</p>
              </div>
              <RiskScoreCard
                score={result.riskScore}
                riskLevel={result.riskLevel}
                showArc
                size="sm"
              />
            </div>
          </div>

          {/* Indicators */}
          {result.indicators.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-700 mb-3">Detected Indicators</h3>
              <div className="space-y-2">
                {result.indicators.map((ind, i) => (
                  <FraudSignalCard
                    key={i}
                    type="reputation_concern"
                    severity={result.riskScore > 70 ? 'high_risk' : result.riskScore > 40 ? 'suspicious' : 'caution'}
                    score={result.riskScore / result.indicators.length}
                    description={ind}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Safety advice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-2">💡 Safety Advice</p>
            {result.riskScore === 0 ? (
              <p className="text-sm text-blue-700">This URL appears legitimate. Always verify you're on the correct banking website before entering credentials.</p>
            ) : result.riskScore > 60 ? (
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Do NOT enter any login credentials on this site</li>
                <li>• Do NOT make any payments through this link</li>
                <li>• Report this URL to your bank if you received it as a banking message</li>
                <li>• Contact your bank directly using the number on the back of your card</li>
              </ul>
            ) : (
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Verify the sender before clicking suspicious links</li>
                <li>• Double-check the URL spelling carefully</li>
                <li>• When in doubt, navigate to the official website directly</li>
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700">URL Scanner Ready</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
            Paste any URL to check if it's safe. Try the demo URLs above to see SENTRA detect different threat types.
          </p>
        </div>
      )}
    </div>
  )
}
