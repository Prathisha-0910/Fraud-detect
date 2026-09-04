import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const event = await prisma.fraudEvent.findUnique({
      where: { id },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Fraud event not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.fraudEvent.update({
      where: { id },
      data: { acknowledged: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Event acknowledged',
      event: updated,
    })
  } catch (error) {
    console.error('[/api/fraud-events/:id/acknowledge] Error:', error)
    return NextResponse.json(
      { error: 'Failed to acknowledge event', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
