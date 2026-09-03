'use client'

import { Shield, Bell, Lock, Eye, Database, Info, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

function SettingToggle({ label, description, defaultValue }: { label: string; description: string; defaultValue?: boolean }) {
  const [enabled, setEnabled] = useState(defaultValue ?? true)
  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-700">{label}</div>
        <div className="text-xs text-slate-400 mt-0.5">{description}</div>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0',
          enabled ? 'bg-blue-600' : 'bg-slate-300'
        )}
      >
        <span className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
          enabled ? 'translate-x-5' : 'translate-x-0'
        )} />
      </button>
    </div>
  )
}

function SettingSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-blue-500" />
        <h2 className="font-bold text-slate-800">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const [riskSensitivity, setRiskSensitivity] = useState('medium')

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-0.5">Configure your SENTRA safety preferences</p>
      </div>

      {/* Demo mode notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Demo Mode Active.</span> Settings below are for demonstration. No actual data is stored or transmitted.
        </p>
      </div>

      {/* Safety preferences */}
      <SettingSection title="Safety Preferences" icon={Shield}>
        <SettingToggle
          label="SENTRA Monitoring Active"
          description="Enable real-time fraud analysis for all transactions"
          defaultValue={true}
        />
        <SettingToggle
          label="Guardian Alerts"
          description="Notify trusted guardians for critical risk events"
          defaultValue={true}
        />
        <SettingToggle
          label="Transaction Pause on High Risk"
          description="Automatically pause transactions above High Risk threshold"
          defaultValue={true}
        />
        <SettingToggle
          label="QR Payment Direction Warning"
          description="Always show payment direction before confirming QR payments"
          defaultValue={true}
        />

        {/* Risk sensitivity */}
        <div className="pt-3">
          <div className="text-sm font-medium text-slate-700 mb-2">Risk Sensitivity</div>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as const).map(level => (
              <button
                key={level}
                onClick={() => setRiskSensitivity(level)}
                className={cn(
                  'py-2 rounded-lg text-xs font-semibold border transition-all',
                  riskSensitivity === level
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            {riskSensitivity === 'high' ? 'More cautious — may flag more transactions' : riskSensitivity === 'low' ? 'Less cautious — fewer alerts' : 'Balanced protection for most users'}
          </p>
        </div>
      </SettingSection>

      {/* Notifications */}
      <SettingSection title="Notifications" icon={Bell}>
        <SettingToggle label="In-App Alerts" description="Show fraud warnings within the app" defaultValue={true} />
        <SettingToggle label="Critical Event Alerts" description="Alert for transactions above 85 risk score" defaultValue={true} />
        <SettingToggle label="Daily Safety Summary" description="Receive a daily summary of monitored activity" defaultValue={false} />
      </SettingSection>

      {/* Privacy */}
      <SettingSection title="Privacy & Data" icon={Lock}>
        <SettingToggle label="Minimal Data Storage" description="Only store essential fraud analysis data" defaultValue={true} />
        <SettingToggle label="Explainable Decisions" description="Always show why a transaction was flagged" defaultValue={true} />
        <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
          <p className="font-semibold text-slate-600 mb-1">Data Minimization Pledge</p>
          <p>SENTRA stores only the minimum data needed for fraud analysis. No biometric data, call recordings, or SMS content is accessed without explicit permission. All analysis results are explainable and auditable.</p>
        </div>
      </SettingSection>

      {/* Engine weights */}
      <SettingSection title="Fraud Engine Configuration" icon={Eye}>
        <div className="space-y-3">
          {[
            { label: 'New Payee Risk Weight', value: 15 },
            { label: 'Repeated Payment Weight', value: 20 },
            { label: 'Transaction Velocity Weight', value: 20 },
            { label: 'Suspicious Context Weight', value: 20 },
            { label: 'Previous Warning Weight', value: 15 },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-xs font-medium text-slate-600">{label}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${value * 4}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-600 w-6">+{value}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Engine weights are configurable in production for different user risk profiles.
        </p>
      </SettingSection>

      {/* About */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5" />
          <span className="font-bold">SENTRA v1.0 — Hackathon MVP</span>
        </div>
        <p className="text-sm text-blue-200 leading-relaxed">
          Every Rupee Protected — Not Just the Big Ones. Designed for vulnerable users including senior citizens, first-time digital banking users, and digitally inexperienced individuals.
        </p>
        <p className="text-xs text-blue-300 mt-2">Built with Next.js, Prisma, TypeScript, and explainable AI</p>
      </div>
    </div>
  )
}
