import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    if (transaction.status !== 'paused') {
      return NextResponse.json(
        { error: 'Transaction is not paused', currentStatus: transaction.status },
        { status: 400 }
      )
    }

    const now = Date.now()
    const pausedUntilMs = transaction.pausedUntil ? new Date(transaction.pausedUntil).getTime() : 0

    if (now < pausedUntilMs) {
      const remainingSeconds = Math.ceil((pausedUntilMs - now) / 1000)
      return NextResponse.json(
        {
          error: 'Cooldown active',
          message: `Cannot resume yet. Cooldown expires in ${remainingSeconds}s.`,
          remainingSeconds,
        },
        { status: 400 }
      )
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        status: 'completed',
        pausedUntil: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Transaction resumed and completed successfully',
      transaction: updated,
    })
  } catch (error) {
    console.error('[/api/transactions/:id/resume] Error:', error)
    return NextResponse.json(
      { error: 'Failed to resume transaction', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
