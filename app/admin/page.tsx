'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface User {
    id: string
    discordId: string
    role: 'ADMIN' | 'USER'
    createdAt: string
}

export default function AdminPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [newDiscordId, setNewDiscordId] = useState('')
    const [newRole, setNewRole] = useState<'ADMIN' | 'USER'>('USER')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/')
        } else if (session?.user.role !== 'ADMIN') {
            router.push('/courses')
        } else {
            fetchUsers()
        }
    }, [session, status, router])

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users')
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newDiscordId.trim()) return

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discordId: newDiscordId, role: newRole }),
            })

            if (res.ok) {
                setNewDiscordId('')
                setNewRole('USER')
                fetchUsers()
            } else {
                const error = await res.json()
                alert(error.error || 'Falha ao adicionar usuário')
            }
        } catch (error) {
            console.error('Error adding user:', error)
            alert('Falha ao adicionar usuário')
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Tem certeza que deseja remover este usuário?')) return

        try {
            const res = await fetch(`/api/admin/users?id=${userId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                fetchUsers()
            } else {
                const error = await res.json()
                alert(error.error || 'Falha ao deletar usuário')
            }
        } catch (error) {
            console.error('Error deleting user:', error)
            alert('Falha ao deletar usuário')
        }
    }

    if (status === 'loading' || loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="spinner"></div>
            </div>
        )
    }

    if (session?.user.role !== 'ADMIN') {
        return null
    }

    return (
        <div className="container-custom animate-fadeIn">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Administração</h1>
                <p className="text-[var(--text-secondary)]">Gerencie usuários e permissões de acesso</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add User Form */}
                <div className="lg:col-span-1">
                    <div className="card sticky top-24">
                        <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Adicionar Usuário</h2>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Discord ID</label>
                                <input
                                    type="text"
                                    value={newDiscordId}
                                    onChange={(e) => setNewDiscordId(e.target.value)}
                                    className="input"
                                    placeholder="Ex: 180722594587082753"
                                    required
                                />
                                <p className="text-xs text-[var(--text-muted)] mt-1">
                                    O ID do Discord pode ser encontrado ativando o Modo Desenvolvedor no Discord.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Função</label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value as 'ADMIN' | 'USER')}
                                    className="select"
                                >
                                    <option value="USER">Usuário</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>

                            <button type="submit" className="btn btn-primary w-full">
                                Adicionar Usuário
                            </button>
                        </form>
                    </div>
                </div>

                {/* Users List */}
                <div className="lg:col-span-2">
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Usuários Autorizados</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[var(--border-color)]">
                                        <th className="py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Discord ID</th>
                                        <th className="py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Função</th>
                                        <th className="py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Adicionado em</th>
                                        <th className="py-3 px-4 text-sm font-medium text-[var(--text-secondary)] text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-[var(--bg-body)] transition-colors">
                                            <td className="py-3 px-4 text-sm font-mono text-[var(--text-primary)]">
                                                {user.discordId}
                                                {user.discordId === session?.user.id && (
                                                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Você</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-[var(--danger)] hover:text-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={user.discordId === session?.user.id}
                                                >
                                                    Remover
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-[var(--text-muted)]">
                                                Nenhum usuário encontrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
