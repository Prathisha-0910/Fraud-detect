import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const CreateGuardianSchema = z.object({
  userId: z.string().default('demo-user'),
  name: z.string().min(1),
  relationship: z.string().default('child'),
  contact: z.string().min(3),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'

    const guardians = await prisma.guardian.findMany({
      where: { userId, active: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      count: guardians.length,
      guardians,
    })
  } catch (error) {
    console.error('[/api/guardians] GET Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guardians', message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CreateGuardianSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { userId, name, relationship, contact } = parsed.data

    // Ensure user exists
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        name: userId === 'demo-user' ? 'Priya Sharma' : userId,
        email: `${userId}@sentra.demo`,
      },
    })

    const guardian = await prisma.guardian.create({
      data: {
        userId,
        name,
        relationship,
        contact,
        active: true,
      },
    })

    return NextResponse.json({
      success: true,
      guardian,
    })
  } catch (error) {
    console.error('[/api/guardians] POST Error:', error)
    return NextResponse.json(
      { error: 'Failed to create guardian', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
