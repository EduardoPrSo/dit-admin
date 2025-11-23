import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting migration...')

    // Clear existing data
    await prisma.question.deleteMany()
    await prisma.instructor.deleteMany()
    await prisma.manual.deleteMany()
    await prisma.course.deleteMany()
    // Don't delete users to keep admin

    // Ensure Admin User
    const adminUser = await prisma.user.upsert({
        where: { discordId: '180722594587082753' },
        update: {},
        create: {
            discordId: '180722594587082753',
            role: 'ADMIN',
        },
    })
    console.log('✅ Admin user ensured')

    // Read JSON files
    const questionsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'db/questions.json'), 'utf-8'))
    const instructorsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'db/instructors.json'), 'utf-8'))
    const manualsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'db/manuals.json'), 'utf-8'))

    // Get all unique courses
    const courses = new Set<string>()
    Object.keys(questionsData).forEach(c => courses.add(c))
    Object.keys(instructorsData).forEach(c => courses.add(c))
    Object.keys(manualsData).forEach(c => courses.add(c))

    // Create courses
    const courseMap = new Map<string, string>()
    for (const courseName of courses) {
        const course = await prisma.course.create({
            data: { name: courseName }
        })
        courseMap.set(courseName, course.id)
    }
    console.log(`✅ Created ${courseMap.size} courses`)

    // Import Questions
    let questionCount = 0
    for (const [courseName, questions] of Object.entries(questionsData)) {
        const courseId = courseMap.get(courseName)
        if (!courseId) continue

        for (const q of questions as any[]) {
            await prisma.question.create({
                data: {
                    courseId,
                    question: q.question,
                    alternatives: q.alternatives,
                    correctAnswer: q.correctAnswer,
                }
            })
            questionCount++
        }
    }
    console.log(`✅ Created ${questionCount} questions`)

    // Import Instructors
    let instructorCount = 0
    for (const [courseName, ids] of Object.entries(instructorsData)) {
        const courseId = courseMap.get(courseName)
        if (!courseId) continue

        for (const id of ids as number[]) {
            await prisma.instructor.create({
                data: {
                    courseId,
                    name: `Instrutor ${id}`, // Default name
                    serverId: id,   // Server ID field
                }
            })
            instructorCount++
        }
    }
    console.log(`✅ Created ${instructorCount} instructors`)

    // Import Manuals
    let manualCount = 0
    for (const [courseName, manuals] of Object.entries(manualsData)) {
        // Manuals in JSON are grouped by course but model doesn't have courseId?
        // Wait, looking at schema, Manual doesn't have courseId.
        // The JSON structure implies they belong to courses, but the schema is global?
        // Let's check schema again.
        // Schema: model Manual { id, title, url, description ... }
        // So they are global. I'll just import them all.

        for (const m of manuals as any[]) {
            await prisma.manual.create({
                data: {
                    title: m.title,
                    url: m.url,
                    description: m.description || '',
                }
            })
            manualCount++
        }
    }
    console.log(`✅ Created ${manualCount} manuals`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
