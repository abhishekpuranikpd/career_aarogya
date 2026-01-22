import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import PrintTrigger from "./PrintTrigger"; // Client component to trigger print

export default async function PrintResponse({ params }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
        redirect("/admin/login");
    }

    const { id } = await params;

    const response = await prisma.response.findUnique({
        where: { id },
        include: {
            user: true,
            exam: {
                include: {
                    questions: true
                }
            }
        }
    });

    if (!response) notFound();

    const { user, exam } = response;

    // Parse answers
    let answers = {};
    if (response.answers) {
        answers = typeof response.answers === 'string' ? JSON.parse(response.answers) : response.answers;
    }

    return (
        <div className="bg-white text-black min-h-screen p-8 max-w-4xl mx-auto print:p-0 print:max-w-none">
            <PrintTrigger />

            {/* Header */}
            <div className="border-b-2 border-gray-800 pb-6 mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">Answer Sheet</h1>
                    <h2 className="text-xl text-gray-700 font-semibold">{exam.title}</h2>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                    <p className="font-mono text-sm">Ref: {response.id.slice(-8)}</p>
                </div>
            </div>

            {/* Candidate Info - Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200 print:bg-transparent print:border print:border-gray-800 print:rounded-none">
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Candidate Name</p>
                    <p className="text-lg font-bold">{user.name}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                    <p className="text-lg">{user.email}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Submission Date</p>
                    <p>{new Date(response.submittedAt).toLocaleDateString()} <span className="text-sm text-gray-500">at {new Date(response.submittedAt).toLocaleTimeString()}</span></p>
                </div>
                {user.mobile && (
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Mobile</p>
                        <p>{user.mobile}</p>
                    </div>
                )}
            </div>

            {/* Questions/Answers */}
            <div className="space-y-6">
                {exam.questions.map((q, index) => {
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
                        <div key={q.id} className="break-inside-avoid border-b border-gray-200 pb-6 last:border-0">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm print:border print:border-black print:text-black print:bg-transparent">
                                    {index + 1}
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-bold text-gray-900 mb-3 text-lg">{q.text}</h4>

                                    <div className="bg-gray-50 p-4 border-l-4 border-gray-800 print:bg-transparent print:border-l-2 print:border-black print:pl-4 print:py-0">
                                        <p className="font-medium text-gray-800 whitespace-pre-wrap">
                                            {displayValue || <span className="text-gray-400 italic">No answer provided</span>}
                                        </p>

                                        {(detail || explanation) && (
                                            <div className="mt-2 pt-2 border-t border-gray-200 text-sm print:border-gray-400">
                                                {detail && <div className="mb-1"><span className="font-bold">Details:</span> {detail}</div>}
                                                {explanation && <div><span className="font-bold">Explanation:</span> "{explanation}"</div>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-400 print:fixed print:bottom-0 print:left-0 print:w-full">
                System Generated Report • Aarogya Aadhar Careers
            </div>
        </div>
    );
}
