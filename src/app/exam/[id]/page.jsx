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
    const [examMetadata, setExamMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [expandNDA, setExpandNDA] = useState(false);
    const [securityWarning, setSecurityWarning] = useState(false);

    // Data Fetching and Answer Initialization (Restored)
    useEffect(() => {
        const fetchExam = async () => {
            try {
                // Try fetching from API first
                const res = await fetch(`/api/exam/${examId}`);
                if (res.ok) {
                    const data = await res.json();

                    // Save metadata (timings, title, etc)
                    setExamMetadata(data);

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
            }
            setLoading(false);
        };

        if (examId) {
            fetchExam();
        }
    }, [examId]);

    // Initialize answers structure when questions load
    useEffect(() => {
        if (questions && questions.length > 0) {
            const initialAnswers = {};
            questions.forEach(q => {
                initialAnswers[q.id] = { value: '', explanation: '', detail: '' };
            });
            // Only set if empty to avoid wiping state on re-renders if any
            setAnswers(prev => Object.keys(prev).length === 0 ? initialAnswers : prev);
        }
    }, [questions]);

    // SECURITY: Prevent Copy/Paste/Right-Click
    useEffect(() => {
        const handlePrevent = (e) => {
            e.preventDefault();
            return false;
        };

        const handleSecurityViolation = () => {
            if (completed) return; // Don't warn if already finished
            if (!termsAccepted) return; // Don't warn before starting
            setSecurityWarning(true);
        };

        if (termsAccepted && !completed) {
            document.addEventListener('contextmenu', handlePrevent);
            document.addEventListener('copy', handlePrevent);
            document.addEventListener('cut', handlePrevent);
            document.addEventListener('paste', handlePrevent);

            // Window/Tab switching detection
            window.addEventListener('blur', handleSecurityViolation);
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) handleSecurityViolation();
            });
        }

        return () => {
            document.removeEventListener('contextmenu', handlePrevent);
            document.removeEventListener('copy', handlePrevent);
            document.removeEventListener('cut', handlePrevent);
            document.removeEventListener('paste', handlePrevent);
            window.removeEventListener('blur', handleSecurityViolation);
        };
    }, [termsAccepted, completed]);

    const handleAnswer = (qId, updates) => {
        setAnswers(prev => ({
            ...prev,
            [qId]: { ...prev[qId], ...updates }
        }));
    };

    const handleSubmit = async () => {
        // Validation: Check for missing answers
        const missing = questions.filter(q => {
            const ans = answers[q.id];
            // 1. Check main value
            if (!ans || !ans.value || (typeof ans.value === 'string' && !ans.value.trim())) return true;

            // 2. Check conditional inputs (Bachelor/Other details)
            if (q.type === 'RADIO_WITH_INPUT') {
                if ((ans.value === 'Other' || ans.value === 'Bachelor Degree') && (!ans.detail || !ans.detail.trim())) {
                    return true;
                }
            }

            // 3. Check Explanations
            if (q.requiresExplanation && ans.value === 'Yes') {
                if (!ans.explanation || !ans.explanation.trim()) return true;

                // MIN WORD COUNT CHECK
                const wordCount = (ans.explanation || '').trim().split(/\s+/).filter(w => w.length > 0).length;
                const minWords = Math.floor((q.wordLimit || 100) / 2);
                if (wordCount < minWords) {
                    alert(`Question ${questions.indexOf(q) + 1} requires at least ${minWords} words for the explanation.`);
                    return true;
                }
            }

            // 4. Check Text Area Min Word Count
            if (q.type === 'TEXT') {
                const wordCount = (ans.value || '').trim().split(/\s+/).filter(w => w.length > 0).length;
                const minWords = Math.floor((q.wordLimit || 200) / 2);
                if (wordCount < minWords) {
                    alert(`Question ${questions.indexOf(q) + 1} requires at least ${minWords} words.`);
                    return true;
                }
            }

            return false;
        });

        if (missing.length > 0) {
            // alert is handled inside the filter for specific messages, or generic here
            // Note: filter stops at first true, so alerts might be spammy if we did it inside. 
            // Better approach: find first error and alert.
            // Retaining generic alert as fallback if needed, but the inner alerts are better.
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch("/api/exam/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    examId,
                    answers
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Submission failed");
            }

            setCompleted(true);
        } catch (e) {
            console.error(e);
            alert("Failed to submit exam: " + e.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading assessment...</div>;

    // Check Time Window
    if (examMetadata) {
        const now = new Date();
        const start = examMetadata.windowStart ? new Date(examMetadata.windowStart) : null;
        const end = examMetadata.windowEnd ? new Date(examMetadata.windowEnd) : null;

        if (start && now < start) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 text-center">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Not Started</h2>
                        <p className="text-gray-500 mb-6">This assessment is scheduled to start on:</p>
                        <div className="bg-blue-50 p-4 rounded-xl text-blue-900 font-bold text-lg mb-6">
                            {start.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                        <p className="text-sm text-gray-400">Please come back at the scheduled time.</p>
                    </div>
                </div>
            );
        }

        if (end && now > end) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 text-center">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Expired</h2>
                        <p className="text-gray-500 mb-6">The window for this assessment has closed on:</p>
                        <div className="bg-red-50 p-4 rounded-xl text-red-900 font-bold text-lg mb-6">
                            {end.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                        <p className="text-sm text-gray-400">If you believe this is an error, please contact HR.</p>
                    </div>
                </div>
            );
        }
    }

    if (completed) {
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
                            <p className="text-xs text-amber-700/70 mb-3">Effective Date: {new Date().toLocaleDateString()}</p>

                            <div className={`text-sm text-amber-900 space-y-3 leading-relaxed transition-all ${expandNDA ? '' : 'max-h-40 overflow-hidden relative'}`}>
                                <p><strong>BETWEEN:</strong> Livo AarogyaAadhar Private Limited ("The Company") AND You ("The Candidate/Employee").</p>

                                <p><strong>1. Confidential Information:</strong> You agree that all information shared by the Company (financials, strategies, products, code, data, customer lists, IP) is strictly confidential property.</p>

                                <p><strong>2. Obligations:</strong> You shall NOT disclose, copy, record, or misuse any Confidential Information. You shall not use AI tools (ChatGPT, etc.) to generate answers or share exam content.</p>

                                {expandNDA && (
                                    <div className="mt-4 space-y-4 text-xs text-amber-900/90 border-t border-amber-200 pt-4">
                                        <h4 className="font-bold text-center text-sm">NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT</h4>
                                        <p>This Non-Disclosure Agreement (hereinafter referred to as the “Agreement”) is made and executed on this <strong>{new Date().toLocaleDateString()}</strong> (hereinafter the “Effective Date”).</p>

                                        <p><strong>BETWEEN</strong><br />
                                            Livo AarogyaAadhar Private Limited, CIN: U86201PN2023PTC219864, a Company registered under the Companies Act 2013, having its registered office at – Aarogya Aadhar Office Address: Kisan Bhavan, Aarogya Aadhar Patient War Room, Opp to Bank of Baroda, Range Hill Road, Yashwant Nagar, Pune - 411053, Maharashtra, India, through its Founder & Managing Director Dr Shubham (DIN:10129766)<br />
                                            …Hereinafter referred to as the “Livo AarogyaAadhar Private Limited” (Which expression shall unless repugnant to the context thereof shall be deemed to mean and include its heirs, executors, successors, administrators and assignees)</p>

                                        <p><strong>AND</strong><br />
                                            The Candidate/Employee/Shareholder/Co-Founder (You)<br />
                                            ….... Hereinafter referred to as the “Employee/Shareholder/Co-Founder” (Which expression shall unless repugnant to the context thereof shall be deemed to mean and include its heirs, executors, successors, administrators and assigns. Any individual not limited to Employee/Shareholder/Co- Founder, consultant, vendor, vendor staff, associate will be termed as “Employee/Shareholder/Co- Founder”)</p>

                                        <p>The parties shall be individually referred to as “Party” and collectively as “Parties”.</p>

                                        <div className="pl-4 border-l-2 border-amber-200">
                                            <p className="font-bold">RECITALS</p>
                                            <ul className="list-[upper-alpha] list-inside space-y-1">
                                                <li>Whereas, the Company is a Company incorporated under The Companies Act, 2013 and is engaged in the business of Healthcare service provider</li>
                                                <li>Whereas, the Company possessed all the Technology, Patents, Trade Secrets, Confidential Information, Confidential Material, Know-How and other Proprietary Information regarding the Said Services.</li>
                                                <li>Whereas, the Company has applied for various Patents and Trade Marks which are under process at present; Company hereby declares that the Company possess all the Patents, Trade Secrets, Confidential Information, Confidential Material, Know-How and other Proprietary Information regarding the Said Services.</li>
                                                <li>Whereas, the Employee/Shareholder/Co-Founder is employed by the Company or hired as consultant or vendor, the Employee/Shareholder/Co-Founder acknowledges that in the course of employment he may have access to or have disclosed to him certain information of a confidential nature by the Company.</li>
                                                <li>Whereas, the Company is desirous of setting forth the obligations on the Employee/Shareholder/Co-Founder with respect to such Confidential Information.</li>
                                                <li>Whereas, the unauthorized disclosure or use by the Employee/Shareholder/Co-Founder of such Confidential Information, Confidential Material, Know-How, Trade Secret and other proprietary information of the Company could expose the Company to irreparable harm in monetary terms as well as in reputation and goodwill.</li>
                                            </ul>
                                        </div>

                                        <p>The Company hired the Employee/Shareholder/Co-Founder as Freelance consultant pursuant to the terms and conditions of that certain Employment Agreement executed between the Parties. In connection with the duties under the Employment Agreement, the Company may disclose to the Employee/Shareholder/Co-Founder certain confidential and proprietary information unique and valuable to its ongoing business operations. In consideration of the employment by the Company and the covenants and mutual promises contained herein, the parties agree as follows:</p>

                                        <h5 className="font-bold">1. Confidential Information</h5>
                                        <p>Confidential information is:</p>
                                        <ul className="list-disc list-inside pl-2">
                                            <li>
                                                <strong>All information shared by the Company.</strong> "Confidential Information" shall mean (i) all information relating to the Company’s products, business and operations including, but not limited to, financial documents and plans, customers, suppliers, manufacturing partners, marketing strategies, all proprietary concepts... source code, software, algorithms, data... whether in oral, tangible, electronic or other form; (ii) the terms of any agreement... (iii) information acquired during any tours of the Company’s facilities; and (iv) all other non-public information.
                                            </li>
                                            <li>
                                                <strong>Specific information</strong> including 'Accounting Information', 'Business Operations', 'Computer Technology', 'Customer Information', 'Intellectual Property', 'Marketing and Sales Information', 'Proprietary Rights', 'Procedures and Specifications', 'Product Information', 'Service Information', and 'Software Information'.
                                            </li>
                                        </ul>


                                        <h5 className="font-bold">2. Exclusions from Confidential Information.</h5>
                                        <p>The obligation of confidentiality will not apply if: (a) information becomes publicly known through no fault of yours; (b) received from a third party without breach; (c) disclosed with Company's written permission; (d) independently developed; or (e) legally compelled to disclose (with prior notice).</p>

                                        <h5 className="font-bold">3. Obligation to Maintain Confidentiality.</h5>
                                        <p>You agree to retain Confidential Information in strict confidence and not to disclose it except as permitted. This obligation survives termination.</p>

                                        <h5 className="font-bold">4. Non-Compete.</h5>
                                        <p>You agree not to engage in any business activity competitive with the Company during the relationship and for <strong>24 months</strong> post-termination.</p>

                                        <h5 className="font-bold">5. Non-Solicitation.</h5>
                                        <p>You agree not to solicit any Employee or contractor of the Company during your relationship with the Company.</p>

                                        <h5 className="font-bold">6. Disclaimer.</h5>
                                        <p>There is no representation or warranty, express or implied, made by the Company as to the accuracy or completeness of any of its Confidential Information.</p>

                                        <h5 className="font-bold">7. Remedies.</h5>
                                        <p>You acknowledge that breach will cause irreparable injury. The Company is entitled to equitable or injunctive relief and damages (direct and consequential), including attorney’s fees.</p>

                                        <h5 className="font-bold">8. Notices.</h5>
                                        <p>All notices must be in writing and delivered via recognized methods.</p>

                                        <h5 className="font-bold">9. Termination.</h5>
                                        <p>This Agreement terminates on: (a) written agreement; or (b) 24 months post cessation of employment.</p>

                                        <h5 className="font-bold">10. Amendment.</h5>
                                        <p>Amendments must be in writing signed by both parties.</p>

                                        <h5 className="font-bold">11. Jurisdiction.</h5>
                                        <p>This Agreement will be governed by the <strong>laws of the State of Maharashtra, India</strong>. Exclusive jurisdiction: Courts located in the State of Maharashtra.</p>

                                        <h5 className="font-bold">12. No Offer or Sale.</h5>
                                        <p>Nothing herein is a sale or offer for sale of Confidential Information.</p>

                                        <h5 className="font-bold">13. Miscellaneous.</h5>
                                        <p>No joint venture exists. This binding on successors. Assigned requires consent. Invalidity of one provision does not affect others.</p>

                                        <div className="mt-6 border-t border-amber-300 pt-4">
                                            <p className="font-bold text-center mb-2">IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first written above.</p>
                                            <div className="grid grid-cols-2 gap-4 text-center">
                                                <div>
                                                    <p className="font-bold">Dr Shubham Gadge (Founder & MD)</p>
                                                    <p className="text-[10px]">Livo AarogyaAadhar Private Limited</p>
                                                </div>
                                                <div>
                                                    <p className="font-bold">Candidate / Employee</p>
                                                    <p className="text-[10px]">(Digitally Accepted by Checkbox)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!expandNDA && (
                                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-amber-50 to-transparent pointer-events-none flex items-end justify-center pb-2"></div>
                                )}
                            </div>

                            <button
                                onClick={() => setExpandNDA(!expandNDA)}
                                className="mt-2 text-primary font-bold text-sm hover:underline flex items-center gap-1"
                            >
                                {expandNDA ? "Read Less" : "Read Full Agreement"}
                            </button>
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
            {/* Security Warning Modal */}
            {securityWarning && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col items-center justify-center text-center p-8 animate-fadeIn">
                    <div className="bg-white p-8 rounded-2xl max-w-lg w-full shadow-2xl">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Security Warning</h2>
                        <p className="text-gray-600 mb-6 text-lg">
                            You are not allowed to switch tabs or open new windows during the assessment.
                        </p>
                        <p className="text-sm text-red-500 font-bold mb-8 uppercase tracking-widest">
                            Multiple violations will lead to disqualification.
                        </p>
                        <button
                            onClick={() => setSecurityWarning(false)}
                            className="w-full py-4 bg-red-600 text-white font-bold rounded-xl text-lg hover:bg-red-700 transition shadow-lg"
                        >
                            I Understand, Return to Assessment
                        </button>
                    </div>
                </div>
            )}
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
                                <li>Do not open new tabs or windows while taking the exam otherwise your application will be rejected .</li>
                                <li>Do not refresh the page.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="space-y-8 print:space-y-8">
                    {questions.map((q, idx) => {
                        // Logic to determine Question Type
                        const isRadio = q.type === 'RADIO' || (q.options && q.options.length > 0 && !q.type);
                        const isRadioWithInput = q.type === 'RADIO_WITH_INPUT';
                        const isText = q.type === 'TEXT';

                        return (
                            <div key={q.id || idx} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all print:shadow-none print:border-none print:p-0 break-inside-avoid relative overflow-hidden group">
                                {/* Secure Feel: Side accent */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <h3 className="text-lg font-semibold text-gray-800 mb-6 leading-relaxed print:text-black flex gap-3">
                                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-sm font-bold border border-blue-100 print:bg-transparent print:border-none print:text-black">
                                        {idx + 1}
                                    </span>
                                    <span>{q.text}</span>
                                </h3>

                                {/* 1. RADIO OPTIONS (Standard) */}
                                {isRadio && !isRadioWithInput && (
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row gap-4 print:gap-8">
                                            {q.options.map(opt => (
                                                <div key={opt} className="flex-1">
                                                    <label className={`
                                                        flex items-center justify-center py-3 px-6 rounded-lg cursor-pointer transition-all border w-full
                                                        ${answers[q.id]?.value === opt ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-[1.02]' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}
                                                    `}>
                                                        <input
                                                            type="radio"
                                                            name={q.id}
                                                            value={opt}
                                                            className="hidden"
                                                            onChange={() => handleAnswer(q.id, { value: opt })}
                                                            checked={answers[q.id]?.value === opt}
                                                        />
                                                        {opt}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Conditional Explanation */}
                                        {q.requiresExplanation && answers[q.id]?.value === 'Yes' && (
                                            <div className="mt-4 animate-fadeIn">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {q.explanationLabel || "Please explain:"}
                                                    <span className="text-gray-400 font-normal ml-2">
                                                        (Min {Math.floor((q.wordLimit || 100) / 2)} - Max {q.wordLimit || 100} words)
                                                    </span>
                                                </label>
                                                <div className="relative">
                                                    <textarea
                                                        className={`w-full p-4 bg-gray-50 rounded-lg border focus:ring-2 outline-none transition-all min-h-[100px] text-sm
                                                            ${((answers[q.id]?.explanation || '').trim().split(/\s+/).filter(w => w.length > 0).length || 0) > (q.wordLimit || 100)
                                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                                                : 'border-gray-200 focus:border-primary focus:ring-primary/10'}`}
                                                        placeholder={`Type your explanation here...`}
                                                        onChange={(e) => handleAnswer(q.id, { explanation: e.target.value })}
                                                        value={answers[q.id]?.explanation || ''}
                                                    ></textarea>
                                                    <div className={`absolute bottom-2 right-2 text-[10px] font-bold transition-colors flex gap-1
                                                        ${((answers[q.id]?.explanation || '').trim().split(/\s+/).filter(w => w.length > 0).length || 0) < Math.floor((q.wordLimit || 100) / 2) ? 'text-amber-500' :
                                                            ((answers[q.id]?.explanation || '').trim().split(/\s+/).filter(w => w.length > 0).length || 0) > (q.wordLimit || 100) ? 'text-red-500' : 'text-green-600'}`}>
                                                        <span>Count: {(answers[q.id]?.explanation || '').trim().split(/\s+/).filter(w => w.length > 0).length || 0}</span>
                                                        <span>/ Min: {Math.floor((q.wordLimit || 100) / 2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 2. RADIO WITH INPUT (Bachelor / Other) */}
                                {isRadioWithInput && (
                                    <div className="space-y-3">
                                        {q.options.map(opt => {
                                            const isSelected = answers[q.id]?.value === opt;
                                            const showInput = (opt === 'Bachelor Degree' || opt === 'Other') && isSelected;

                                            return (
                                                <div key={opt} className="w-full transition-all">
                                                    <label className={`
                                                        flex items-center p-3 rounded-lg cursor-pointer border transition-all
                                                        ${isSelected ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}
                                                    `}>
                                                        <input
                                                            type="radio"
                                                            name={q.id}
                                                            value={opt}
                                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                            onChange={() => handleAnswer(q.id, { value: opt })}
                                                            checked={isSelected}
                                                        />
                                                        <span className="ml-3 text-gray-700 font-medium">{opt}</span>
                                                    </label>

                                                    {showInput && (
                                                        <div className="ml-8 mt-2 animate-fadeIn">
                                                            <input
                                                                type="text"
                                                                className="w-full p-2 text-sm border-b-2 border-blue-200 focus:border-blue-500 outline-none bg-transparent transition-colors placeholder:text-gray-400"
                                                                placeholder={opt === 'Bachelor Degree' ? "Please specify your degree..." : "Please specify..."}
                                                                value={answers[q.id]?.detail || ''}
                                                                onChange={(e) => handleAnswer(q.id, { detail: e.target.value })}
                                                                autoFocus
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* 3. TEXT AREA (Descriptive) */}
                                {isText && (
                                    <div className="relative mt-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                            Min {Math.floor((q.wordLimit || 200) / 2)} - Max {q.wordLimit || 200} words required
                                        </label>
                                        <textarea
                                            className={`w-full p-6 bg-white rounded-xl border focus:ring-4 outline-none transition-all min-h-[180px] text-gray-800 placeholder:text-gray-400 font-medium leading-relaxed resize-y spell-check-false shadow-inner
                                                ${((answers[q.id]?.value || '').trim().split(/\s+/).filter(w => w.length > 0).length || 0) > (q.wordLimit || 200)
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                                    : 'border-gray-200 focus:border-primary focus:ring-primary/10'}`}
                                            placeholder={`Type your detailed answer here...`}
                                            onChange={(e) => handleAnswer(q.id, { value: e.target.value })}
                                            value={answers[q.id]?.value || ''}
                                            spellCheck="false"
                                        ></textarea>
                                        <div className={`absolute bottom-4 right-4 text-xs font-bold pointer-events-none transition-colors flex gap-2
                                            ${((answers[q.id]?.value || '').trim().split(/\s+/).filter(w => w.length > 0).length || 0) < Math.floor((q.wordLimit || 200) / 2) ? 'text-amber-500' :
                                                ((answers[q.id]?.value || '').trim().split(/\s+/).filter(w => w.length > 0).length || 0) > (q.wordLimit || 200) ? 'text-red-500' : 'text-green-600'}`}>
                                            <span>Count: {(answers[q.id]?.value || '').trim().split(/\s+/).filter(w => w.length > 0).length || 0}</span>
                                            <span>/ Min: {Math.floor((q.wordLimit || 200) / 2)}</span>
                                        </div>
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
              px-10 py-4 bg-gray-900 text-white rounded-lg font-bold text-lg shadow-xl 
              hover:bg-black hover:shadow-2xl hover:-translate-y-1 transition-all 
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none w-full sm:w-auto
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
