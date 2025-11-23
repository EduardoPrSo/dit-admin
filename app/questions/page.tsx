'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'

interface Course {
    id: string
    name: string
}

interface Question {
    id: string
    courseId: string
    question: string
    alternatives: string[]
    correctAnswer: number
    course: Course
    createdAt: string
}

export default function QuestionsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [questions, setQuestions] = useState<Question[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
    const [filterCourse, setFilterCourse] = useState<string>('')
    const [searchTerm, setSearchTerm] = useState('')

    // Form state
    const [formData, setFormData] = useState({
        courseId: '',
        question: '',
        alternatives: ['', '', '', ''],
        correctAnswer: 0,
    })

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/')
        } else if (session) {
            fetchQuestions()
            fetchCourses()
        }
    }, [session, status, router])

    const fetchQuestions = async () => {
        try {
            const res = await fetch('/api/questions')
            if (res.ok) {
                const data = await res.json()
                setQuestions(data)
            }
        } catch (error) {
            console.error('Error fetching questions:', error)
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

    const openModal = (question?: Question) => {
        if (question) {
            setEditingQuestion(question)
            setFormData({
                courseId: question.courseId,
                question: question.question,
                alternatives: question.alternatives,
                correctAnswer: question.correctAnswer,
            })
        } else {
            setEditingQuestion(null)
            setFormData({
                courseId: courses[0]?.id || '',
                question: '',
                alternatives: ['', '', '', ''],
                correctAnswer: 0,
            })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingQuestion(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.question.trim() || formData.alternatives.some(alt => !alt.trim())) {
            alert('Por favor, preencha todos os campos')
            return
        }

        try {
            const url = editingQuestion ? `/api/questions/${editingQuestion.id}` : '/api/questions'
            const method = editingQuestion ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                fetchQuestions()
                closeModal()
            } else {
                const error = await res.json()
                alert(error.error || 'Erro ao salvar questão')
            }
        } catch (error) {
            console.error('Error saving question:', error)
            alert('Erro ao salvar questão')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta questão?')) return

        try {
            const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchQuestions()
            }
        } catch (error) {
            console.error('Error deleting question:', error)
        }
    }

    const filteredQuestions = questions.filter(q => {
        const matchesCourse = filterCourse ? q.courseId === filterCourse : true
        const matchesSearch = searchTerm
            ? q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.alternatives.some(alt => alt.toLowerCase().includes(searchTerm.toLowerCase()))
            : true
        return matchesCourse && matchesSearch
    })

    if (status === 'loading' || loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="container-custom animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Questões</h1>
                    <p className="text-sm text-[var(--text-secondary)]">Gerencie o banco de questões do sistema</p>
                </div>
                <button onClick={() => openModal()} className="btn btn-primary shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                    + Nova Questão
                </button>
            </div>

            <div className="card border-0 shadow-sm">
                {/* Filter & Search */}
                <div className="p-4 border-b border-[var(--border-color)] bg-gray-50 rounded-t-lg flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filtrar:</span>
                        <select
                            value={filterCourse}
                            onChange={(e) => setFilterCourse(e.target.value)}
                            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-black focus:border-black block p-1.5 w-full sm:w-48"
                        >
                            <option value="">Todos os Cursos</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-black focus:border-black block w-full pl-10 p-1.5"
                            placeholder="Buscar questões..."
                        />
                    </div>
                </div>

                {/* Questions List */}
                <div className="divide-y divide-gray-100">
                    {filteredQuestions.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <p className="text-gray-500 font-medium">Nenhuma questão encontrada</p>
                            <p className="text-gray-400 text-sm mt-1">Tente mudar o filtro ou adicione uma nova questão.</p>
                        </div>
                    ) : (
                        filteredQuestions.map((q) => (
                            <div key={q.id} className="p-6 hover:bg-gray-50 transition-colors group">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                                                {q.course.name}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                #{q.id.slice(-4)}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-900 mb-3 leading-snug">{q.question}</h3>
                                        <div className="space-y-1.5 pl-4 border-l-2 border-gray-100">
                                            {q.alternatives.map((alt, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`text-sm flex items-start gap-2 ${idx === q.correctAnswer
                                                        ? 'text-green-700 font-medium'
                                                        : 'text-gray-600'
                                                        }`}
                                                >
                                                    <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] border ${idx === q.correctAnswer ? 'bg-green-100 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </span>
                                                    <span className="flex-1">{alt}</span>
                                                    {idx === q.correctAnswer && (
                                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openModal(q)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                        <button onClick={() => handleDelete(q.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Excluir">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingQuestion ? 'Editar Questão' : 'Nova Questão'}
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Enunciado</label>
                        <textarea
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            className="textarea min-h-[100px] resize-y"
                            placeholder="Digite o enunciado da questão..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Alternativas</label>
                        <div className="space-y-3">
                            {formData.alternatives.map((alt, idx) => (
                                <div key={idx} className="flex gap-3 items-center group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            checked={formData.correctAnswer === idx}
                                            onChange={() => setFormData({ ...formData, correctAnswer: idx })}
                                            className="peer sr-only"
                                        />
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${formData.correctAnswer === idx ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 text-gray-400 group-hover:border-gray-400'}`} onClick={() => setFormData({ ...formData, correctAnswer: idx })}>
                                            {formData.correctAnswer === idx && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={alt}
                                            onChange={(e) => {
                                                const newAlts = [...formData.alternatives]
                                                newAlts[idx] = e.target.value
                                                setFormData({ ...formData, alternatives: newAlts })
                                            }}
                                            className={`input ${formData.correctAnswer === idx ? 'border-green-500 ring-1 ring-green-500' : ''}`}
                                            placeholder={`Alternativa ${String.fromCharCode(65 + idx)}`}
                                            required
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 ml-9">Clique no círculo para marcar a resposta correta.</p>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                        <button type="button" onClick={closeModal} className="btn btn-ghost flex-1 border border-gray-200">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary flex-1">
                            {editingQuestion ? 'Salvar Alterações' : 'Criar Questão'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
