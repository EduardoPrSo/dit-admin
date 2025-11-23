import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT - Update manual
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const { title, url, description } = await request.json()

        const updatedManual = await prisma.manual.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(url && { url }),
                ...(description && { description }),
            },
        })

        return NextResponse.json(updatedManual)
    } catch (error) {
        console.error('Error updating manual:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Delete manual
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        await prisma.manual.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting manual:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
