import Link from "next/link";

export default function LegalPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-primary/5 px-8 py-10 border-b border-primary/10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Legal, Privacy & Terms</h1>
                    <p className="text-gray-600">Last Updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="p-8 space-y-12">

                    {/* 1. Privacy Policy */}
                    <section id="privacy">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                            Privacy Policy
                        </h2>
                        <div className="prose text-gray-600 space-y-4">
                            <p>At Aarogya Aadhar, we are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data.</p>
                            <h3 className="font-semibold text-gray-800">Data Collection</h3>
                            <p>We collect information you provide directly to us, such as your name, email address, phone number, and resume when you apply for a position. We also collect data regarding your performance in our assessments.</p>
                            <h3 className="font-semibold text-gray-800">Use of Information</h3>
                            <p>Your data is used solely for recruitment and employment purposes. We do not sell your personal information to third parties.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* 2. Terms and Conditions */}
                    <section id="terms">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                            Terms and Conditions
                        </h2>
                        <div className="prose text-gray-600 space-y-4">
                            <p>By accessing and using the Aarogya Aadhar Career Portal, you agree to comply with these terms.</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>You must provide accurate and complete information during registration.</li>
                                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                                <li>Any attempt to manipulate assessment results or engage in fraudulent activity will result in immediate disqualification.</li>
                            </ul>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* 3. Non-Disclosure Agreement (NDA) */}
                    <section id="nda" className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                        <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-amber-600">
                                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                            </svg>
                            Non-Disclosure Agreement (NDA)
                        </h2>
                        <div className="prose text-gray-700 space-y-4">
                            <p className="font-medium">Confidentiality of Assessment Materials</p>
                            <p>As an applicant ("Recipient") of Aarogya Aadhar ("Discloser"), you acknowledge that during the recruitment process, you may be exposed to confidential information, including but not limited to:</p>
                            <ul className="list-disc pl-5 space-y-2 text-sm">
                                <li>Assessment questions, scenarios, and case studies.</li>
                                <li>Technical challenges and proprietary coding problems.</li>
                                <li>Internal business logic or operational details revealed during interviews.</li>
                            </ul>
                            <p className="font-bold mt-4">Agreement:</p>
                            <p>You agree NOT to copy, reproduce, photograph, share, distribute, or discuss any part of the assessment content on any platform (including social media, GitHub, blogs, or forums). Violation of this agreement may result in legal action and permanent blacklisting from future opportunities at Aarogya Aadhar.</p>
                        </div>
                    </section>
                </div>
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-center">
                    <Link href="/" className="text-primary font-medium hover:underline">Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
