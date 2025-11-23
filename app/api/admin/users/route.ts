import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List all users (admin only)
export async function GET() {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Add new user (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { discordId, role } = await request.json()

        if (!discordId) {
            return NextResponse.json({ error: 'Discord ID is required' }, { status: 400 })
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { discordId },
        })

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 })
        }

        const user = await prisma.user.create({
            data: {
                discordId,
                role: role || 'USER',
            },
        })

        return NextResponse.json(user, { status: 201 })
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Remove user (admin only)
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        // Prevent deleting yourself
        if (id === session.user.id) {
            return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
        }

        await prisma.user.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting user:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
