import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        riskAssessment: true,
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    const now = Date.now()
    const isPaused = transaction.status === 'paused'
    const pausedUntilMs = transaction.pausedUntil ? new Date(transaction.pausedUntil).getTime() : null
    const remainingSeconds = isPaused && pausedUntilMs ? Math.max(0, Math.ceil((pausedUntilMs - now) / 1000)) : 0
    const canResume = isPaused && remainingSeconds === 0

    return NextResponse.json({
      success: true,
      transaction: {
        ...transaction,
        remainingSeconds,
        canResume,
      },
    })
  } catch (error) {
    console.error('[/api/transactions/:id] GET Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
