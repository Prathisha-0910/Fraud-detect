import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.guardian.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Guardian not found' },
        { status: 404 }
      )
    }

    await prisma.guardian.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Guardian deleted successfully',
      id,
    })
  } catch (error) {
    console.error('[/api/guardians/:id] DELETE Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete guardian', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
