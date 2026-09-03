import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { SentraRiskEngine } from '@/lib/engines/risk-engine'
import { VelocityEngine } from '@/lib/engines/velocity-engine'
import { ReputationEngine } from '@/lib/engines/reputation-engine'
import { DEMO_SUSPICIOUS_TRANSACTIONS } from '@/lib/demo-data'

const AnalyzeSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().positive(),
  payee: z.string().min(1),
  payeeIsNew: z.boolean(),
  payeeType: z.string().default('individual'),
  suspiciousCall: z.boolean().default(false),
  urgentMessage: z.boolean().default(false),
  suspiciousUrl: z.boolean().default(false),
  previousWarning: z.boolean().default(false),
  documentContext: z.string().optional(),
  url: z.string().optional(),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = AnalyzeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const input = parsed.data
    const engine = new SentraRiskEngine()

    // Use demo transactions for velocity analysis context
    const recentTransactions = DEMO_SUSPICIOUS_TRANSACTIONS.map(t => ({
      amount: t.amount,
      payee: t.payee,
      payeeIsNew: t.payeeIsNew,
      timestamp: t.timestamp,
      riskScore: t.riskScore,
      suspiciousCall: t.suspiciousCall,
      urgentMessage: t.urgentMessage,
    }))

    // Run velocity analysis
    const velocityAnalysis = await VelocityEngine.analyze(recentTransactions, {
      amount: input.amount,
      payee: input.payee,
      payeeIsNew: input.payeeIsNew,
      timestamp: new Date(),
      suspiciousCall: input.suspiciousCall,
    })

    // Run reputation analysis if URL or phone provided
    const reputationAnalysis = (input.url || input.phone)
      ? ReputationEngine.analyze({ url: input.url, phone: input.phone })
      : undefined

    // Calculate cumulative context from recent history
    const recentScores = recentTransactions
      .filter(t => t.payee.toLowerCase() === input.payee.toLowerCase())
      .map(t => t.riskScore ?? 0)

    const cumulativeContext = {
      recentRiskScores: recentScores,
      previousWarnings: input.previousWarning ? 1 : 0,
      cumulativeExposure: recentScores.reduce((a, b) => a + b, 0),
    }

    // Run main risk assessment
    const assessment = await engine.calculateRisk(
      {
        userId: input.userId,
        amount: input.amount,
        payee: input.payee,
        payeeIsNew: input.payeeIsNew,
        payeeType: input.payeeType,
        suspiciousCall: input.suspiciousCall,
        urgentMessage: input.urgentMessage,
        suspiciousUrl: input.suspiciousUrl,
        previousWarning: input.previousWarning,
        documentContext: input.documentContext,
      },
      cumulativeContext,
      velocityAnalysis,
      reputationAnalysis
    )

    // Return assessment
    return NextResponse.json({
      success: true,
      assessment,
      transaction: {
        id: `txn_${Date.now()}`,
        amount: input.amount,
        payee: input.payee,
        payeeIsNew: input.payeeIsNew,
        timestamp: new Date().toISOString(),
        status: assessment.intervention === 'pause' || assessment.intervention === 'guardian_review'
          ? 'paused'
          : 'completed',
      },
    })
  } catch (error) {
    console.error('[/api/analyze] Error:', error)
    return NextResponse.json(
      { error: 'Analysis failed', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
