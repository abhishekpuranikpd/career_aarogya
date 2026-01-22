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

  // 1. User & Application Stats
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
        jobPost: true
    }
  });

  const totalUsers = users.length;
  const recentUsers = users.slice(0, 5); // Latest 5
  
  // Group by Position
  const usersByPosition = users.reduce((acc, user) => {
      const pos = user.positionApplied || (user.jobPost?.title) || "Unspecified";
      acc[pos] = (acc[pos] || 0) + 1;
      return acc;
  }, {});

  // Group by Status (Application Funnel)
  const applicationFunnel = {
      Total: totalUsers,
      Pending: users.filter(u => u.examStatus === 'PENDING').length,
      ExamCompleted: users.filter(u => ['COMPLETED', 'PASSED', 'FAILED', 'INTERVIEW', 'HIRED', 'REJECTED'].includes(u.examStatus)).length,
      passed: users.filter(u => ['PASSED', 'INTERVIEW', 'HIRED', 'REJECTED'].includes(u.examStatus)).length,
      interview: users.filter(u => ['INTERVIEW', 'HIRED', 'REJECTED'].includes(u.examStatus)).length,
      hired: users.filter(u => u.examStatus === 'HIRED').length,
      rejected: users.filter(u => u.examStatus === 'REJECTED').length
  };

  // 2. Job Stats
  const jobs = await prisma.jobPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
        exam: true,
        _count: {
            select: { applicants: true }
        }
    }
  });

  const activeJobs = jobs.filter(j => j.isActive).length;
  const topJobs = [...jobs].sort((a, b) => b._count.applicants - a._count.applicants).slice(0, 5);

  // 3. Exam & Response Stats
  const exams = await prisma.exam.findMany({
    orderBy: { id: 'desc' },
    include: { questions: true, responses: true }
  });

  const responses = await prisma.response.findMany({
      take: 10,
      orderBy: { submittedAt: 'desc' },
      include: {
          user: true,
          exam: true
      }
  });

  // 4. System Stats
  const activeOtps = await prisma.verificationCode.count({
      where: { expires: { gt: new Date() } }
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

  // Consolidate Data
  const dashboardData = {
      users: {
          all: users,
          recent: recentUsers,
          byPosition: usersByPosition,
          funnel: applicationFunnel
      },
      jobs: {
          all: jobs,
          activeCount: activeJobs,
          top: topJobs
      },
      exams: {
          all: exams,
          recentResponses: responses
      },
      system: {
          activeOtps
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Superadmin Overview</h1>
          <div className="flex gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                System Active
             </div>
             <div className="bg-white px-4 py-2 rounded shadow text-sm border border-gray-100">
              Logged in as {session.user.email}
            </div>
          </div>
        </div>

        <DashboardClient 
          initialData={dashboardData}
          baseUrl={baseUrl} 
        />
      </div>
    </div>
  );
}
