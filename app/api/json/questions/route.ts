import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Retorna questões no formato JSON original
export async function GET() {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Buscar todas as questões com seus cursos
        const questions = await prisma.question.findMany({
            include: {
                course: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        })

        // Agrupar questões por curso no formato original
        const groupedQuestions: {
            [courseName: string]: Array<{
                id: number
                text: string
                options: string[]
                correct: number
            }>
        } = {}

        let questionId = 1
        questions.forEach((question: { course: { name: string }; question: string; alternatives: string[]; correctAnswer: number }) => {
            const courseName = question.course.name

            if (!groupedQuestions[courseName]) {
                groupedQuestions[courseName] = []
            }

            groupedQuestions[courseName].push({
                id: questionId++,
                text: question.question,
                options: question.alternatives,
                correct: question.correctAnswer,
            })
        })

        return NextResponse.json(groupedQuestions)
    } catch (error) {
        console.error('Error fetching questions JSON:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
