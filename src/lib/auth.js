import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

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
        password: { label: "Password", type: "password" },
        pin: { label: "4-Digit PIN", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.pin) {
          throw new Error("Missing credentials");
        }
        
        const email = credentials.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email } });
        
        // 1. Verify Password
        if (!user || !user.password || user.password !== credentials.password) {
          throw new Error("Invalid email or password");
        }

        // 2. Check if PIN is set
        if (!user.pin) {
          // Return special error so frontend can redirect to set-pin page
          throw new Error("PIN_NOT_SET");
        }

        // 3. Verify PIN
        const isPinValid = await bcrypt.compare(credentials.pin, user.pin);
        if (!isPinValid) {
          throw new Error("Invalid PIN");
        }

        return { id: user.id, email: user.email, name: user.name, role: "user" };
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
