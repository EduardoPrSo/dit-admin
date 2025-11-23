import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Retorna manuais no formato JSON original
export async function GET() {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Buscar todos os manuais
        const manuals = await prisma.manual.findMany({
            orderBy: {
                createdAt: 'asc',
            },
        })

        // Converter para o formato JSON original
        const manualsJSON = manuals.map((manual) => ({
            title: manual.title,
            content: manual.url,
            description: manual.description,
        }))

        return NextResponse.json(manualsJSON)
    } catch (error) {
        console.error('Error fetching manuals JSON:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
