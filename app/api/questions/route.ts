import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { prisma } from '@/lib/prisma'

// GET - List all questions
export async function GET() {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const questions = await prisma.question.findMany({
            include: {
                course: true,
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(questions)
    } catch (error) {
        console.error('Error fetching questions:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create new question
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { courseId, question, alternatives, correctAnswer } = await request.json()

        // Validation
        if (!courseId || !question || !alternatives || correctAnswer === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (!Array.isArray(alternatives) || alternatives.length < 2) {
            return NextResponse.json({ error: 'Deve fornecer pelo menos 2 alternativas' }, { status: 400 })
        }

        if (alternatives.some((alt: string) => !alt || !alt.trim())) {
            return NextResponse.json({ error: 'Todas as alternativas devem ser preenchidas' }, { status: 400 })
        }

        if (correctAnswer < 0 || correctAnswer >= alternatives.length) {
            return NextResponse.json({ error: 'Resposta correta inválida' }, { status: 400 })
        }

        const newQuestion = await prisma.question.create({
            data: {
                courseId,
                question,
                alternatives,
                correctAnswer,
            },
            include: {
                course: true,
            },
        })

        return NextResponse.json(newQuestion, { status: 201 })
    } catch (error) {
        console.error('Error creating question:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
