'use client'

import { useState } from 'react'
import { ScanUpload } from '@/components/sentra/ScanUpload'
import { RiskScoreCard } from '@/components/sentra/RiskScoreCard'
import { DocumentEngine } from '@/lib/engines/document-engine'
import { DocumentAnalysis } from '@/types'
import { getRiskLevelConfig } from '@/lib/utils'
import { FileText, AlertTriangle, CheckCircle, Loader2, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

const SEVERITY_STYLES: Record<string, string> = {
  info: 'bg-slate-50 border-slate-200 text-slate-700',
  caution: 'bg-amber-50 border-amber-200 text-amber-700',
  suspicious: 'bg-orange-50 border-orange-200 text-orange-700',
  high_risk: 'bg-red-50 border-red-200 text-red-700',
  critical: 'bg-rose-50 border-rose-200 text-rose-700',
}

const DEMO_TEXTS = [
  { label: 'Safe Receipt', type: 'safe' as const },
  { label: 'Fake KYC Notice', type: 'kyc_scam' as const },
  { label: 'Lottery Scam', type: 'lottery' as const },
]

export default function DocumentScannerPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DocumentAnalysis | null>(null)
  const [extractedText, setExtractedText] = useState('')

  const analyzeText = async (text: string) => {
    if (!text.trim()) return
    setLoading(true)
    setResult(null)
    await new Promise(r => setTimeout(r, 1200))
    const analysis = DocumentEngine.analyzeText(text)
    setResult(analysis)
    setExtractedText(text)
    setLoading(false)
  }

  const handleFile = async (file: File) => {
    setLoading(true)
    setResult(null)
    const text = await DocumentEngine.simulateOCR(file)
    setExtractedText(text)
    const analysis = DocumentEngine.analyzeText(text)
    setResult(analysis)
    setLoading(false)
  }

  const handleDemo = (type: 'safe' | 'kyc_scam' | 'lottery') => {
    const text = DocumentEngine.getDemoText(type)
    analyzeText(text)
  }

  const config = result ? getRiskLevelConfig(result.riskLevel) : null

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Document Scanner</h1>
        <p className="text-slate-500 mt-0.5">
          Analyze suspicious documents for fraud indicators using SENTRA's NLP engine
        </p>
      </div>

      {/* Upload + Input */}
      {!result && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            Upload or Paste Document
          </h2>
          <ScanUpload
            onFile={handleFile}
            onText={text => setExtractedText(text)}
            loading={loading}
            label="Upload Document"
            description="Upload an image, PDF, or document. SENTRA will extract and analyze the text."
          />
          {extractedText && !loading && (
            <button
              onClick={() => analyzeText(extractedText)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Analyze Pasted Text
            </button>
          )}

          {/* Demo documents */}
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-medium text-slate-500 mb-2">Try demo documents:</p>
            <div className="flex gap-2 flex-wrap">
              {DEMO_TEXTS.map(({ label, type }) => (
                <button
                  key={type}
                  onClick={() => handleDemo(type)}
                  className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
          <p className="text-sm text-slate-600 font-medium">Extracting and analyzing text...</p>
          <div className="mt-3 space-y-1 text-xs text-slate-400 text-center">
            <p>Running OCR extraction</p>
            <p>Detecting fraud indicators</p>
            <p>Calculating document risk score</p>
          </div>
        </div>
      )}

      {/* Result */}
      {result && config && !loading && (
        <div className="space-y-4 animate-slide-in">
          {/* Disclaimer */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <p className="text-xs text-blue-700">
              <span className="font-bold">Note:</span> SENTRA does not confirm fraud. This analysis highlights indicators commonly associated with scams. Always verify independently.
            </p>
          </div>

          {/* Score */}
          <div className={cn('bg-white rounded-2xl border-2 p-5', config.border, config.bg)}>
            <div className="flex items-center gap-4 flex-wrap">
              <RiskScoreCard
                score={result.documentScore}
                riskLevel={result.riskLevel}
                confidence={result.confidence}
                showArc
                size="md"
              />
              <div className="flex-1">
                <h3 className={cn('font-bold text-lg', config.color)}>
                  {result.riskLevel === 'safe' ? 'Document Appears Safe' : 'Fraud Indicators Found'}
                </h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{result.explanation}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Confidence: {Math.round(result.confidence * 100)}%
                </p>
              </div>
            </div>
          </div>

          {/* Detected indicators */}
          {result.detectedIndicators.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-3">
                {result.detectedIndicators.length} Indicator{result.detectedIndicators.length > 1 ? 's' : ''} Detected
              </h3>
              <div className="space-y-2">
                {result.detectedIndicators.map((ind, i) => {
                  const style = SEVERITY_STYLES[ind.severity] ?? SEVERITY_STYLES.caution
                  const typeLabel = ind.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                  return (
                    <div key={i} className={cn('flex items-start gap-3 p-3 rounded-xl border text-sm', style)}>
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold">{typeLabel}: </span>
                        <span>{ind.text}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Extracted text */}
          {extractedText && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-700 mb-3">Extracted Text</h3>
              <pre className="text-xs text-slate-600 bg-slate-50 rounded-xl p-4 overflow-auto max-h-40 whitespace-pre-wrap font-mono leading-relaxed">
                {extractedText}
              </pre>
            </div>
          )}

          {/* Safety advice */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-emerald-800 mb-2">🛡 How to Stay Safe</p>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>• Real banks never ask for OTP or advance fees by message</li>
              <li>• Government agencies do not demand online payments via QR/UPI</li>
              <li>• If a document asks you to keep it secret — it is almost certainly a scam</li>
              <li>• When in doubt, call your bank directly using the official number</li>
            </ul>
          </div>

          <button
            onClick={() => { setResult(null); setExtractedText('') }}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mx-auto"
          >
            <RefreshCcw className="w-4 h-4" />
            Scan another document
          </button>
        </div>
      )}
    </div>
  )
}
