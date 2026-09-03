'use client'

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { cn } from '@/lib/utils'

interface ScoreData {
  label: string
  score: number
  maxScore: number
}

interface RiskBreakdownChartProps {
  scores: ScoreData[]
  type?: 'bar' | 'radar'
  className?: string
}

const SCORE_COLORS = (score: number) => {
  if (score <= 25) return '#10b981'
  if (score <= 50) return '#f59e0b'
  if (score <= 70) return '#f97316'
  if (score <= 85) return '#ef4444'
  return '#e11d48'
}

export function RiskBreakdownChart({ scores, type = 'bar', className }: RiskBreakdownChartProps) {
  if (type === 'radar') {
    const data = scores.map(s => ({
      subject: s.label,
      score: s.score,
      fullMark: s.maxScore,
    }))

    return (
      <div className={cn('w-full h-48', className)}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
            <Radar
              name="Risk"
              dataKey="score"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const data = scores.map(s => ({
    name: s.label,
    score: Math.round(s.score),
    color: SCORE_COLORS(s.score),
  }))

  return (
    <div className={cn('w-full h-48', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: '#64748b' }} />
          <Tooltip
            formatter={(value) => [`${value}/100`, 'Score']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
          <Bar dataKey="score" radius={4}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
