'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'

interface Course {
    id: string
    name: string
}

interface Instructor {
    id: string
    courseId: string
    serverId: number
    name: string
    course: Course
    createdAt: string
}

export default function InstructorsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [instructors, setInstructors] = useState<Instructor[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null)
    const [filterCourse, setFilterCourse] = useState<string>('')

    const [formData, setFormData] = useState({
        courseId: '',
        serverId: '',
        name: '',
    })

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/')
        } else if (session) {
            fetchInstructors()
            fetchCourses()
        }
    }, [session, status, router])

    const fetchInstructors = async () => {
        try {
            const res = await fetch('/api/instructors')
            if (res.ok) {
                const data = await res.json()
                setInstructors(data)
            }
        } catch (error) {
            console.error('Error fetching instructors:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/courses')
            if (res.ok) {
                const data = await res.json()
                setCourses(data)
            }
        } catch (error) {
            console.error('Error fetching courses:', error)
        }
    }

    const openModal = (instructor?: Instructor) => {
        if (instructor) {
            setEditingInstructor(instructor)
            setFormData({
                courseId: instructor.courseId,
                serverId: instructor.serverId.toString(),
                name: instructor.name,
            })
        } else {
            setEditingInstructor(null)
            setFormData({
                courseId: courses[0]?.id || '',
                serverId: '',
                name: '',
            })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingInstructor(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim() || !formData.serverId.trim()) {
            alert('Por favor, preencha todos os campos')
            return
        }

        try {
            const url = editingInstructor ? `/api/instructors/${editingInstructor.id}` : '/api/instructors'
            const method = editingInstructor ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                fetchInstructors()
                closeModal()
            } else {
                const error = await res.json()
                alert(error.error || 'Erro ao salvar instrutor')
            }
        } catch (error) {
            console.error('Error saving instructor:', error)
            alert('Erro ao salvar instrutor')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este instrutor?')) return

        try {
            const res = await fetch(`/api/instructors/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchInstructors()
            }
        } catch (error) {
            console.error('Error deleting instructor:', error)
        }
    }

    const filteredInstructors = filterCourse
        ? instructors.filter(i => i.courseId === filterCourse)
        : instructors

    // Group instructors by course
    const groupedInstructors = filteredInstructors.reduce((acc, instructor) => {
        const courseName = instructor.course.name
        if (!acc[courseName]) {
            acc[courseName] = []
        }
        acc[courseName].push(instructor)
        return acc
    }, {} as Record<string, Instructor[]>)

    if (status === 'loading' || loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="container-custom animate-fadeIn">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Instrutores</h1>
                    <p className="text-[var(--text-secondary)]">Gerencie o corpo docente</p>
                </div>
                <button onClick={() => openModal()} className="btn btn-primary">
                    + Novo Instrutor
                </button>
            </div>

            {/* Filter */}
            <div className="card mb-8">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Filtrar por Curso:</label>
                    <select
                        value={filterCourse}
                        onChange={(e) => setFilterCourse(e.target.value)}
                        className="select sm:w-64"
                    >
                        <option value="">Todos os Cursos</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Instructors Grid */}
            {Object.keys(groupedInstructors).length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[var(--border-color)] rounded-lg">
                    <p className="text-[var(--text-muted)]">Nenhum instrutor encontrado</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedInstructors).map(([courseName, instructors]) => (
                        <div key={courseName}>
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 pl-2 border-l-4 border-[var(--primary)]">
                                {courseName}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {instructors.map((instructor) => (
                                    <div key={instructor.id} className="card hover:border-[var(--text-muted)] transition-colors group relative">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="border border-[var(--border-color)] px-1 rounded">ID: {instructor.serverId}</span>
                                                </div>
                                                <h3 className="text-lg font-semibold text-[var(--text-primary)]">{instructor.name}</h3>
                                                <p className="text-sm text-[var(--text-secondary)] mt-1">
                                                    Adicionado em {new Date(instructor.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 bg-[var(--bg-card)] shadow-sm p-1 rounded-md border border-[var(--border-color)]">
                                                <button onClick={() => openModal(instructor)} className="p-1 text-[var(--text-secondary)] hover:text-[var(--primary)]">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button onClick={() => handleDelete(instructor.id)} className="p-1 text-[var(--text-secondary)] hover:text-[var(--danger)]">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingInstructor ? 'Editar Instrutor' : 'Novo Instrutor'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">ID do Servidor</label>
                        <input
                            type="number"
                            value={formData.serverId}
                            onChange={(e) => setFormData({ ...formData, serverId: e.target.value })}
                            className="input"
                            placeholder="Ex: 1, 2, 3..."
                            required
                            min="1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Nome do Instrutor</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input"
                            placeholder="Ex: Sgt. Peçanha"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Curso</label>
                        <select
                            value={formData.courseId}
                            onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                            className="select"
                            required
                        >
                            <option value="">Selecione um curso</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-[var(--border-color)] mt-6">
                        <button type="button" onClick={closeModal} className="btn btn-ghost flex-1">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary flex-1">
                            {editingInstructor ? 'Salvar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
