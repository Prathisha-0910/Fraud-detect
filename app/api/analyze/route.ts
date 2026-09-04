import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { SentraRiskEngine } from '@/lib/engines/risk-engine'
import { VelocityEngine } from '@/lib/engines/velocity-engine'
import { ReputationEngine } from '@/lib/engines/reputation-engine'
import { notifyGuardians } from '@/lib/notify-guardians'

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

    // Ensure user exists in database to prevent foreign key errors
    await prisma.user.upsert({
      where: { id: input.userId },
      update: {},
      create: {
        id: input.userId,
        name: input.userId === 'demo-user' ? 'Priya Sharma' : input.userId,
        email: `${input.userId}@sentra.demo`,
        riskBaseline: 10,
      },
    })

    // Fetch real recent transactions for this user
    const recentDbRows = await prisma.transaction.findMany({
      where: { userId: input.userId },
      orderBy: { timestamp: 'desc' },
      take: 20,
    })

    const recentTransactions = recentDbRows.map(t => ({
      amount: t.amount,
      payee: t.payee,
      payeeIsNew: t.payeeIsNew,
      timestamp: t.timestamp,
      riskScore: t.riskScore ?? 0,
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

    // Calculate cumulative context from real recent history
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

    // Derive status based on intervention
    let status = 'completed'
    let pausedUntil: Date | null = null

    if (assessment.intervention === 'pause') {
      status = 'paused'
      pausedUntil = new Date(Date.now() + 60_000) // 60-second cooldown
    } else if (assessment.intervention === 'guardian_review') {
      status = 'blocked'
    } else if (assessment.intervention === 'educate' || assessment.intervention === 'confirm') {
      status = 'pending'
    }

    // 1. Persist Transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: input.userId,
        amount: input.amount,
        payee: input.payee,
        payeeIsNew: input.payeeIsNew,
        payeeType: input.payeeType,
        timestamp: new Date(),
        status,
        pausedUntil,
        suspiciousCall: input.suspiciousCall,
        urgentMessage: input.urgentMessage,
        suspiciousUrl: input.suspiciousUrl,
        previousWarning: input.previousWarning,
        documentContext: input.documentContext,
        riskScore: assessment.finalScore,
        riskLevel: assessment.riskLevel,
        isSimulated: true,
      },
    })

    // 2. Persist RiskAssessment
    await prisma.riskAssessment.create({
      data: {
        userId: input.userId,
        transactionId: transaction.id,
        contextScore: assessment.componentScores.contextScore,
        behaviourScore: assessment.componentScores.behaviourScore,
        velocityScore: assessment.componentScores.velocityScore,
        reputationScore: assessment.componentScores.reputationScore,
        documentScore: assessment.componentScores.documentScore,
        cumulativeScore: assessment.componentScores.cumulativeScore,
        finalScore: assessment.finalScore,
        riskLevel: assessment.riskLevel,
        confidence: assessment.confidence,
        intervention: assessment.intervention,
        explanation: assessment.explanation,
        detectedSignals: JSON.stringify(assessment.detectedSignals),
      },
    })

    // 3. Persist FraudEvents if suspicious, high_risk, or critical
    if (
      assessment.riskLevel === 'suspicious' ||
      assessment.riskLevel === 'high_risk' ||
      assessment.riskLevel === 'critical'
    ) {
      for (const signal of assessment.detectedSignals) {
        await prisma.fraudEvent.create({
          data: {
            userId: input.userId,
            transactionId: transaction.id,
            eventType: signal.type,
            description: signal.description,
            riskScore: assessment.finalScore,
            severity: signal.severity,
            timestamp: new Date(),
            acknowledged: false,
            metadata: JSON.stringify({
              signalScore: signal.score,
              amount: input.amount,
              payee: input.payee,
              intervention: assessment.intervention,
            }),
          },
        })
      }
    }

    // 4. Trigger Guardian Notification on critical risk
    if (assessment.riskLevel === 'critical') {
      await notifyGuardians(input.userId, {
        id: transaction.id,
        amount: input.amount,
        payee: input.payee,
        riskScore: assessment.finalScore,
      })
    }

    // Return assessment with real persisted transaction ID & metadata
    return NextResponse.json({
      success: true,
      assessment,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        payee: transaction.payee,
        payeeIsNew: transaction.payeeIsNew,
        timestamp: transaction.timestamp.toISOString(),
        status: transaction.status,
        pausedUntil: transaction.pausedUntil?.toISOString() ?? null,
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
