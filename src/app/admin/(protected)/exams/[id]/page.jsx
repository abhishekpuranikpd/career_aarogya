import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeftIcon, DocumentCheckIcon, UserGroupIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import ApplicantsTable from "./ApplicantsTable";
import { revalidatePath } from "next/cache";
import ExamSettings from "./ExamSettings";
import ResultDateManager from "./ResultDateManager";

export const dynamic = 'force-dynamic';

async function updateStatus(userId, status, examId) {
    "use server";
    await prisma.user.update({
        where: { id: userId },
        data: { examStatus: status }
    });
    if (examId) revalidatePath(`/admin/exams/${examId}`);
}

export default async function ExamDetails({ params }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/admin/login");

    const { id } = await params;

    // Lean Exam Query - Avoid loading thousands of responses into memory
    const exam = await prisma.exam.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            type: true,
            windowStart: true,
            windowEnd: true,
            questions: true,
            jobPosts: {
                select: {
                    id: true,
                    title: true,
                    resultDate: true,
                    examStartDate: true
                }
            }
        }
    });

    if (!exam) return <div className="p-8">Exam not found</div>;

    // Optimized parallel count aggregations
    const totalApplicantsCount = await prisma.response.count({
        where: { examId: id }
    });

    const jobPostCounts = await Promise.all(
        exam.jobPosts.map(async (jp) => {
            const count = await prisma.response.count({
                where: {
                    examId: id,
                    user: { jobPostId: jp.id }
                }
            });
            return {
                id: jp.id,
                title: jp.title,
                resultDate: jp.resultDate,
                count
            };
        })
    );

    const uncategorizedCount = await prisma.response.count({
        where: {
            examId: id,
            user: { jobPostId: null }
        }
    });

    const jobSummary = [
        { id: "all", title: "All Careers", count: totalApplicantsCount },
        ...jobPostCounts,
        ...(uncategorizedCount > 0 ? [{ id: "uncategorized", title: "Uncategorized", count: uncategorizedCount }] : [])
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Back to Dashboard */}
                <Link 
                    href="/admin/dashboard" 
                    className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-primary mb-6 transition-colors group"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
                    Back to Admin Dashboard
                </Link>

                {/* Exam Header Banner */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                                    {exam.type}
                                </span>
                                <span className="text-xs text-gray-400 font-mono">ID: {exam.id}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{exam.title}</h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50/60 rounded-xl border border-blue-100">
                                <DocumentCheckIcon className="w-5 h-5 text-blue-600" />
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-gray-400">Questions</span>
                                    <span className="text-sm font-bold text-gray-800">{exam.questions.length} Questions</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50/60 rounded-xl border border-purple-100">
                                <UserGroupIcon className="w-5 h-5 text-purple-600" />
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-gray-400">Total Written</span>
                                    <span className="text-sm font-bold text-purple-950">{totalApplicantsCount.toLocaleString()} Submissions</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exam Window Settings */}
                <ExamSettings exam={exam} />

                {/* Result Announcement & Showcase Date Manager */}
                <ResultDateManager linkedJobs={exam.jobPosts} examId={exam.id} />

                {/* High Performance Paginated & Filtered Applicants Table */}
                <ApplicantsTable
                    examId={exam.id}
                    jobPosts={jobSummary}
                    initialJobPostId="all"
                    updateStatusServerAction={updateStatus}
                />
            </div>
        </div>
    );
}
