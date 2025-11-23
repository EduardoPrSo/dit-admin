import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { prisma } from '@/lib/prisma'

// GET - List all instructors
export async function GET() {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const instructors = await prisma.instructor.findMany({
            include: {
                course: true,
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(instructors)
    } catch (error) {
        console.error('Error fetching instructors:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create new instructor
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { courseId, serverId, name } = await request.json()

        if (!courseId || !serverId || !name) {
            return NextResponse.json({ error: 'Course ID, server ID and name are required' }, { status: 400 })
        }

        const instructor = await prisma.instructor.create({
            data: {
                courseId,
                serverId: parseInt(serverId),
                name,
            },
            include: {
                course: true,
            },
        })

        return NextResponse.json(instructor, { status: 201 })
    } catch (error) {
        console.error('Error creating instructor:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
