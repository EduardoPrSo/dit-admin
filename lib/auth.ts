import NextAuth from 'next-auth'
import Discord from 'next-auth/providers/discord'
import { prisma } from './prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Discord({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ account }) {
            if (!account) return false

            // Check if user exists in our database
            const existingUser = await prisma.user.findUnique({
                where: { discordId: account.providerAccountId },
            })

            // Only allow sign in if user exists in database
            return !!existingUser
        },
        async jwt({ token, account }) {
            if (account) {
                token.discordId = account.providerAccountId
            }
            return token
        },
        async session({ session, token }) {
            if (token.discordId) {
                // Get user from database to include role
                const dbUser = await prisma.user.findUnique({
                    where: { discordId: token.discordId as string },
                })

                if (dbUser) {
                    session.user.id = dbUser.id
                    session.user.role = dbUser.role
                }
            }
            return session
        },
    },
    pages: {
        signIn: '/',
    },
})
