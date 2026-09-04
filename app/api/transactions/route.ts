import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 10, 1), 100) : 10

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        riskAssessment: true,
      },
    })

    return NextResponse.json({
      success: true,
      count: transactions.length,
      transactions,
    })
  } catch (error) {
    console.error('[/api/transactions] GET Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
