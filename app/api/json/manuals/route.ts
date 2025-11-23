import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { corsHeaders, corsResponse } from '@/lib/cors'

// OPTIONS - Handle preflight requests
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders(),
    })
}

// GET - Retorna manuais no formato JSON original
export async function GET() {
    try {
        // Buscar todos os manuais
        const manuals = await prisma.manual.findMany({
            orderBy: {
                createdAt: 'asc',
            },
        })

        // Converter para o formato JSON original
        const manualsJSON = manuals.map((manual: { title: string; url: string; description: string }) => ({
            title: manual.title,
            content: manual.url,
            description: manual.description,
        }))

        return corsResponse(manualsJSON)
    } catch (error) {
        console.error('Error fetching manuals JSON:', error)
        return corsResponse({ error: 'Internal server error' }, 500)
    }
}
