import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeftIcon,
    userIcon,
    EnvelopeIcon,
    PhoneIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    PrinterIcon
} from "@heroicons/react/24/outline";
import BackButton from "@/app/admin/components/BackButton";
import StatusUpdater from "@/app/admin/components/StatusUpdater";
import ScoreUpdater from "@/app/admin/components/ScoreUpdater";

export default async function ApplicantDetails({ params }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        redirect("/admin/login");
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            jobPost: {
                include: {
                    exam: {
                        include: {
                            questions: true
                        }
                    }
                }
            },
            responses: {
                include: {
                    exam: true
                },
                orderBy: { submittedAt: 'desc' }
            }
        }
    });

    if (!user) notFound();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <BackButton />

                {/* Header / Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                                <StatusUpdater userId={user.id} currentStatus={user.examStatus} />
                            </div>
                            <div className="flex flex-wrap gap-4 text-gray-500 text-sm">
                                <span className="flex items-center gap-2"><EnvelopeIcon className="w-4 h-4" /> {user.email}</span>
                                {user.mobile && <span className="flex items-center gap-2"><PhoneIcon className="w-4 h-4" /> {user.mobile}</span>}
                            </div>
                            <div className="mt-4">
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-100">
                                    History: {user.responses.length} Assessment(s) Taken
                                </span>
                            </div>
                        </div>

                        {user.resumeUrl && (
                            <a
                                href={user.resumeUrl}
                                target="_blank"
                                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition shadow-sm"
                            >
                                <DocumentTextIcon className="w-5 h-5" /> View Resume
                            </a>
                        )}
                    </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-6">Assessment History</h2>

                {user.responses.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <DocumentTextIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No Assessment History</h3>
                        <p className="text-gray-500">This candidate has not completed any assessments yet.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {user.responses.map((response, rIndex) => {
                            const exam = response.exam;

                            // Parse answers
                            let answers = {};
                            if (response.answers) {
                                answers = typeof response.answers === 'string' ? JSON.parse(response.answers) : response.answers;
                            }

                            return (
                                <div key={response.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{exam?.title || "Unknown Exam"}</h3>
                                            <p className="text-sm text-gray-500">
                                                Submitted: {new Date(response.submittedAt).toLocaleDateString()} at {new Date(response.submittedAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <ScoreUpdater responseId={response.id} currentScore={response.score} />
                                            <a
                                                href={`/admin/print/response/${response.id}`}
                                                target="_blank"
                                                className="flex items-center gap-2 text-sm px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition shadow-sm font-medium"
                                            >
                                                <PrinterIcon className="w-4 h-4" /> Print PDF
                                            </a>
                                            <div className="text-sm px-3 py-1 bg-white border rounded font-mono">
                                                ID: {response.id.slice(-6)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-8">
                                        {!exam ? (
                                            <p className="text-red-500">Exam details no longer exist.</p>
                                        ) : (
                                            exam.questions.map((q, index) => {
                                                const rawAnswer = answers[q.id];
                                                let displayValue = "";
                                                let explanation = "";
                                                let detail = "";

                                                if (typeof rawAnswer === 'object' && rawAnswer !== null) {
                                                    displayValue = rawAnswer.value;
                                                    explanation = rawAnswer.explanation;
                                                    detail = rawAnswer.detail;
                                                } else {
                                                    displayValue = rawAnswer;
                                                }

                                                return (
                                                    <div key={q.id} className="border-b last:border-0 pb-8 last:pb-0">
                                                        <p className="font-medium text-gray-500 text-sm mb-2">Question {index + 1}</p>
                                                        <h4 className="text-gray-900 font-bold mb-4">{q.text}</h4>

                                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Answer</p>
                                                                <p className="text-gray-900 font-medium whitespace-pre-wrap">{displayValue || <span className="text-gray-400 italic">No answer provided</span>}</p>
                                                            </div>
                                                            {detail && (
                                                                <div className="pt-2 border-t border-gray-200">
                                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Details</p>
                                                                    <p className="text-gray-800">{detail}</p>
                                                                </div>
                                                            )}
                                                            {explanation && (
                                                                <div className="pt-2 border-t border-gray-200">
                                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Explanation</p>
                                                                    <p className="text-gray-800 italic">"{explanation}"</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
