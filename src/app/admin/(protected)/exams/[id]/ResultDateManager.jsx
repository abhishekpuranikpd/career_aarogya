"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDaysIcon, CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function ResultDateManager({ linkedJobs = [], examId }) {
    const router = useRouter();
    const [selectedJobId, setSelectedJobId] = useState(linkedJobs[0]?.id || "");
    const [loadingJobId, setLoadingJobId] = useState(null);
    const [statusMsg, setStatusMsg] = useState("");

    // Helper to format Date to datetime-local IST
    const toInputFormat = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        // Add 5.5 hours for IST
        const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
        return istDate.toISOString().slice(0, 16);
    };

    // State of result dates keyed by jobId
    const [dates, setDates] = useState(() => {
        const initial = {};
        linkedJobs.forEach(job => {
            initial[job.id] = toInputFormat(job.resultDate);
        });
        return initial;
    });

    const handleSaveDate = async (jobId, explicitDate = null) => {
        setLoadingJobId(jobId);
        setStatusMsg("");
        try {
            const rawValue = explicitDate !== null ? explicitDate : dates[jobId];
            let isoDate = null;
            if (rawValue) {
                // Parse IST string to ISO Date
                isoDate = new Date(`${rawValue}:00+05:30`).toISOString();
            }

            const res = await fetch(`/api/admin/jobs/${jobId}/result-date`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resultDate: isoDate })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to update result date");
            }

            setStatusMsg(`Result date successfully updated!`);
            setTimeout(() => setStatusMsg(""), 4000);
            router.refresh();
        } catch (error) {
            alert(error.message);
        } finally {
            setLoadingJobId(null);
        }
    };

    const handlePublishNow = async (jobId) => {
        // Set to current time in IST
        const now = new Date();
        const istNow = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)).toISOString().slice(0, 16);
        setDates(prev => ({ ...prev, [jobId]: istNow }));
        await handleSaveDate(jobId, istNow);
    };

    const handleClearDate = async (jobId) => {
        if (!confirm("Are you sure you want to clear the result date for this job?")) return;
        setDates(prev => ({ ...prev, [jobId]: "" }));
        await handleSaveDate(jobId, "");
    };

    if (!linkedJobs || linkedJobs.length === 0) {
        return null;
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b pb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <CalendarDaysIcon className="w-5 h-5 text-primary" />
                        Candidate Result Showcase & Declaration Date
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Control when exam scores and selection results become visible on applicants' dashboards.
                    </p>
                </div>
                {statusMsg && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200">
                        <CheckCircleIcon className="w-4 h-4" /> {statusMsg}
                    </span>
                )}
            </div>

            <div className="space-y-4">
                {linkedJobs.map((job) => {
                    const isSaving = loadingJobId === job.id;
                    const currentValue = dates[job.id] || "";
                    const isDeclared = job.resultDate && new Date() >= new Date(job.resultDate);

                    return (
                        <div key={job.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-white transition flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-gray-900 text-sm">{job.title}</h4>
                                    {job.resultDate ? (
                                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                            isDeclared ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            {isDeclared ? 'Active / Visible' : 'Scheduled Future Date'}
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-600">
                                            Not Scheduled
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Job ID: <span className="font-mono">{job.id}</span>
                                    {job.resultDate && (
                                        <span className="ml-3 font-semibold text-gray-700">
                                            Current: {new Date(job.resultDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST
                                        </span>
                                    )}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold text-gray-500 whitespace-nowrap">Showcase Date (IST):</label>
                                    <input
                                        type="datetime-local"
                                        className="text-xs border border-gray-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        value={currentValue}
                                        onChange={(e) => setDates({ ...dates, [job.id]: e.target.value })}
                                    />
                                </div>

                                <button
                                    onClick={() => handleSaveDate(job.id)}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {isSaving ? "Saving..." : "Save Date"}
                                </button>

                                <button
                                    onClick={() => handlePublishNow(job.id)}
                                    disabled={isSaving}
                                    title="Make results visible immediately to all applicants"
                                    className="px-3 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition flex items-center gap-1 shadow-sm disabled:opacity-50"
                                >
                                    <SparklesIcon className="w-3.5 h-3.5" /> Publish Now
                                </button>

                                {job.resultDate && (
                                    <button
                                        onClick={() => handleClearDate(job.id)}
                                        disabled={isSaving}
                                        className="px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
