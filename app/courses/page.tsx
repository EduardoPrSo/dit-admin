'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'

interface Course {
    id: string
    name: string
    _count: {
        questions: number
        instructors: number
    }
    createdAt: string
}

export default function CoursesPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState<Course | null>(null)

    const [formData, setFormData] = useState({
        name: '',
    })

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/')
        } else if (session) {
            fetchCourses()
        }
    }, [session, status, router])

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/courses')
            if (res.ok) {
                const data = await res.json()
                setCourses(data)
            }
        } catch (error) {
            console.error('Error fetching courses:', error)
        } finally {
            setLoading(false)
        }
    }

    const openModal = (course?: Course) => {
        if (course) {
            setEditingCourse(course)
            setFormData({
                name: course.name,
            })
        } else {
            setEditingCourse(null)
            setFormData({
                name: '',
            })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingCourse(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            alert('Por favor, preencha o nome do curso')
            return
        }

        try {
            const url = editingCourse ? `/api/courses/${editingCourse.id}` : '/api/courses'
            const method = editingCourse ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                fetchCourses()
                closeModal()
            } else {
                const error = await res.json()
                alert(error.error || 'Erro ao salvar curso')
            }
        } catch (error) {
            console.error('Error saving course:', error)
            alert('Erro ao salvar curso')
        }
    }

    const handleDelete = async (id: string, courseName: string, count: { questions: number; instructors: number }) => {
        const totalItems = count.questions + count.instructors
        const confirmMessage = totalItems > 0
            ? `Tem certeza que deseja excluir o curso "${courseName}"?\n\nIsso irá remover permanentemente:\n- ${count.questions} questões\n- ${count.instructors} instrutores\n\nEsta ação não pode ser desfeita!`
            : `Tem certeza que deseja excluir o curso "${courseName}"?`

        if (!confirm(confirmMessage)) return

        try {
            const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchCourses()
            } else {
                const error = await res.json()
                alert(error.error || 'Erro ao excluir curso')
            }
        } catch (error) {
            console.error('Error deleting course:', error)
            alert('Erro ao excluir curso')
        }
    }

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
                    <h1 className="text-3xl font-bold text-(--text-primary) mb-2">Cursos</h1>
                    <p className="text-(--text-secondary)">Gerencie os cursos disponíveis</p>
                </div>
                <button onClick={() => openModal()} className="btn btn-primary">
                    + Novo Curso
                </button>
            </div>

            {/* Courses Grid */}
            {courses.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-(--border-color) rounded-lg">
                    <p className="text-(--text-muted)">Nenhum curso encontrado</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div key={course.id} className="card hover:border-(--text-muted) transition-colors group relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-(--text-primary) mb-2">{course.name}</h3>
                                    <div className="flex flex-col gap-2 text-sm text-(--text-secondary)">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{course._count.questions} questões</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            <span>{course._count.instructors} instrutores</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openModal(course)} className="p-2 text-(--text-secondary) hover:text-(--primary) transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button onClick={() => handleDelete(course.id, course.name, course._count)} className="p-2 text-(--text-secondary) hover:text-(--danger) transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="text-xs text-(--text-muted) pt-4 border-t border-(--border-color)">
                                Criado em {new Date(course.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingCourse ? 'Editar Curso' : 'Novo Curso'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-(--text-secondary) mb-1">Nome do Curso</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input"
                            placeholder="Ex: Abordagem"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-(--border-color) mt-6">
                        <button type="button" onClick={closeModal} className="btn btn-ghost flex-1">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary flex-1">
                            {editingCourse ? 'Salvar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
