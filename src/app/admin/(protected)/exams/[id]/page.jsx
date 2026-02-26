import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"
import ApplicantsTable from "./ApplicantsTable";
import { revalidatePath } from "next/cache";
import ExamSettings from "./ExamSettings";

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
    const session = await getServerSession(authOptions)
    if (!session) redirect("/admin/login");

    const { id } = await params;

    const exam = await prisma.exam.findUnique({
        where: { id },
        include: {
            jobPosts: {
                select: { id: true, title: true }
            },
            responses: {
                include: {
                    user: {
                        include: {
                            jobPost: { select: { id: true, title: true } }
                        }
                    }
                },
                orderBy: { submittedAt: 'desc' }
            }
        }
    });

    if (!exam) return <div className="p-8">Exam not found</div>;

    // Group responses by job post
    // Build a map: jobPostId -> { title, responses[] }
    const jobPostMap = {};

    // Initialize with all job posts linked to this exam (even if 0 respondents)
    for (const jp of exam.jobPosts) {
        jobPostMap[jp.id] = { title: jp.title, responses: [] };
    }

    // Bucket responses
    const uncategorized = [];
    for (const response of exam.responses) {
        const jpId = response.user?.jobPostId;
        if (jpId && jobPostMap[jpId]) {
            jobPostMap[jpId].responses.push(response);
        } else if (jpId) {
            // User has a jobPostId not in exam.jobPosts (edge case)
            const title = response.user?.jobPost?.title || "Other";
            if (!jobPostMap[jpId]) {
                jobPostMap[jpId] = { title, responses: [] };
            }
            jobPostMap[jpId].responses.push(response);
        } else {
            uncategorized.push(response);
        }
    }

    const groupedEntries = Object.entries(jobPostMap);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="container mx-auto">
                <Link href="/admin/dashboard" className="flex items-center text-gray-500 hover:text-primary mb-6 transition-colors">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{exam.title}</h1>
                    <div className="flex gap-4 text-sm text-gray-500">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">{exam.type}</span>
                        <span className="flex items-center">ID: {exam.id}</span>
                        <span className="flex items-center">{exam.questions.length} Questions</span>
                        <span className="flex items-center">{exam.responses.length} Total Applicants</span>
                    </div>
                </div>

                {/* Exam Settings (Time Window) */}
                <ExamSettings exam={exam} />

                {/* Career-wise Applicant Sections */}
                {groupedEntries.length > 0 ? (
                    groupedEntries.map(([jpId, { title, responses }]) => (
                        <div key={jpId} className="mb-10">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-700">{title}</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">{responses.length} applicant{responses.length !== 1 ? 's' : ''}</p>
                                </div>
                                <a
                                    href={`/api/admin/exams/${exam.id}/export?jobPostId=${jpId}`}
                                    target="_blank"
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-sm text-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    Export CSV
                                </a>
                            </div>
                            <ApplicantsTable
                                responses={responses}
                                updateStatusServerAction={updateStatus}
                            />
                        </div>
                    ))
                ) : (
                    // Fallback: no job posts linked, show flat list
                    <div className="mb-10">
                        <div className="flex justify-between items-end mb-4">
                            <h2 className="text-xl font-bold text-gray-700">Applicants ({exam.responses.length})</h2>
                            <a
                                href={`/api/admin/exams/${exam.id}/export`}
                                target="_blank"
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-sm"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                Export CSV
                            </a>
                        </div>
                        <ApplicantsTable
                            responses={exam.responses}
                            updateStatusServerAction={updateStatus}
                        />
                    </div>
                )}

                {/* Uncategorized applicants (applied to no specific job or a different job) */}
                {uncategorized.length > 0 && (
                    <div className="mb-10">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-700">Uncategorized Applicants</h2>
                                <p className="text-sm text-gray-500 mt-0.5">{uncategorized.length} applicant{uncategorized.length !== 1 ? 's' : ''} not linked to a specific career</p>
                            </div>
                            <a
                                href={`/api/admin/exams/${exam.id}/export`}
                                target="_blank"
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-sm text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                Export CSV
                            </a>
                        </div>
                        <ApplicantsTable
                            responses={uncategorized}
                            updateStatusServerAction={updateStatus}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
