import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import DashboardClient from "./client"

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
        jobPost: true // Include relation for filtering
    }
  });

  const exams = await prisma.exam.findMany({
    orderBy: { id: 'desc' },
    include: { questions: true }
  });

  const jobs = await prisma.jobPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
        exam: true,
        _count: {
            select: { applicants: true }
        }
    }
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Superadmin Dashboard</h1>
          <div className="flex gap-4">
            <Link href="/admin/jobs/create" className="bg-green-600 text-white px-4 py-2 rounded shadow text-sm font-medium hover:bg-green-700 transition">
              + Post Job
            </Link>
            <Link href="/admin/exams/create" className="bg-primary text-white px-4 py-2 rounded shadow text-sm font-medium hover:bg-blue-700 transition">
              + Create Exam
            </Link>
            <div className="bg-white px-4 py-2 rounded shadow text-sm border border-gray-100">
              Logged in as {session.user.email}
            </div>
          </div>
        </div>

        <DashboardClient 
          initialUsers={users} 
          initialExams={exams} 
          initialJobs={jobs}
          baseUrl={baseUrl} 
        />
      </div>
    </div>
  );
}
