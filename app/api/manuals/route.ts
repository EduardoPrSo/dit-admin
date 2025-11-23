import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { prisma } from '@/lib/prisma'

// GET - List all manuals
export async function GET() {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const manuals = await prisma.manual.findMany({
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(manuals)
    } catch (error) {
        console.error('Error fetching manuals:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create new manual
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { title, url, description } = await request.json()

        if (!title || !url) {
            return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 })
        }

        const manual = await prisma.manual.create({
            data: {
                title,
                url,
                description: description || '',
            },
        })

        return NextResponse.json(manual, { status: 201 })
    } catch (error) {
        console.error('Error creating manual:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
