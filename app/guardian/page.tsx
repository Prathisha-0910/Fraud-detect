'use client'

import { useState, useMemo } from 'react'
import { GuardianCard } from '@/components/sentra/GuardianCard'
import { useLivePoll } from '@/lib/hooks/useLivePoll'
import { UserPlus, Shield, AlertOctagon, Phone, User, Heart, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Guardian {
  id: string
  name: string
  relationship: string
  contact: string
  active: boolean
}

interface FraudEvent {
  id: string
  eventType: string
  description: string
  riskScore: number
  severity: string
  timestamp: string
  acknowledged: boolean
  metadata?: string | Record<string, any>
}

const RELATIONSHIPS = ['child', 'parent', 'spouse', 'sibling', 'friend', 'other']

export default function GuardianPage() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', relationship: 'child', contact: '' })
  const [saving, setSaving] = useState(false)
  const [acknowledging, setAcknowledging] = useState(false)

  // 1. Live Poll: Guardians list (every 4s)
  const { data: guardiansData, refresh: refreshGuardians } = useLivePoll<{
    success: boolean
    count: number
    guardians: Guardian[]
  }>('/api/guardians?userId=demo-user', 4000)

  // 2. Live Poll: Unacknowledged fraud alerts (every 3s)
  const { data: alertsData, refresh: refreshAlerts } = useLivePoll<{
    success: boolean
    count: number
    events: FraudEvent[]
  }>('/api/fraud-events?userId=demo-user&acknowledged=false', 3000)

  const guardians = useMemo(() => guardiansData?.guardians ?? [], [guardiansData])
  const activeEvents = useMemo(() => alertsData?.events ?? [], [alertsData])

  // Look for any unacknowledged critical alert
  const criticalAlert = useMemo(() => {
    return activeEvents.find(e => e.severity === 'critical' || e.riskScore >= 75) ?? null
  }, [activeEvents])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.contact) return
    setSaving(true)

    try {
      const res = await fetch('/api/guardians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          name: form.name,
          relationship: form.relationship,
          contact: form.contact,
        }),
      })

      if (res.ok) {
        setForm({ name: '', relationship: 'child', contact: '' })
        setShowForm(false)
        refreshGuardians()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add guardian')
      }
    } catch (err) {
      console.error('Error adding guardian:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/guardians/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        refreshGuardians()
      }
    } catch (err) {
      console.error('Error deleting guardian:', err)
    }
  }

  const handleAcknowledgeAlert = async () => {
    if (!criticalAlert) return
    setAcknowledging(true)
    try {
      const res = await fetch(`/api/fraud-events/${criticalAlert.id}/acknowledge`, {
        method: 'POST',
      })
      if (res.ok) {
        refreshAlerts()
      }
    } catch (err) {
      console.error('Error acknowledging alert:', err)
    } finally {
      setAcknowledging(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Guardian Center</h1>
          <p className="text-slate-500 mt-0.5">
            Add trusted family members who will receive real-time alerts if critical fraud risk is detected
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Monitoring
        </div>
      </div>

      {/* Live Critical Alert Banner (Only rendered when real unacknowledged critical alert exists) */}
      {criticalAlert && (
        <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-5 animate-slide-in shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0 pulse-danger">
              <AlertOctagon className="w-5 h-5 text-rose-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-rose-800 text-lg">SENTRA SAFETY ALERT</h2>
                <span className="text-xs bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full font-semibold">
                  LIVE INTERVENTION
                </span>
              </div>
              <p className="text-sm text-rose-600">A high-risk suspicious transaction pattern was blocked</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 mb-4 border border-rose-200">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">Risk Score</span>
                <div className="font-bold text-rose-700 text-2xl">
                  {Math.round(criticalAlert.riskScore)} / 100
                </div>
              </div>
              <div>
                <span className="text-slate-500">Status</span>
                <div className="font-bold text-rose-700">Transaction Blocked / Paused</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-slate-500 mb-1.5">Detected Threat Trigger:</div>
              <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-100 text-xs font-medium text-rose-800 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full flex-shrink-0" />
                <span>{criticalAlert.description}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              onClick={() => alert(`Calling guardian: ${guardians[0]?.name || 'Guardian'} (${guardians[0]?.contact || 'No contact configured'})`)}
            >
              <Phone className="w-4 h-4" />
              Call Guardian ({guardians[0]?.name ?? 'Primary'})
            </button>
            <button
              type="button"
              onClick={handleAcknowledgeAlert}
              disabled={acknowledging}
              className="px-4 py-2.5 bg-white border border-rose-300 text-rose-700 rounded-xl text-sm font-medium hover:bg-rose-100 transition-colors flex items-center gap-1.5"
            >
              {acknowledging ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
              Acknowledge & Clear Alert
            </button>
          </div>
        </div>
      )}

      {/* Guardian list */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-slate-800">Trusted Guardians</h2>
            <p className="text-xs text-slate-500">
              {guardians.length} guardian{guardians.length !== 1 ? 's' : ''} saved in database
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Guardian
          </button>
        </div>

        {guardians.length === 0 && !showForm && (
          <div className="text-center py-10 text-slate-400">
            <User className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No guardians added yet</p>
            <p className="text-xs mt-1">Add a trusted family member to receive real-time notifications</p>
          </div>
        )}

        <div className="space-y-3">
          {guardians.map(guardian => (
            <GuardianCard
              key={guardian.id}
              id={guardian.id}
              name={guardian.name}
              relationship={guardian.relationship}
              contact={guardian.contact}
              active={guardian.active}
              hasAlert={Boolean(criticalAlert)}
              alertMessage={criticalAlert?.description}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Add form */}
        {showForm && (
          <form onSubmit={handleAdd} className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-slide-in">
            <h3 className="font-semibold text-slate-700 text-sm">Add New Guardian</h3>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Guardian's name"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Relationship</label>
              <select
                value={form.relationship}
                onChange={e => setForm(p => ({ ...p, relationship: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {RELATIONSHIPS.map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email or Phone Number</label>
              <input
                type="text"
                value={form.contact}
                onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                placeholder="guardian@example.com or +91 98765 43210"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Enter an email to receive live Resend email alerts when critical scams are detected.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save Guardian to Database
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-5">
        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          How Guardian Protection Works
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { emoji: '🔍', title: 'SENTRA Detects', text: 'Pattern engine detects velocity, call state, and social engineering' },
            { emoji: '⚡', title: 'Alert Triggered', text: 'When risk reaches CRITICAL level, live in-app intervention blocks the transaction' },
            { emoji: '📧', title: 'Guardian Alerted', text: 'Live email is dispatched instantly to configured guardians via Resend' },
          ].map((step, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-blue-100">
              <div className="text-2xl mb-2">{step.emoji}</div>
              <div className="font-semibold text-slate-700 text-sm mb-1">{step.title}</div>
              <p className="text-xs text-slate-500">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
