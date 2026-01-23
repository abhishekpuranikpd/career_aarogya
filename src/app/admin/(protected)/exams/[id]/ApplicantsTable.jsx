"use client";

import { useState } from "react";
import Link from "next/link";
import {
    DocumentTextIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

export default function ApplicantsTable({
    responses = [],
    updateStatusServerAction
}) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [scoreFilter, setScoreFilter] = useState("All"); // NEW: Score Filter
    const [minScore, setMinScore] = useState(""); // NEW: Min Score Filter
    const [dateFilter, setDateFilter] = useState("All"); // NEW: Date Filter (Newest/Oldest)
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // NEW: Items per page

    // Filter & Sort
    const filteredResponses = responses.filter(r => {
        const nameMatch = r.user.name.toLowerCase().includes(search.toLowerCase());
        const emailMatch = r.user.email.toLowerCase().includes(search.toLowerCase());
        const matchesSearch = nameMatch || emailMatch;

        const matchesStatus = statusFilter === "All" || r.user.examStatus === statusFilter;

        // Min Score Filter
        const score = r.score !== null ? r.score : 0;
        const matchesScore = minScore === "" || score >= Number(minScore);

        return matchesSearch && matchesStatus && matchesScore;
    }).sort((a, b) => {
        // Sort by Date
        if (dateFilter === "Oldest") {
            const dateA = new Date(a.submittedAt).getTime();
            const dateB = new Date(b.submittedAt).getTime();
            if (dateA !== dateB) return dateA - dateB;
        } else {
            // Default Newest
            const dateA = new Date(a.submittedAt).getTime();
            const dateB = new Date(b.submittedAt).getTime();
            if (dateA !== dateB) return dateB - dateA;
        }

        // Sort by Score
        if (scoreFilter !== "All") {
            const scoreA = a.score || 0;
            const scoreB = b.score || 0;
            if (scoreFilter === "HighLow") return scoreB - scoreA;
            if (scoreFilter === "LowHigh") return scoreA - scoreB;
        }

        return 0;
    });

    // Paginate
    const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
    const paginatedResponses = filteredResponses.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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

    // Status Updater Component
    const StatusSelect = ({ userId, currentStatus }) => {
        return (
            <select
                value={currentStatus}
                onChange={async (e) => {
                    if (updateStatusServerAction) {
                        await updateStatusServerAction(userId, e.target.value);
                    }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 outline-none transition-all ${currentStatus === 'PASSED' ? 'bg-green-100 text-green-700 focus:ring-green-500' :
                    currentStatus === 'FAILED' ? 'bg-red-100 text-red-700 focus:ring-red-500' :
                        currentStatus === 'INTERVIEW' ? 'bg-purple-100 text-purple-700 focus:ring-purple-500' :
                            currentStatus === 'HIRED' ? 'bg-blue-100 text-blue-700 focus:ring-blue-500' :
                                currentStatus === 'REJECTED' ? 'bg-gray-200 text-gray-700 focus:ring-gray-500' :
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
        );
    };

    return (
        <div className="bg-white rounded-xl shadow overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                <div className="relative w-full xl:w-72">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search applicant..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">


                    {/* Date Filter */}
                    <select
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none bg-white min-w-[130px]"
                        value={dateFilter}
                        onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                    >
                        <option value="Newest">Newest First</option>
                        <option value="Oldest">Oldest First</option>
                    </select>

                    {/* Score Filter */}
                    <select
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none bg-white min-w-[130px]"
                        value={scoreFilter}
                        onChange={(e) => { setScoreFilter(e.target.value); setPage(1); }}
                    >
                        <option value="All">All Scores</option>
                        <option value="HighLow">High to Low</option>
                        <option value="LowHigh">Low to High</option>
                    </select>

                    {/* Min Score Input */}
                    <input
                        type="number"
                        placeholder="Min Score"
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none bg-white w-24"
                        value={minScore}
                        onChange={(e) => { setMinScore(e.target.value); setPage(1); }}
                    />

                    {/* Status Filter */}
                    <select
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none bg-white min-w-[120px]"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="All">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="PASSED">Passed</option>
                        <option value="FAILED">Failed</option>
                        <option value="INTERVIEW">Interview</option>
                        <option value="HIRED">Hired</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600 w-40">Submitted (IST)</th>
                            <th className="p-4 font-semibold text-gray-600">Applicant</th>
                            <th className="p-4 font-semibold text-gray-600">Score</th>
                            <th className="p-4 font-semibold text-gray-600">Current Status</th>
                            <th className="p-4 font-semibold text-gray-600">Resume</th>
                            <th className="p-4 font-semibold text-gray-600 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {paginatedResponses.map(response => (
                            <tr key={response.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-xs text-gray-500 font-medium whitespace-nowrap">
                                    {formatDateIST(response.submittedAt)}
                                </td>
                                <td className="p-4">
                                    <div className="font-medium text-gray-900">{response.user.name}</div>
                                    <div className="text-xs text-gray-500">{response.user.email}</div>
                                </td>
                                <td className="p-4 text-sm font-semibold text-gray-700">
                                    {response.score !== null ? response.score : "-"}
                                </td>

                                <td className="p-4">
                                    <StatusSelect
                                        userId={response.user.id}
                                        currentStatus={response.user.examStatus}
                                    />
                                </td>
                                <td className="p-4">
                                    {response.user.resumeUrl ? (
                                        <a href={response.user.resumeUrl} target="_blank" className="flex items-center gap-1 text-primary hover:underline text-xs font-medium">
                                            <DocumentTextIcon className="w-3.5 h-3.5" /> Resume
                                        </a>
                                    ) : (
                                        <span className="text-gray-400 text-xs">N/A</span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <Link href={`/admin/users/${response.user.id}`} className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                        View Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {paginatedResponses.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-12 text-center text-gray-500 bg-gray-50/50">
                                    No applicants found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Rows per page:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setPage(1);
                        }}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-primary focus:border-primary"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 hidden sm:inline mr-2">
                            Page {page} of {totalPages}
                        </span>
                        <div className="flex rounded-md shadow-sm">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-white focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-white focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
