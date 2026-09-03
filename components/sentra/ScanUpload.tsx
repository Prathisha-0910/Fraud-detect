'use client'

import { cn } from '@/lib/utils'
import { Upload, FileText, Image, X, Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'

interface ScanUploadProps {
  onFile?: (file: File) => void
  onText?: (text: string) => void
  accept?: string
  label?: string
  description?: string
  loading?: boolean
  className?: string
}

export function ScanUpload({
  onFile,
  onText,
  accept = 'image/*,.pdf,.doc,.docx',
  label = 'Upload Document',
  description = 'Drag and drop or click to upload an image, PDF, or document',
  loading,
  className,
}: ScanUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFile = (file: File) => {
    setSelectedFile(file)
    onFile?.(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className={className}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-150 cursor-pointer',
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : selectedFile
            ? 'border-emerald-400 bg-emerald-50'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100'
        )}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />

        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-sm text-blue-600 font-medium">Analyzing document...</p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{selectedFile.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
              onClick={e => {
                e.stopPropagation()
                setSelectedFile(null)
              }}
            >
              <X className="w-3 h-3" /> Change file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-700">{label}</p>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">{description}</p>
            </div>
            <div className="flex gap-2 text-xs text-slate-400">
              <span>JPG</span>
              <span>•</span>
              <span>PNG</span>
              <span>•</span>
              <span>PDF</span>
              <span>•</span>
              <span>DOC</span>
            </div>
          </div>
        )}
      </div>

      {/* Manual text input option */}
      {onText && (
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-slate-500">or paste text directly</span>
            </div>
          </div>
          <textarea
            className="mt-3 w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            placeholder="Paste document text here for analysis..."
            onChange={e => onText(e.target.value)}
          />
        </div>
      )}
    </div>
  )
}
