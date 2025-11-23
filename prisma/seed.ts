import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // Ler arquivos JSON da pasta db
    const instructorsData = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../db/instructors.json'), 'utf-8')
    )
    const questionsData = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../db/questions.json'), 'utf-8')
    )
    const manualsData = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../db/manuals.json'), 'utf-8')
    )

    // Create first admin user
    const adminUser = await prisma.user.upsert({
        where: { discordId: '180722594587082753' },
        update: {},
        create: {
            discordId: '180722594587082753',
            role: 'ADMIN',
        },
    })
    console.log('✅ Created admin user:', adminUser.id)

    // Criar cursos baseados nas keys dos arquivos
    const courseNames = Array.from(
        new Set([
            ...Object.keys(instructorsData),
            ...Object.keys(questionsData),
        ])
    )

    const courses: { [key: string]: { id: string; name: string } } = {}
    
    for (const courseName of courseNames) {
        const course = await prisma.course.upsert({
            where: { name: courseName },
            update: {},
            create: { name: courseName },
        })
        courses[courseName] = course
        console.log(`✅ Created course: ${courseName}`)
    }

    // Criar instrutores
    let instructorCount = 0
    for (const [courseName, serverIds] of Object.entries(instructorsData)) {
        const course = courses[courseName]
        if (!course) continue

        for (const serverId of serverIds as number[]) {
            await prisma.instructor.create({
                data: {
                    courseId: course.id,
                    serverId: serverId,
                    name: `Instrutor ID ${serverId}`, // Nome padrão, pode ser editado depois
                },
            })
            instructorCount++
        }
    }
    console.log(`✅ Created ${instructorCount} instructors`)

    // Criar questões
    let questionCount = 0
    for (const [courseName, questions] of Object.entries(questionsData)) {
        const course = courses[courseName]
        if (!course) continue

        for (const q of questions as any[]) {
            await prisma.question.create({
                data: {
                    courseId: course.id,
                    question: q.text,
                    alternatives: q.options,
                    correctAnswer: q.correct,
                },
            })
            questionCount++
        }
    }
    console.log(`✅ Created ${questionCount} questions`)

    // Criar manuais
    for (const manual of manualsData) {
        await prisma.manual.create({
            data: {
                title: manual.title,
                url: manual.content,
                description: manual.description || 'Manual de treinamento',
            },
        })
    }
    console.log(`✅ Created ${manualsData.length} manuals`)

    console.log('🎉 Database seeded successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
