import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { auth } from '@/lib/auth'
import SessionProvider from '@/components/SessionProvider'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DIT Admin Panel',
  description: 'Admin panel for managing courses, questions, instructors, and manuals',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {session && <Navbar />}
          <main className="container mx-auto px-6">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}
