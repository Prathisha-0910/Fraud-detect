import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'
    const ackParam = searchParams.get('acknowledged')
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) || 50 : 50

    const whereClause: { userId: string; acknowledged?: boolean } = { userId }
    if (ackParam === 'false') {
      whereClause.acknowledged = false
    } else if (ackParam === 'true') {
      whereClause.acknowledged = true
    }

    const events = await prisma.fraudEvent.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        transaction: true,
      },
    })

    return NextResponse.json({
      success: true,
      count: events.length,
      events,
    })
  } catch (error) {
    console.error('[/api/fraud-events] GET Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fraud events', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
