'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export default function Navbar() {
    const pathname = usePathname()
    const { data: session } = useSession()

    if (!session) return null

    const isActive = (path: string) => pathname === path

    const navItems = [
        ...(session.user.role === 'ADMIN' ? [{ name: 'Admin', path: '/admin' }] : []),
        { name: 'Cursos', path: '/courses' },
        { name: 'Questões', path: '/questions' },
        { name: 'Instrutores', path: '/instructors' },
        { name: 'Manuais', path: '/manuals' },
    ]

    return (
        <nav className="glass sticky top-0 z-40 mb-8 border-b border-(--border-color) bg-white">
            <div className="container mx-auto py-4 max-w-[1200px]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <img src="/DIT.png" alt="DIT Logo" className="w-12 h-12" />
                        <div className="flex gap-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all ${isActive(item.path)
                                        ? 'text-black'
                                        : 'text-gray-300 hover:bg-(--hover-bg) hover:text-black'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-sm flex items-center gap-2">
                            <img src={session.user.image || ""} alt="profile pic" className='w-8 h-8 rounded-full' />
                            <div className="font-semibold text-md bg-gray-700 text-white px-1 py-0.5 rounded">{session.user.name || session.user.id}</div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${session.user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                            {session.user.role}
                        </span>
                        <button onClick={() => signOut()} className="font-semibold text-gray-700 p-1 rounded group hover:bg-red-300 cursor-pointer">
                            <LogOut size={17} className='group-hover:text-red-500' />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
