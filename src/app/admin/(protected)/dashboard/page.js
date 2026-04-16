import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import DashboardClient from "./client"

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  // 🚀 OPTIMIZED QUERIES (lightweight + fast)
  const [users, jobs, exams, responses, activeOtps] = await Promise.all([

    // ✅ USERS (limited + selected fields only)
    prisma.user.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        examStatus: true,
        positionApplied: true,
        createdAt: true,
        jobPost: {
          select: { title: true }
        }
      }
    }),

    // ✅ JOBS (no heavy relations)
    prisma.jobPost.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { applicants: true }
        },
        exam: {
          select: {
            id: true,
            title: true
          }
        }
      }
    }),

    // ✅ EXAMS (NO responses include ❌)
    prisma.exam.findMany({
      take: 10,
      orderBy: { id: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        windowStart: true,
        windowEnd: true,
        questions: true, // embedded type, safe
        _count: {
          select: { responses: true } // ✅ count instead of full data
        }
      }
    }),

    // ✅ RECENT RESPONSES ONLY
    prisma.response.findMany({
      take: 10,
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        score: true,
        submittedAt: true,
        user: {
          select: {
            email: true,
            name: true
          }
        },
        exam: {
          select: {
            title: true
          }
        }
      }
    }),

    // ✅ OTP COUNT
    prisma.verificationCode.count({
      where: { expires: { gt: new Date() } }
    })

  ]);

  // =========================
  // 📊 PROCESSING (lightweight)
  // =========================

  const totalUsers = users.length;

  const recentUsers = users.slice(0, 5);

  // Group by position
  const usersByPosition = users.reduce((acc, user) => {
    const pos = user.positionApplied || user.jobPost?.title || "Unspecified";
    acc[pos] = (acc[pos] || 0) + 1;
    return acc;
  }, {});

  // Application funnel
  const applicationFunnel = {
    Total: totalUsers,
    Pending: users.filter(u => u.examStatus === 'PENDING').length,
    ExamCompleted: users.filter(u =>
      ['COMPLETED', 'PASSED', 'FAILED', 'INTERVIEW', 'HIRED', 'REJECTED']
        .includes(u.examStatus)
    ).length,
    passed: users.filter(u =>
      ['PASSED', 'INTERVIEW', 'HIRED', 'REJECTED']
        .includes(u.examStatus)
    ).length,
    interview: users.filter(u =>
      ['INTERVIEW', 'HIRED', 'REJECTED']
        .includes(u.examStatus)
    ).length,
    hired: users.filter(u => u.examStatus === 'HIRED').length,
    rejected: users.filter(u => u.examStatus === 'REJECTED').length
  };

  // Jobs stats
  const activeJobs = jobs.filter(j => j.isActive).length;

  const topJobs = [...jobs]
    .sort((a, b) => b._count.applicants - a._count.applicants)
    .slice(0, 5);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  // =========================
  // 📦 FINAL DATA
  // =========================

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
          <div className="bg-white px-4 py-2 truncate rounded shadow text-xs border border-gray-100">
            Logged in as {session.user.email}
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