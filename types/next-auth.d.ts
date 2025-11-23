import 'next-auth'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            role: 'ADMIN' | 'USER'
            name?: string | null
            email?: string | null
            image?: string | null
        }
    }

    interface JWT {
        discordId?: string
    }
}
