'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Shield,
  Activity,
  Brain,
  GitBranch,
  Link2,
  QrCode,
  FileText,
  Clock,
  Users,
  Settings,
  Zap,
  ChevronRight,
  X,
  Menu,
} from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: Shield, description: 'Safety overview' },
  { href: '/simulator', label: 'Transaction Simulator', icon: Activity, description: 'Test fraud signals' },
  { href: '/intelligence', label: 'Fraud Intelligence', icon: Brain, description: 'Risk analysis center' },
  { href: '/timeline', label: 'Payment Timeline', icon: GitBranch, description: 'Pattern visualization' },
  { href: '/url-scanner', label: 'URL Scanner', icon: Link2, description: 'Check suspicious links' },
  { href: '/qr-scanner', label: 'QR Scanner', icon: QrCode, description: 'Analyze QR codes' },
  { href: '/document-scanner', label: 'Document Scanner', icon: FileText, description: 'Scan documents' },
  { href: '/risk-timeline', label: 'Risk Timeline', icon: Clock, description: 'Activity history' },
  { href: '/guardian', label: 'Guardian Center', icon: Users, description: 'Trusted contacts' },
  { href: '/demo', label: 'Demo Mode', icon: Zap, description: 'Hackathon scenarios', highlight: true },
  { href: '/settings', label: 'Settings', icon: Settings, description: 'Preferences' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200 transition-transform duration-300',
          'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-sm">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">SENTRA</span>
            <p className="text-xs text-slate-400 leading-none mt-0.5">Fraud Intelligence</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon, highlight }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : highlight
                    ? 'text-indigo-600 hover:bg-indigo-50'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 flex-shrink-0',
                    isActive ? 'text-blue-600' : highlight ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                />
                <span className="flex-1 truncate">{label}</span>
                {highlight && (
                  <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-semibold">
                    DEMO
                  </span>
                )}
                {isActive && <ChevronRight className="w-3 h-3 text-blue-400" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-100">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-slate-700">SENTRA Active</span>
            </div>
            <p className="text-xs text-slate-500">Every Rupee Protected</p>
          </div>
        </div>
      </aside>
    </>
  )
}
