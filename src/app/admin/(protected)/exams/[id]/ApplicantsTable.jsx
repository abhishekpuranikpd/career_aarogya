"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import {
    DocumentTextIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
    BriefcaseIcon,
    FunnelIcon,
    ArrowPathIcon,
    UserIcon
} from "@heroicons/react/24/outline";
import ScoreUpdater from "@/app/admin/components/ScoreUpdater";

export default function ApplicantsTable({
    examId,
    jobPosts = [],
    initialJobPostId = "all",
    updateStatusServerAction
}) {
    // Active Job Post Filter
    const [selectedJobId, setSelectedJobId] = useState(initialJobPostId);

    // Filters and Pagination State
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [scoreFilter, setScoreFilter] = useState("All");
    const [minScore, setMinScore] = useState("");
    const [dateFilter, setDateFilter] = useState("Newest");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);

    // Server Data State
    const [applicants, setApplicants] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset page on new search
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Data Fetcher from Server API
    const fetchApplicants = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                jobPostId: selectedJobId,
                page: String(page),
                limit: String(limit),
                search: debouncedSearch,
                status: statusFilter,
                scoreFilter: scoreFilter,
                dateFilter: dateFilter
            });
            if (minScore !== "") {
                params.set("minScore", minScore);
            }

            const res = await fetch(`/api/admin/exams/${examId}/applicants?${params.toString()}`);
            if (!res.ok) {
                throw new Error("Failed to load applicants");
            }

            const data = await res.json();
            if (data.success) {
                setApplicants(data.applicants || []);
                setTotalCount(data.pagination?.total || 0);
                setTotalPages(data.pagination?.totalPages || 1);
            }
        } catch (err) {
            console.error("Error loading applicants:", err);
        } finally {
            setLoading(false);
        }
    }, [examId, selectedJobId, page, limit, debouncedSearch, statusFilter, scoreFilter, minScore, dateFilter]);

    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    // Format IST Date
    const formatDateIST = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };

    // Update Status Handler
    const handleStatusChange = async (userId, newStatus) => {
        // Optimistic UI update
        setApplicants(prev => prev.map(item => {
            if (item.user.id === userId) {
                return { ...item, user: { ...item.user, examStatus: newStatus } };
            }
            return item;
        }));

        try {
            if (updateStatusServerAction) {
                await updateStatusServerAction(userId, newStatus, examId);
            } else {
                await fetch(`/api/admin/users/${userId}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: newStatus })
                });
            }
        } catch (e) {
            console.error("Failed to update status:", e);
            fetchApplicants(); // Rollback on failure
        }
    };

    const activeJobObj = jobPosts.find(j => j.id === selectedJobId) || jobPosts[0];

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-12">
            {/* Header & Job Filter Navigation */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-b from-gray-50/80 to-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <BriefcaseIcon className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold text-gray-900">
                                {selectedJobId === "all" ? "All Exam Applicants" : activeJobObj?.title || "Job Applicants"}
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                {totalCount.toLocaleString()} {totalCount === 1 ? 'applicant' : 'applicants'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {selectedJobId === "all" 
                                ? "Displaying candidates across all careers linked with this exam."
                                : `Filtered specifically for job: ${activeJobObj?.title}`}
                        </p>
                    </div>

                    {/* Export Action */}
                    <a
                        href={`/api/admin/exams/${examId}/export?jobPostId=${selectedJobId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-sm text-xs self-start md:self-auto"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Export {selectedJobId === "all" ? "All" : "Job"} CSV
                    </a>
                </div>

                {/* Job Post Selection Tabs (Optimized Filter) */}
                {jobPosts.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap mr-1">
                            Filter Job:
                        </span>
                        {jobPosts.map(jp => {
                            const isSelected = selectedJobId === jp.id;
                            return (
                                <button
                                    key={jp.id}
                                    onClick={() => {
                                        setSelectedJobId(jp.id);
                                        setPage(1);
                                    }}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border ${
                                        isSelected
                                            ? "bg-primary text-white border-primary shadow-sm"
                                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                                    }`}
                                >
                                    <span>{jp.title}</span>
                                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${
                                        isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                                    }`}>
                                        {jp.count !== undefined ? jp.count : ""}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Filter Controls Bar */}
            <div className="p-4 bg-gray-50/60 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search name, email, mobile, ref ID..."
                            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="text-xs border border-gray-300 px-3 py-2 rounded-xl bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="All">All Statuses</option>
                        <option value="PENDING">PENDING</option>
                        <option value="PASSED">PASSED</option>
                        <option value="FAILED">FAILED</option>
                        <option value="INTERVIEW">INTERVIEW</option>
                        <option value="HIRED">HIRED</option>
                        <option value="REJECTED">REJECTED</option>
                    </select>

                    {/* Score Order */}
                    <select
                        value={scoreFilter}
                        onChange={(e) => { setScoreFilter(e.target.value); setPage(1); }}
                        className="text-xs border border-gray-300 px-3 py-2 rounded-xl bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="All">Score: Default</option>
                        <option value="HighLow">Score: Highest First</option>
                        <option value="LowHigh">Score: Lowest First</option>
                    </select>

                    {/* Min Score Input */}
                    <div className="flex items-center gap-1.5">
                        <input
                            type="number"
                            placeholder="Min Score"
                            value={minScore}
                            onChange={(e) => { setMinScore(e.target.value); setPage(1); }}
                            className="w-20 text-xs border border-gray-300 px-2.5 py-2 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Date Sort */}
                    <select
                        value={dateFilter}
                        onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                        className="text-xs border border-gray-300 px-3 py-2 rounded-xl bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="Newest">Newest First</option>
                        <option value="Oldest">Oldest First</option>
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    {/* Items Per Page */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span>Show</span>
                        <select
                            value={limit}
                            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                            className="border border-gray-300 px-2 py-1.5 rounded-lg bg-white font-bold text-gray-700"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={() => fetchApplicants()}
                        disabled={loading}
                        title="Refresh List"
                        className="p-2 border border-gray-300 rounded-xl bg-white hover:bg-gray-100 transition text-gray-600 disabled:opacity-50"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Table Area with Loading Overlay */}
            <div className="relative overflow-x-auto min-h-[300px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-white shadow-xl rounded-2xl border border-gray-200">
                            <ArrowPathIcon className="w-5 h-5 text-primary animate-spin" />
                            <span className="text-sm font-bold text-gray-700">Loading applicants...</span>
                        </div>
                    </div>
                )}

                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50/80 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                        <tr>
                            <th className="p-4">Candidate Details</th>
                            <th className="p-4">Applied Career</th>
                            <th className="p-4 text-center">Score</th>
                            <th className="p-4">Exam Status</th>
                            <th className="p-4">Submitted At (IST)</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {applicants.length > 0 ? (
                            applicants.map((r) => (
                                <tr key={r.id} className="hover:bg-blue-50/30 transition group">
                                    {/* Candidate Details */}
                                    <td className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                                                {r.user?.name ? r.user.name[0].toUpperCase() : "U"}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Link 
                                                        href={`/admin/users/${r.user.id}`}
                                                        className="font-bold text-gray-900 hover:text-primary hover:underline"
                                                    >
                                                        {r.user.name || "Unnamed Candidate"}
                                                    </Link>
                                                    {r.user.referenceId && (
                                                        <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                                                            {r.user.referenceId}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">{r.user.email}</div>
                                                {r.user.mobile && (
                                                    <div className="text-xs text-gray-400 font-mono mt-0.5">{r.user.mobile}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Applied Job */}
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-800 text-xs">
                                            {r.user.jobPost?.title || "No Job Assigned"}
                                        </div>
                                        {r.user.jobPostId && (
                                            <span className="text-[10px] text-gray-400 font-mono">
                                                ID: {r.user.jobPostId}
                                            </span>
                                        )}
                                    </td>

                                    {/* Score */}
                                    <td className="p-4 text-center">
                                        <div className="inline-block">
                                            <ScoreUpdater
                                                responseId={r.id}
                                                currentScore={r.score}
                                            />
                                        </div>
                                    </td>

                                    {/* Status Updater */}
                                    <td className="p-4">
                                        <select
                                            value={r.user.examStatus || "PENDING"}
                                            onChange={(e) => handleStatusChange(r.user.id, e.target.value)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 outline-none transition-all shadow-sm ${
                                                r.user.examStatus === 'PASSED' ? 'bg-green-100 text-green-700 focus:ring-green-500' :
                                                r.user.examStatus === 'FAILED' ? 'bg-red-100 text-red-700 focus:ring-red-500' :
                                                r.user.examStatus === 'INTERVIEW' ? 'bg-purple-100 text-purple-700 focus:ring-purple-500' :
                                                r.user.examStatus === 'HIRED' ? 'bg-blue-100 text-blue-700 focus:ring-blue-500' :
                                                r.user.examStatus === 'REJECTED' ? 'bg-gray-200 text-gray-700 focus:ring-gray-500' :
                                                'bg-yellow-100 text-yellow-700 focus:ring-yellow-500'
                                            }`}
                                        >
                                            <option value="PENDING">PENDING</option>
                                            <option value="PASSED">PASSED</option>
                                            <option value="FAILED">FAILED</option>
                                            <option value="INTERVIEW">INTERVIEW</option>
                                            <option value="HIRED">HIRED</option>
                                            <option value="REJECTED">REJECTED</option>
                                        </select>
                                    </td>

                                    {/* Submitted At */}
                                    <td className="p-4 text-xs font-medium text-gray-500 whitespace-nowrap">
                                        {formatDateIST(r.submittedAt)}
                                    </td>

                                    {/* Actions */}
                                    <td className="p-4 text-right whitespace-nowrap">
                                        <Link
                                            href={`/admin/users/${r.user.id}`}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition"
                                        >
                                            <UserIcon className="w-3.5 h-3.5" />
                                            View Profile
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-gray-400">
                                    <DocumentTextIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                                    <p className="font-semibold text-gray-600">No applicants found</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Try adjusting your search terms or filters above.
                                    </p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Standard Senior-Developer Server Pagination */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
                <div>
                    Showing{" "}
                    <span className="font-bold text-gray-900">
                        {totalCount === 0 ? 0 : (page - 1) * limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold text-gray-900">
                        {Math.min(page * limit, totalCount)}
                    </span>{" "}
                    of <span className="font-bold text-gray-900">{totalCount.toLocaleString()}</span> applicants
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center gap-1.5">
                        {/* First Page */}
                        <button
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                            title="First Page"
                            className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition"
                        >
                            <ChevronDoubleLeftIcon className="w-4 h-4" />
                        </button>

                        {/* Prev Page */}
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            title="Previous Page"
                            className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition"
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                        </button>

                        {/* Current Page Display */}
                        <span className="px-3 py-1 font-bold text-gray-800 bg-white rounded-lg border border-gray-200">
                            Page {page} of {totalPages}
                        </span>

                        {/* Next Page */}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            title="Next Page"
                            className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition"
                        >
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>

                        {/* Last Page */}
                        <button
                            onClick={() => setPage(totalPages)}
                            disabled={page >= totalPages}
                            title="Last Page"
                            className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition"
                        >
                            <ChevronDoubleRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
