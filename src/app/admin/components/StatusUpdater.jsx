"use client";

import { useState } from "react";
import { updateUserStatus } from "../actions";

export default function StatusUpdater({ userId, currentStatus }) {
    const [status, setStatus] = useState(currentStatus);
    const [loading, setLoading] = useState(false);

    const handleChange = async (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        setLoading(true);
        await updateUserStatus(userId, newStatus);
        setLoading(false);
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <select
                value={status}
                onChange={handleChange}
                disabled={loading}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 outline-none transition-all ${status === "PASSED"
                        ? "bg-green-100 text-green-700 focus:ring-green-500"
                        : status === "FAILED"
                            ? "bg-red-100 text-red-700 focus:ring-red-500"
                            : status === "INTERVIEW"
                                ? "bg-purple-100 text-purple-700 focus:ring-purple-500"
                                : status === "HIRED"
                                    ? "bg-blue-100 text-blue-700 focus:ring-blue-500"
                                    : status === "REJECTED"
                                        ? "bg-gray-200 text-gray-700 focus:ring-gray-500"
                                        : "bg-yellow-100 text-yellow-700 focus:ring-yellow-500"
                    }`}
            >
                <option value="PENDING">PENDING</option>
                <option value="PASSED">PASSED</option>
                <option value="FAILED">FAILED</option>
                <option value="INTERVIEW">INTERVIEW</option>
                <option value="HIRED">HIRED</option>
                <option value="REJECTED">REJECTED</option>
            </select>
        </div>
    );
}
