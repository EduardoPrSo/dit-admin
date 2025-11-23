import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT - Update instructor
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
        const { courseId, serverId, name } = await request.json()

        const updatedInstructor = await prisma.instructor.update({
            where: { id },
            data: {
                ...(courseId && { courseId }),
                ...(serverId && { serverId: parseInt(serverId) }),
                ...(name && { name }),
            },
            include: {
                course: true,
            },
        })

        return NextResponse.json(updatedInstructor)
    } catch (error) {
        console.error('Error updating instructor:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Delete instructor
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

        await prisma.instructor.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting instructor:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
