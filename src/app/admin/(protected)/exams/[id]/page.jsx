import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"
import ApplicantsTable from "./ApplicantsTable";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

async function updateStatus(userId, status, examId) {
    "use server";
    await prisma.user.update({
        where: { id: userId },
        data: { examStatus: status }
    });
    // Add revalidatePath if needed, or rely on client router.refresh
    if (examId) revalidatePath(`/admin/exams/${examId}`);
}

export default async function ExamDetails({ params }) {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/admin/login");

    // Unwrap params (it's a Promise in newer Next.js)
    const { id } = await params;

    const exam = await prisma.exam.findUnique({
        where: { id },
        include: {
            responses: {
                include: { user: true },
                orderBy: { submittedAt: 'desc' }
            }
        }
    });

    if (!exam) return <div className="p-8">Exam not found</div>;

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
                    </div>
                </div>

                <h2 className="text-xl font-bold mb-4 text-gray-700">Applicants ({exam.responses.length})</h2>
                <ApplicantsTable
                    responses={exam.responses}
                    updateStatusServerAction={updateStatus}
                />
            </div>
        </div>
    );
}
