import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPinIcon, CurrencyRupeeIcon, BriefcaseIcon, CalendarIcon, ShareIcon } from "@heroicons/react/24/outline";
import ShareButtons from "./share-buttons"; // Client component
import ApplyButton from "./apply-button";

export const dynamic = 'force-dynamic';

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
            <div className="relative h-[300px] md:h-[400px] bg-gray-900">
                {job.imageUrl ? (
                    <Image src={job.imageUrl} alt={job.title} fill className="object-cover opacity-60" priority />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-900 to-blue-600 opacity-90"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white">
                    <div className="container mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                            <div>
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

                            <div className="flex gap-4 items-center">
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

                    <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100 mt-12">
                        <h3 className="text-xl font-bold text-blue-900 mb-4">Steps to Apply</h3>
                        <ol className="list-decimal list-inside space-y-3 text-blue-800">
                            <li>Click the <strong>Apply Now</strong> button.</li>
                            <li>Fill in your personal details and upload your resume.</li>
                            <li>You will be redirected to the <strong>{job.exam?.title || 'Online Assessment'}</strong>.</li>
                            <li>Complete the assessment to finalize your application.</li>
                        </ol>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Sidebar content like "Similar Jobs" or "Perks" could go here */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 sticky top-24">
                        <h3 className="font-bold text-gray-900 mb-4">Job Overview</h3>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li className="flex justify-between border-b pb-2">
                                <span>Type</span>
                                <span className="font-medium text-gray-900">{job.type}</span>
                            </li>
                            <li className="flex justify-between border-b pb-2">
                                <span>Location</span>
                                <span className="font-medium text-gray-900">{job.location}</span>
                            </li>
                            <li className="flex justify-between pb-2">
                                <span>Date Posted</span>
                                <span className="font-medium text-gray-900">{new Date(job.createdAt).toLocaleDateString()}</span>
                            </li>
                        </ul>

                        <div className="mt-6">
                            <ApplyButton jobId={job.id} jobTitle={job.title} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
