"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircleIcon, PrinterIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";

// Mock questions for demo if DB is empty
const DEMO_QUESTIONS = {
    "demo-1": [
        { id: "q1", text: "Are you comfortable working in night shifts?", options: ["Yes", "No"] },
        { id: "q2", text: "Do you have prior experience in healthcare?", options: ["Yes", "No"] },
        { id: "q3", text: "Are you willing to relocate if required?", options: ["Yes", "No"] },
    ],
    "demo-2": [
        { id: "w1", text: "Describe a challenging situation you handled in your previous role.", options: [] },
        { id: "w2", text: "Why do you want to join Aarogya Aadhar?", options: [] },
    ]
};

export default function ExamSession({ params }) {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    // Unwrap params safely using React.use()
    const unwrappedParams = use(params);
    const examId = unwrappedParams.id;

    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [agreed, setAgreed] = useState(false);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                // Try fetching from API first
                const res = await fetch(`/api/exam/${examId}`);
                if (res.ok) {
                    const data = await res.json();
                    // The API returns { id, title, questions, completed, ... }
                    if (data.completed) {
                        setCompleted(true);
                        setLoading(false);
                        return;
                    }

                    if (data && data.questions) {
                        setQuestions(data.questions);
                        setLoading(false);
                        return;
                    }
                }
            } catch (e) {
                console.error("Failed to fetch exam", e);
            }

            // Fallback to demo if API fails or returns nothing (for dev/demo purposes)
            if (DEMO_QUESTIONS[examId]) {
                setQuestions(DEMO_QUESTIONS[examId]);
            } else {
                // Default fallback if nothing found (e.g. for creating new UI flow before backend ready)
                // ideally show error, but keeping empty for now
            }
            setLoading(false);
        };

        if (examId) {
            fetchExam();
        }
    }, [examId]);

    const handleAnswer = (qId, value) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);

        // Simulate network delay for submission
        setTimeout(async () => {
            try {
                await fetch("/api/exam/submit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        examId,
                        answers
                        // In a real app, include userId or session token
                    })
                });
            } catch (e) {
                console.error(e);
            }

            setCompleted(true);
            setSubmitting(false);
        }, 1500);
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading assessment...</div>;



    if (completed) {
        // ... (keep existing completed view)
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <CheckCircleIcon className="w-20 h-20 text-green-500 mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Assessment Completed</h2>
                <p className="text-gray-500 mb-8 max-w-md">You have already completed this assessment. Our team is reviewing your application.</p>
                <button
                    onClick={() => router.push('/')}
                    className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl"
                >
                    Return to Home
                </button>
            </div>
        );
    }

    if (!termsAccepted) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
                <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-primary px-8 py-6 text-white text-center">
                        <h2 className="text-2xl font-bold">Candidate Agreement</h2>
                        <p className="text-blue-100 text-sm mt-1">Please review and accept the terms to proceed.</p>
                    </div>
                    <div className="p-8 h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
                        {/* Privacy & Terms Summary */}
                        <section>
                            <h3 className="font-bold text-gray-900 mb-2">1. Privacy & Terms</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                By proceeding, you agree to our <a href="/legal" target="_blank" className="text-primary underline">Privacy Policy and Terms of Service</a>.
                                We collect your responses solely for recruitment purposes. Your data is handled securely and is not shared with unauthorized third parties.
                            </p>
                        </section>

                        {/* NDA Section */}
                        <section className="bg-amber-50 p-5 rounded-lg border border-amber-100">
                            <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                                <span className="p-1 bg-amber-200 rounded text-xs">CRITICAL</span>
                                Non-Disclosure Agreement (NDA)
                            </h3>
                            <div className="text-sm text-amber-800 space-y-3 leading-relaxed">
                                <p>You acknowledge that the assessment content (questions, scenarios, technical challenges) is <strong>confidential property</strong> of Aarogya Aadhar.</p>
                                <p><strong>You Agree To:</strong></p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>NOT copy, screenshot, or record any part of this exam.</li>
                                    <li>NOT share questions or answers on social media, GitHub, forums, or with other candidates.</li>
                                    <li>NOT use AI assistants (ChatGPT, Gemini, etc.) to generate answers.</li>
                                </ul>
                                <p className="font-bold mt-2">Violation of these terms will result in immediate disqualification and potential legal action.</p>
                            </div>
                        </section>

                        <section>
                            <h3 className="font-bold text-gray-900 mb-2">2. Exam Rules</h3>
                            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                                <li>Ensure you have a stable internet connection.</li>
                                <li>Do not refresh the page once started.</li>
                                <li>All answers must be your own original work.</li>
                            </ul>
                        </section>
                    </div>
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col items-center gap-4">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm checked:border-primary checked:bg-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    id="accept-terms"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                />
                                <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-0 peer-checked:opacity-100 text-white transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-sm text-gray-600 select-none group-hover:text-gray-900 transition-colors">
                                I have read and agree to the <span className="font-bold text-gray-900">Privacy Policy, Terms, and NDA</span>. I understand that using AI or sharing questions will lead to rejection.
                            </span>
                        </label>
                        <button
                            id="start-btn"
                            disabled={!agreed}
                            onClick={() => setTermsAccepted(true)}
                            className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none"
                        >
                            Start Assessment
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            {/* ... existing exam render code ... */}
            <div className="container mx-auto max-w-3xl">
                <div className="mb-10 text-center flex flex-col items-center relative print:mb-4">
                    {/* Print Button - Hidden on Print */}
                    {session?.user?.role === 'admin' && (
                        <button
                            onClick={() => window.print()}
                            className="print:hidden absolute right-0 top-0 p-2 text-gray-500 hover:text-gray-900 bg-white rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-sm font-medium"
                            title="Print Exam Paper"
                        >
                            <PrinterIcon className="w-5 h-5" /> <span className="hidden sm:inline">Print Paper</span>
                        </button>
                    )}

                    {/* Screen Header */}
                    <div className="print:hidden">
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">Assessment</h1>
                        <p className="text-gray-500 mb-6">Please answer all questions honestly and to the best of your ability.</p>

                        <div className="w-full max-w-2xl bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8 text-left mx-auto">
                            <h4 className="flex items-center gap-2 font-bold text-amber-800 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                                </svg>
                                Important Instructions
                            </h4>
                            <ul className="list-disc list-inside space-y-2 text-sm text-amber-900">
                                <li><strong>Strictly No AI Usage:</strong> Do NOT use ChatGPT, Gemini, or any other AI tools to answer.</li>
                                <li><strong>Plagiarism Check:</strong> Your answers will be scanned for AI-generated content.</li>
                                <li><strong>Automatic Rejection:</strong> If AI usage is detected, your application will be <span className="underline font-bold text-red-600">IMMEDIATELY REJECTED</span>.</li>
                                <li>Write in your own words based on your experience.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Print Header - Visible ONLY on Print */}
                    <div className="hidden print:block w-full text-left mb-8 border-b-2 border-black pb-4">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                {/* Use simple img tag for print to avoid Next.js Image issues in print mode sometimes, or just ensure styles work */}
                                <img
                                    src="https://res.cloudinary.com/dorreici1/image/upload/v1763636388/420a5318-cb6c-4915-a728-979d8973a9d1.png"
                                    alt="Logo"
                                    className="h-16 object-contain"
                                />
                            </div>
                            <div className="text-xl font-bold uppercase tracking-wider text-right">
                                Assessment Paper
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-sm">
                            <div className="flex items-baseline">
                                <span className="font-bold mr-2 w-32">Candidate Name:</span>
                                <span className="border-b border-black flex-1 h-6 font-mono pl-2">
                                    {session?.user?.name || ''}
                                </span>
                            </div>
                            <div className="flex items-baseline">
                                <span className="font-bold mr-2 w-16">Date:</span>
                                <span className="border-b border-black flex-1 h-6 font-mono pl-2">
                                    {new Date().toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-baseline col-span-2">
                                <span className="font-bold mr-2 w-32">Position Applied:</span>
                                <span className="border-b border-black flex-1 h-6 font-mono pl-2">
                                    {/* Try to get exam title or job title if available in the future. For now, use generic or passed data */}
                                    {questions.length > 0 ? "Aarogya Aadhar Applicant" : ""}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 p-4 border border-black rounded-lg text-xs">
                            <h4 className="font-bold uppercase mb-2 underline">Exam Instructions:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Answer all questions in the space provided.</li>
                                <li><strong>Do NOT use AI tools.</strong> Answers detected as AI-generated will lead to rejection.</li>
                                <li>Write clearly and legible.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 print:space-y-8">
                    {questions.map((q, idx) => {
                        const isQuestionYesNo = q.options && q.options.length > 0;

                        return (
                            <div key={q.id || idx} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow print:shadow-none print:border-none print:p-0 print:mb-8 break-inside-avoid">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 leading-relaxed print:text-black">
                                    <span className="text-gray-400 mr-2 print:text-black print:font-bold">{idx + 1}.</span>
                                    {q.text}
                                </h3>

                                {isQuestionYesNo ? (
                                    <div className="flex flex-col sm:flex-row gap-4 print:gap-12 print:mt-2">
                                        {q.options.map(opt => (
                                            <div key={opt} className="print:hidden flex-1">
                                                <label className={`
                                                    flex items-center justify-center py-4 px-6 rounded-xl cursor-pointer transition-all border-2 w-full
                                                    ${answers[q.id] === opt ? 'bg-primary/5 border-primary text-primary font-bold shadow-sm' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'}
                                                  `}>
                                                    <input type="radio" name={q.id} value={opt} className="hidden" onChange={() => handleAnswer(q.id, opt)} checked={answers[q.id] === opt} />
                                                    {opt}
                                                </label>
                                            </div>
                                        ))}

                                        {/* Print Version: Checkboxes */}
                                        {q.options.map(opt => (
                                            <div key={opt} className="hidden print:flex items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-black rounded flex-shrink-0"></div>
                                                <span className="text-black font-medium">{opt}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative">
                                            <textarea
                                                className={`w-full p-6 bg-gray-50 rounded-xl border focus:ring-4 outline-none transition-all min-h-[180px] text-gray-800 placeholder:text-gray-400 font-medium leading-relaxed resize-y spell-check-false print:hidden
                                                    ${(answers[q.id]?.trim().split(/\s+/).filter(w => w.length > 0).length || 0) > 100
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                                        : 'border-gray-200 focus:border-primary focus:ring-primary/10'}`}
                                                placeholder="Type your detailed answer here... (Max 100 words)"
                                                onChange={(e) => handleAnswer(q.id, e.target.value)}
                                                value={answers[q.id] || ''}
                                                spellCheck="false"
                                            ></textarea>
                                            <div className={`absolute bottom-4 right-4 text-xs font-bold print:hidden pointer-events-none transition-colors
                                                ${(answers[q.id]?.trim().split(/\s+/).filter(w => w.length > 0).length || 0) > 100 ? 'text-red-500' : 'text-gray-400'}`}>
                                                {answers[q.id]?.trim().split(/\s+/).filter(w => w.length > 0).length || 0} / 100 words
                                            </div>
                                        </div>

                                        {/* Print Version: Ruled Lines */}
                                        <div className="hidden print:block w-full mt-4 space-y-8">
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className="border-b border-gray-300 w-full h-2"></div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {searchParams.get('preview') === 'true' && q.correctAnswer && (
                                    <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm font-bold border border-green-100 rounded-lg flex items-center gap-2 print:hidden">
                                        <CheckCircleIcon className="w-5 h-5" /> Correct Answer: {q.correctAnswer}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 flex justify-end print:hidden">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || Object.keys(answers).length < questions.length}
                        className="
              px-10 py-4 bg-primary text-white rounded-full font-bold text-lg shadow-xl 
              hover:bg-blue-700 hover:shadow-2xl hover:-translate-y-1 transition-all 
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none
            "
                    >
                        {submitting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting Response...
                            </span>
                        ) : 'Submit Assessment'}
                    </button>
                </div>
            </div>
        </div>
    );
}
