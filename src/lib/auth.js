import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      id: "admin-login",
      name: "Superadmin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const admin = await prisma.superadmin.findUnique({ where: { email: credentials.email } });
        
        if (admin && admin.password === credentials.password) {
          return { id: admin.id, email: admin.email, name: "Superadmin", role: "admin" };
        }
        return null;
      }
    }),
    CredentialsProvider({
      id: "user-login",
      name: "Applicant",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        
        // Ensure we check for password existence (since older users might not have one)
        // In real app, use bcrypt.compare(credentials.password, user.password)
        // Here assuming plain text for consistency with admin or simple hash logic if implemented
        if (user && user.password && user.password === credentials.password) {
           return { id: user.id, email: user.email, name: user.name, role: "user" };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    }
  },
  pages: {
    signIn: '/admin/login',
  }
}
