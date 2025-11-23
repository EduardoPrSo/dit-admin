import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT - Update course
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
        const { name } = await request.json()

        if (!name) {
            return NextResponse.json({ error: 'Course name is required' }, { status: 400 })
        }

        // Check if another course with this name exists
        const existingCourse = await prisma.course.findFirst({
            where: {
                name,
                NOT: { id }
            }
        })

        if (existingCourse) {
            return NextResponse.json({ error: 'Course name already exists' }, { status: 400 })
        }

        const updatedCourse = await prisma.course.update({
            where: { id },
            data: { name },
            include: {
                _count: {
                    select: {
                        questions: true,
                        instructors: true,
                    },
                },
            },
        })

        return NextResponse.json(updatedCourse)
    } catch (error) {
        console.error('Error updating course:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Delete course (cascade deletes questions and instructors)
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

        // Delete course (questions and instructors will be deleted automatically due to onDelete: Cascade)
        await prisma.course.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting course:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
