'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'

interface Manual {
    id: string
    title: string
    url: string
    description: string
    createdAt: string
}

export default function ManualsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [manuals, setManuals] = useState<Manual[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingManual, setEditingManual] = useState<Manual | null>(null)

    const [formData, setFormData] = useState({
        title: '',
        url: '',
        description: '',
    })

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/')
        } else if (session) {
            fetchManuals()
        }
    }, [session, status, router])

    const fetchManuals = async () => {
        try {
            const res = await fetch('/api/manuals')
            if (res.ok) {
                const data = await res.json()
                setManuals(data)
            }
        } catch (error) {
            console.error('Error fetching manuals:', error)
        } finally {
            setLoading(false)
        }
    }

    const openModal = (manual?: Manual) => {
        if (manual) {
            setEditingManual(manual)
            setFormData({
                title: manual.title,
                url: manual.url,
                description: manual.description,
            })
        } else {
            setEditingManual(null)
            setFormData({
                title: '',
                url: '',
                description: '',
            })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingManual(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title.trim() || !formData.url.trim()) {
            alert('Por favor, preencha o título e a URL')
            return
        }

        try {
            const url = editingManual ? `/api/manuals/${editingManual.id}` : '/api/manuals'
            const method = editingManual ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                fetchManuals()
                closeModal()
            } else {
                const error = await res.json()
                alert(error.error || 'Erro ao salvar manual')
            }
        } catch (error) {
            console.error('Error saving manual:', error)
            alert('Erro ao salvar manual')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este manual?')) return

        try {
            const res = await fetch(`/api/manuals/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchManuals()
            }
        } catch (error) {
            console.error('Error deleting manual:', error)
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
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Manuais</h1>
                    <p className="text-[var(--text-secondary)]">Gerencie documentação e recursos</p>
                </div>
                <button onClick={() => openModal()} className="btn btn-primary">
                    + Novo Manual
                </button>
            </div>

            {/* Manuals Grid */}
            {manuals.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[var(--border-color)] rounded-lg">
                    <p className="text-[var(--text-muted)]">Nenhum manual encontrado</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {manuals.map((manual) => (
                        <div key={manual.id} className="card hover:border-[var(--text-muted)] transition-colors flex flex-col relative group">
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)] pr-16">{manual.title}</h3>
                                <p className="text-[var(--text-secondary)] mb-4 line-clamp-3 text-sm">{manual.description === "" ? "Sem descrição" : manual.description}</p>
                                <a
                                    href={manual.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[var(--primary)] hover:text-[var(--primary-hover)] text-sm break-all inline-flex items-center gap-1 font-medium"
                                >
                                    Acessar Manual
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                            <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex justify-between items-center">
                                <span className="text-xs text-[var(--text-muted)]">
                                    {new Date(manual.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-card)] shadow-sm p-1 rounded-md border border-[var(--border-color)]">
                                <button onClick={() => openModal(manual)} className="p-1 text-[var(--text-secondary)] hover:text-[var(--primary)]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button onClick={() => handleDelete(manual.id)} className="p-1 text-[var(--text-secondary)] hover:text-[var(--danger)]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingManual ? 'Editar Manual' : 'Novo Manual'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Título</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="input"
                            placeholder="Ex: Manual de Procedimentos"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">URL</label>
                        <input
                            type="url"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            className="input"
                            placeholder="https://exemplo.com/manual"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Descrição</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input min-h-[100px] resize-y"
                            placeholder="Descreva o conteúdo do manual... (opcional)"
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-[var(--border-color)] mt-6">
                        <button type="button" onClick={closeModal} className="btn btn-ghost flex-1">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary flex-1">
                            {editingManual ? 'Salvar Alterações' : 'Criar Manual'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
