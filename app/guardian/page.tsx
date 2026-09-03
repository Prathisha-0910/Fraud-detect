'use client'

import { useState } from 'react'
import { GuardianCard } from '@/components/sentra/GuardianCard'
import { DEMO_GUARDIAN } from '@/lib/demo-data'
import { UserPlus, Shield, AlertOctagon, Phone, User, Heart, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Guardian {
  id: string
  name: string
  relationship: string
  contact: string
  active: boolean
}

const RELATIONSHIPS = ['parent', 'child', 'spouse', 'sibling', 'friend', 'other']

export default function GuardianPage() {
  const [guardians, setGuardians] = useState<Guardian[]>([
    {
      id: DEMO_GUARDIAN.id,
      name: DEMO_GUARDIAN.name,
      relationship: DEMO_GUARDIAN.relationship,
      contact: DEMO_GUARDIAN.contact,
      active: DEMO_GUARDIAN.active,
    },
  ])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', relationship: 'child', contact: '' })
  const [saving, setSaving] = useState(false)
  const [guardianAlertActive, setGuardianAlertActive] = useState(true)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    const newGuardian: Guardian = {
      id: `guardian_${Date.now()}`,
      name: form.name,
      relationship: form.relationship,
      contact: form.contact,
      active: true,
    }
    setGuardians(prev => [...prev, newGuardian])
    setForm({ name: '', relationship: 'child', contact: '' })
    setShowForm(false)
    setSaving(false)
  }

  const handleDelete = (id: string) => {
    setGuardians(prev => prev.filter(g => g.id !== id))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Guardian Center</h1>
        <p className="text-slate-500 mt-0.5">
          Add trusted family members who will be alerted if SENTRA detects critical fraud risk
        </p>
      </div>

      {/* Critical Alert Simulation */}
      {guardianAlertActive && (
        <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-5 animate-slide-in">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0 pulse-danger">
              <AlertOctagon className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="font-bold text-rose-800 text-lg">SENTRA SAFETY ALERT</h2>
              <p className="text-sm text-rose-600">A suspicious payment pattern has been detected</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 mb-4 border border-rose-200">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">Risk Score</span>
                <div className="font-bold text-rose-700 text-2xl">92 / 100</div>
              </div>
              <div>
                <span className="text-slate-500">Status</span>
                <div className="font-bold text-rose-700">Transaction Paused</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-slate-500 mb-1.5">Reasons for Alert:</div>
              <div className="space-y-1">
                {['Repeated small payments to new recipient', 'Suspicious call context detected', '4 transactions in 20 minutes — Total ₹8,500'].map((reason, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                    <span className="text-xs text-slate-600">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" />
              Call Guardian Now
            </button>
            <button
              onClick={() => setGuardianAlertActive(false)}
              className="px-4 py-2.5 bg-white border border-rose-300 text-rose-600 rounded-xl text-sm font-medium hover:bg-rose-50 transition-colors"
            >
              Dismiss Alert
            </button>
          </div>

          <p className="text-xs text-rose-500 mt-2 text-center">
            (Simulation — This is demo data only)
          </p>
        </div>
      )}

      {/* Guardian list */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-slate-800">Trusted Guardians</h2>
            <p className="text-xs text-slate-500">{guardians.length} guardian{guardians.length !== 1 ? 's' : ''} configured</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Guardian
          </button>
        </div>

        {guardians.length === 0 && !showForm && (
          <div className="text-center py-10 text-slate-400">
            <User className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No guardians added yet</p>
            <p className="text-xs mt-1">Add a trusted family member to receive alerts</p>
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
              hasAlert={guardianAlertActive && guardian.id === DEMO_GUARDIAN.id}
              alertMessage="Critical fraud pattern detected — Risk Score: 92. Transaction paused pending review."
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
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Relationship</label>
              <select
                value={form.relationship}
                onChange={e => setForm(p => ({ ...p, relationship: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {RELATIONSHIPS.map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Contact Number</label>
              <input
                type="tel"
                value={form.contact}
                onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                placeholder="+91 98765 43210"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save Guardian
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
            { emoji: '🔍', title: 'SENTRA Detects', text: 'SENTRA continuously monitors payment patterns for fraud signals' },
            { emoji: '⚡', title: 'Alert Triggered', text: 'When risk reaches CRITICAL level, an in-app alert is generated' },
            { emoji: '📞', title: 'Guardian Notified', text: 'Your trusted guardian receives an immediate safety alert' },
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
