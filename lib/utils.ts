import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { RiskLevel, InterventionType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRiskLevelConfig(level: RiskLevel) {
  const configs = {
    safe: {
      label: 'SAFE',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-700',
      dot: 'bg-emerald-500',
      gradient: 'from-emerald-50 to-emerald-100',
    },
    caution: {
      label: 'CAUTION',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-700',
      dot: 'bg-amber-500',
      gradient: 'from-amber-50 to-amber-100',
    },
    suspicious: {
      label: 'SUSPICIOUS',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      badge: 'bg-orange-100 text-orange-700',
      dot: 'bg-orange-500',
      gradient: 'from-orange-50 to-orange-100',
    },
    high_risk: {
      label: 'HIGH RISK',
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-700',
      dot: 'bg-red-500',
      gradient: 'from-red-50 to-red-100',
    },
    critical: {
      label: 'CRITICAL',
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-300',
      badge: 'bg-rose-100 text-rose-800',
      dot: 'bg-rose-600',
      gradient: 'from-rose-50 to-rose-100',
    },
  }
  return configs[level] ?? configs.safe
}

export function getInterventionConfig(intervention: InterventionType) {
  const configs = {
    allow: { label: 'Allow', description: 'Transaction can proceed normally.' },
    educate: { label: 'Educate', description: 'Show safety tips before proceeding.' },
    confirm: { label: 'Confirm', description: 'Ask user to confirm before proceeding.' },
    pause: { label: 'Pause', description: 'Transaction paused pending review.' },
    guardian_review: { label: 'Guardian Review', description: 'Alert trusted guardian for review.' },
  }
  return configs[intervention] ?? configs.allow
}

export function scoreToRiskLevel(score: number): RiskLevel {
  if (score <= 25) return 'safe'
  if (score <= 50) return 'caution'
  if (score <= 70) return 'suspicious'
  if (score <= 85) return 'high_risk'
  return 'critical'
}

export function riskLevelToIntervention(level: RiskLevel): InterventionType {
  const map: Record<RiskLevel, InterventionType> = {
    safe: 'allow',
    caution: 'educate',
    suspicious: 'confirm',
    high_risk: 'pause',
    critical: 'guardian_review',
  }
  return map[level]
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-IN')
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * True only if the input at least looks like someone attempted a URL —
 * has a scheme, or is domain-shaped (label.label...). Bare words like "m"
 * or "hello" fail this; a broken-but-attempted URL (e.g. "http://") passes
 * it and is left to the reputation engine to score as suspicious/unverifiable.
 */
export function looksLikeUrlAttempt(input: string): boolean {
  const trimmed = input.trim()
  if (trimmed.length < 4) return false
  if (/\s/.test(trimmed)) return false
  if (/^https?:\/\//i.test(trimmed)) return true
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/.*)?$/i.test(trimmed)
}

/**
 * Validates an Indian mobile number: optional +91/91/0 prefix, then 10
 * digits starting with 6-9. Spaces and hyphens are allowed for readability
 * and stripped before checking.
 */
export function isValidIndianPhone(input: string): boolean {
  const digitsOnly = input.trim().replace(/[\s-]/g, '')
  return /^(\+?91|0)?[6-9]\d{9}$/.test(digitsOnly)
}
