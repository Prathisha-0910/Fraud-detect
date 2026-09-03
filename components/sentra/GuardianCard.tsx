'use client'

import { cn } from '@/lib/utils'
import { User, Phone, Trash2, Shield, CheckCircle } from 'lucide-react'

interface GuardianCardProps {
  id: string
  name: string
  relationship: string
  contact: string
  active: boolean
  hasAlert?: boolean
  alertMessage?: string
  onDelete?: (id: string) => void
  className?: string
}

export function GuardianCard({
  id,
  name,
  relationship,
  contact,
  active,
  hasAlert,
  alertMessage,
  onDelete,
  className,
}: GuardianCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border p-4 transition-all duration-150',
        hasAlert ? 'border-red-300 shadow-md' : 'border-slate-200',
        className
      )}
    >
      {/* Alert banner */}
      {hasAlert && alertMessage && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-700">SENTRA SAFETY ALERT</p>
              <p className="text-xs text-red-600 mt-0.5">{alertMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-200">
          <User className="w-5 h-5 text-blue-600" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 text-sm">{name}</span>
            {active ? (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-xs text-emerald-600 font-medium">Active</span>
              </div>
            ) : (
              <span className="text-xs text-slate-400">Inactive</span>
            )}
          </div>
          <p className="text-xs text-slate-500 capitalize">{relationship}</p>
          <div className="flex items-center gap-1 mt-1">
            <Phone className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500">{contact}</span>
          </div>
        </div>

        {/* Actions */}
        {onDelete && (
          <button
            onClick={() => onDelete(id)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status */}
      <div className="mt-3 flex items-center gap-2">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-xs text-slate-500">
          Will be alerted for <span className="font-medium text-slate-700">CRITICAL</span> risk events
        </span>
      </div>
    </div>
  )
}
