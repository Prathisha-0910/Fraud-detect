'use client'

import { Shield, Bell, User, ChevronDown } from 'lucide-react'
import { getGreeting } from '@/lib/utils'

export function TopBar() {
  const greeting = getGreeting()

  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0">
      {/* Mobile spacer for hamburger */}
      <div className="w-10 md:w-0" />

      {/* Center title - mobile */}
      <div className="flex-1 flex items-center justify-center md:justify-start">
        <div className="md:hidden flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-slate-800">SENTRA</span>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span className="text-sm text-slate-500">
            <span className="font-medium text-slate-700">Demo Mode</span> — Simulated data only
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notification bell */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
          <Bell className="w-4 h-4 md:w-5 md:h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User profile */}
        <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">Priya Sharma</p>
            <p className="text-xs text-slate-400 leading-none mt-0.5">Demo User</p>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />
        </button>
      </div>
    </header>
  )
}
