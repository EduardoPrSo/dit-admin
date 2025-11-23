import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT - Update question
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
        const { courseId, question, alternatives, correctAnswer } = await request.json()

        // Validation
        if (alternatives && (!Array.isArray(alternatives) || alternatives.length < 2)) {
            return NextResponse.json({ error: 'Deve fornecer pelo menos 2 alternativas' }, { status: 400 })
        }

        if (alternatives && alternatives.some((alt: string) => !alt || !alt.trim())) {
            return NextResponse.json({ error: 'Todas as alternativas devem ser preenchidas' }, { status: 400 })
        }

        if (correctAnswer !== undefined && alternatives && (correctAnswer < 0 || correctAnswer >= alternatives.length)) {
            return NextResponse.json({ error: 'Resposta correta inválida' }, { status: 400 })
        }

        const updatedQuestion = await prisma.question.update({
            where: { id },
            data: {
                ...(courseId && { courseId }),
                ...(question && { question }),
                ...(alternatives && { alternatives }),
                ...(correctAnswer !== undefined && { correctAnswer }),
            },
            include: {
                course: true,
            },
        })

        return NextResponse.json(updatedQuestion)
    } catch (error) {
        console.error('Error updating question:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Delete question
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

        await prisma.question.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting question:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
