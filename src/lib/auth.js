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
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        console.log("Authorize called with:", { 
          email: credentials?.email, 
          hasPassword: !!credentials?.password, 
          hasOtp: !!credentials?.otp,
          otpValue: credentials?.otp // Temporary log to check value
        });

        if (!credentials?.email || !credentials?.password || !credentials?.otp) {
           console.log("Missing credentials check failed");
           throw new Error("Missing credentials");
        }
        
        const email = credentials.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email } });
        
        // 1. Verify Password
        if (!user || !user.password || user.password !== credentials.password) {
           throw new Error("Invalid password");
        }

        // 2. Verify OTP
        const otpRecord = await prisma.verificationCode.findUnique({
          where: { email }
        });

        if (!otpRecord || otpRecord.code !== credentials.otp) {
          throw new Error("Invalid OTP");
        }

        if (new Date() > otpRecord.expires) {
          throw new Error("OTP has expired");
        }

        // 3. Clear OTP after successful login (optional, but good practice)
        await prisma.verificationCode.delete({ where: { email } });

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
