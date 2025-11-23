import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { prisma } from '@/lib/prisma'

// GET - List all courses
export async function GET() {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const courses = await prisma.course.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: {
                        questions: true,
                        instructors: true,
                    },
                },
            },
        })

        return NextResponse.json(courses)
    } catch (error) {
        console.error('Error fetching courses:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create new course
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { name } = await request.json()

        if (!name) {
            return NextResponse.json({ error: 'Course name is required' }, { status: 400 })
        }

        // Check if course already exists
        const existingCourse = await prisma.course.findUnique({
            where: { name },
        })

        if (existingCourse) {
            return NextResponse.json({ error: 'Course already exists' }, { status: 400 })
        }

        const course = await prisma.course.create({
            data: { name },
        })

        return NextResponse.json(course, { status: 201 })
    } catch (error) {
        console.error('Error creating course:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
