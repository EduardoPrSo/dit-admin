import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Retorna instrutores no formato JSON original
export async function GET() {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Buscar todos os instrutores com seus cursos
        const instructors = await prisma.instructor.findMany({
            include: {
                course: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        })

        // Agrupar instrutores por curso no formato original (array de Discord IDs)
        const groupedInstructors: {
            [courseName: string]: string[]
        } = {}

        instructors.forEach((instructor) => {
            const courseName = instructor.course.name

            if (!groupedInstructors[courseName]) {
                groupedInstructors[courseName] = []
            }

            // Retornar apenas o serverId (ID do servidor de RP)
            groupedInstructors[courseName].push(instructor.serverId.toString())
        })

        return NextResponse.json(groupedInstructors)
    } catch (error) {
        console.error('Error fetching instructors JSON:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
