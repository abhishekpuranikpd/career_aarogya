"use client";

import { useState } from "react";
import Link from "next/link";
import {
    DocumentTextIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

const ITEMS_PER_PAGE = 10;

export default function ApplicantsTable({
    responses = [],
    updateStatusServerAction
}) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [page, setPage] = useState(1);

    // Filter
    const filteredResponses = responses.filter(r => {
        const nameMatch = r.user.name.toLowerCase().includes(search.toLowerCase());
        const emailMatch = r.user.email.toLowerCase().includes(search.toLowerCase());
        const matchesSearch = nameMatch || emailMatch;

        const matchesStatus = statusFilter === "All" || r.user.examStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Paginate
    const totalPages = Math.ceil(filteredResponses.length / ITEMS_PER_PAGE);
    const paginatedResponses = filteredResponses.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    // Status Updater Component (embedded to use props cleanly)
    const StatusSelect = ({ userId, currentStatus }) => {
        return (
            <select
                value={currentStatus}
                onChange={async (e) => {
                    // Optimistic or simple reload? 
                    // Since we passed a bound server action, we can call it.
                    if (updateStatusServerAction) {
                        await updateStatusServerAction(userId, e.target.value);
                    }
                }}
                className={`px-2 py-1 rounded-full text-xs font-bold border-none outline-none cursor-pointer ${currentStatus === 'PASSED' ? 'bg-green-100 text-green-700' :
                        currentStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                            currentStatus === 'INTERVIEW' ? 'bg-purple-100 text-purple-700' :
                                currentStatus === 'HIRED' ? 'bg-blue-100 text-blue-700' :
                                    currentStatus === 'REJECTED' ? 'bg-gray-200 text-gray-700' :
                                        'bg-yellow-100 text-yellow-700'
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
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-64">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search applicant..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm text-gray-500 font-medium">Filter Status:</span>
                    <select
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none bg-white"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="All">All</option>
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
                            <th className="p-4 font-semibold text-gray-600 w-32">Date</th>
                            <th className="p-4 font-semibold text-gray-600">Applicant</th>
                            <th className="p-4 font-semibold text-gray-600">Email</th>
                            <th className="p-4 font-semibold text-gray-600">Current Status</th>
                            <th className="p-4 font-semibold text-gray-600">Resume</th>
                            <th className="p-4 font-semibold text-gray-600 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {paginatedResponses.map(response => (
                            <tr key={response.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-sm text-gray-500">{new Date(response.submittedAt).toLocaleDateString()}</td>
                                <td className="p-4 font-medium text-gray-900">{response.user.name}</td>
                                <td className="p-4 text-gray-600 text-sm">{response.user.email}</td>
                                <td className="p-4">
                                    <StatusSelect
                                        userId={response.user.id}
                                        currentStatus={response.user.examStatus}
                                    />
                                </td>
                                <td className="p-4">
                                    {response.user.resumeUrl ? (
                                        <a href={response.user.resumeUrl} target="_blank" className="flex items-center gap-1 text-primary hover:underline text-sm font-medium">
                                            <DocumentTextIcon className="w-4 h-4" /> View PDF
                                        </a>
                                    ) : (
                                        <span className="text-gray-400 text-sm">N/A</span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <Link href={`/admin/users/${response.user.id}`} className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                        View Answers
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
            {totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                        <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="text-sm text-gray-600 font-medium">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                        <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            )}
        </div>
    );
}
