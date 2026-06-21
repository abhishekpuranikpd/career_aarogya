import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPinIcon, CurrencyRupeeIcon, BriefcaseIcon, CalendarIcon, ShareIcon } from "@heroicons/react/24/outline";
import ShareButtons from "./share-buttons"; // Client component
import ApplyButton from "./apply-button";

export const dynamic = 'force-dynamic';

function formatDate(date) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

async function getJob(id) {
    const job = await prisma.jobPost.findUnique({
        where: { id },
        include: { exam: true }
    });
    return job;
}

export default async function JobDetailsPage({ params }) {
    // Unwrap params safely
    const { id } = await params;

    const job = await getJob(id);

    if (!job) notFound();

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Hero / Cover */}
            <div className="relative h-[450px] md:h-[500px] bg-gray-900 group cursor-pointer">
                {job.imageUrl ? (
                    <a href={job.imageUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-0">
                        <Image src={job.imageUrl} alt={job.title} fill className="object-cover opacity-60" priority />
                    </a>
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-900 to-blue-600 opacity-90 absolute inset-0 z-0"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-0"></div>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white z-10 pointer-events-none">
                    <div className="container mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                            <div className="pointer-events-auto">
                                <span className="bg-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
                                    {job.type || 'Opening'}
                                </span>
                                <h1 className="text-4xl md:text-5xl font-bold mb-4">{job.title}</h1>
                                <div className="flex flex-wrap gap-6 text-sm md:text-base opacity-90">
                                    <span className="flex items-center gap-2"><MapPinIcon className="w-5 h-5" /> {job.location || 'Remote'}</span>
                                    {job.salary && <span className="flex items-center gap-2"><CurrencyRupeeIcon className="w-5 h-5" /> {job.salary}</span>}
                                    <span className="flex items-center gap-2"><CalendarIcon className="w-5 h-5" /> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-4 items-center pointer-events-auto">
                                <div className="w-[180px]">
                                    <ApplyButton jobId={job.id} jobTitle={job.title} />
                                </div>
                                <ShareButtons title={job.title} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 grid md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-8">
                    <div className="prose prose-lg max-w-none text-gray-600">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">About this Role</h2>
                        <div className="whitespace-pre-wrap leading-relaxed">
                            {job.description}
                        </div>
                    </div>

                    {job.applicationProcess ? (
                        <div className="bg-purple-50 p-8 rounded-2xl border border-purple-100 mt-12 overflow-hidden prose prose-purple max-w-none">
                            <h3 className="text-xl font-bold text-purple-900 mb-4">Application Process</h3>
                            <div 
                                className="text-purple-800"
                                dangerouslySetInnerHTML={{ __html: job.applicationProcess }}
                            />
                        </div>
                    ) : (
                        <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100 mt-12">
                            <h3 className="text-xl font-bold text-blue-900 mb-4">Steps to Apply</h3>
                            <ol className="list-decimal list-inside space-y-3 text-blue-800">
                                <li>Click the <strong>Apply Now</strong> button.</li>
                                <li>Fill in your personal details and upload your resume.</li>
                                <li>You will be redirected to the <strong>{job.exam?.title || 'Online Assessment'}</strong>.</li>
                                <li>Complete the assessment to finalize your application.</li>
                            </ol>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 sticky top-24">
                        <h3 className="font-bold text-gray-900 mb-4">Job Overview</h3>
                        <ul className="space-y-4 text-sm text-gray-600 mb-6">
                            <li className="flex justify-between border-b pb-2">
                                <span>Type</span>
                                <span className="font-medium text-gray-900">{job.type}</span>
                            </li>
                            <li className="flex justify-between border-b pb-2">
                                <span>Location</span>
                                <span className="font-medium text-gray-900">{job.location}</span>
                            </li>
                            <li className="flex justify-between border-b pb-2">
                                <span>Date Posted</span>
                                <span className="font-medium text-gray-900">{new Date(job.createdAt).toLocaleDateString('en-IN')}</span>
                            </li>
                        </ul>

                        {/* Important Dates */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-3 mb-6">
                            <h2 className="font-bold text-gray-900 text-sm border-b pb-2 flex items-center gap-2">
                                📅 Important Dates
                            </h2>
                            <div className="space-y-2.5">
                                {job.applicationStartDate && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Application Starts</span>
                                        <span className="font-semibold text-gray-900">{formatDate(job.applicationStartDate)}</span>
                                    </div>
                                )}
                                {job.examStartDate && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Assessment Date</span>
                                        <span className="font-semibold text-gray-900">{formatDate(job.examStartDate)}</span>
                                    </div>
                                )}
                                {job.resultDate && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Result Release</span>
                                        <span className="font-semibold text-gray-900">{formatDate(job.resultDate)}</span>
                                    </div>
                                )}
                                {job.inductionDate && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Induction</span>
                                        <span className="font-semibold text-blue-600">{formatDate(job.inductionDate)}</span>
                                    </div>
                                )}
                                {job.joiningDate && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Joining Date</span>
                                        <span className="font-semibold text-green-600">{formatDate(job.joiningDate)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            {job.responsibilitiesPdf && (
                                <a
                                    href={job.responsibilitiesPdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                    Job Responsibilities
                                </a>
                            )}
                            <ApplyButton jobId={job.id} jobTitle={job.title} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
