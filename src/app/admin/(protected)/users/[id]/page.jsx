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
    XCircleIcon
} from "@heroicons/react/24/outline";

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
                orderBy: { submittedAt: 'desc' },
                take: 1
            }
        }
    });

    if (!user) notFound();

    const response = user.responses[0];
    const exam = user.jobPost?.exam; // The exam they SHOULD have taken

    // Parse answers if they exist
    let answers = {};
    if (response && response.answers) {
        if (typeof response.answers === 'string') {
            try { answers = JSON.parse(response.answers); } catch (e) { }
        } else {
            answers = response.answers;
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition">
                    <ArrowLeftIcon className="w-4 h-4" /> Back to Dashboard
                </Link>

                {/* Header / Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                            <div className="flex flex-wrap gap-4 text-gray-500 text-sm">
                                <span className="flex items-center gap-2"><EnvelopeIcon className="w-4 h-4" /> {user.email}</span>
                                {user.mobile && <span className="flex items-center gap-2"><PhoneIcon className="w-4 h-4" /> {user.mobile}</span>}
                            </div>
                            <div className="mt-4 flex gap-3">
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-100">
                                    Applied for: {user.positionApplied || user.jobPost?.title || "General"}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold border ${user.examStatus === 'PASSED' ? 'bg-green-50 text-green-700 border-green-100' :
                                        user.examStatus === 'FAILED' ? 'bg-red-50 text-red-700 border-red-100' :
                                            user.examStatus === 'HIRED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                'bg-yellow-50 text-yellow-700 border-yellow-100'
                                    }`}>
                                    Status: {user.examStatus}
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

                {/* Assessment Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Assessment Result</h2>
                        {response && (
                            <span className="text-sm text-gray-500">
                                Submitted: {new Date(response.submittedAt).toLocaleString()}
                            </span>
                        )}
                    </div>

                    <div className="p-8">
                        {!exam ? (
                            <div className="text-center py-8 text-gray-500">No exam linked to this application.</div>
                        ) : !response ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-500">
                                    <DocumentTextIcon className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Not Attempted</h3>
                                <p className="text-gray-500">The candidate has not completed the assessment yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Score Summary (Optional, if you had auto-grading) */}
                                {/* <div className="p-4 bg-gray-50 rounded-lg">Score: {response.score}</div> */}

                                {exam.questions.map((q, index) => {
                                    const userAnswer = answers[q.id];
                                    // If it's yes/no, we can crudely check correctness if correctAnswer is stored
                                    // For Writing, it's subjective.

                                    return (
                                        <div key={q.id} className="border-b last:border-0 pb-8 last:pb-0">
                                            <p className="font-medium text-gray-500 text-sm mb-2">Question {index + 1}</p>
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">{q.text}</h3>

                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Candidate's Answer</p>
                                                <p className="text-gray-800 whitespace-pre-wrap">{userAnswer || <span className="text-gray-400 italic">No answer provided</span>}</p>
                                            </div>

                                            {q.correctAnswer && (
                                                <div className="mt-2 text-sm text-green-700 flex items-center gap-2">
                                                    <CheckCircleIcon className="w-4 h-4" />
                                                    Correct Answer: {q.correctAnswer}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
