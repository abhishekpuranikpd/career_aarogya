"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ExamSettings({ exam }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Convert UTC from DB to IST string "YYYY-MM-DDThh:mm" for input
    const formatForInput = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        // Get UTC time, add 5.5 hours to get IST time value
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(date.getTime() + istOffset);
        
        return istDate.toISOString().slice(0, 16);
    };

    const [windowStart, setWindowStart] = useState(formatForInput(exam.windowStart));
    const [windowEnd, setWindowEnd] = useState(formatForInput(exam.windowEnd));

    const handleUpdate = async () => {
        setLoading(true);
        try {
            // When saving, we assume the user input IS the IST time.
            // We need to store it such that when it comes back as UTC, it represents this time.
            // Actually, if we want to "store IST", we usually mean storing the timestamp that *corresponds* to that IST time.
            // If user picks 10:00 AM in input, that means 10:00 AM IST.
            // 10:00 AM IST = 4:30 AM UTC.
            // So we need to construct a date that is 10:00 AM IST.
            
            const toISTDate = (isoString) => {
                if (!isoString) return null;
                const date = new Date(isoString); // treats as local if no Z, or UTC if Z. Input is "YYYY-MM-DDThh:mm" (local-ish)
                // We want this string to be treated as IST.
                // So "2026-01-20T10:00" -> 10:00 AM IST.
                // New Date("2026-01-20T10:00+05:30") works.
                return new Date(`${isoString}:00+05:30`);
            };

            const res = await fetch(`/api/exam/${exam.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    windowStart: toISTDate(windowStart),
                    windowEnd: toISTDate(windowEnd)
                })
            });

            if (res.ok) {
                alert("Settings updated successfully!");
                router.refresh();
            } else {
                const err = await res.json();
                alert("Error: " + (err.error || "Failed to update"));
            }
        } catch (e) {
            alert("Error: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8 animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Assessment Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                        Start Date & Time (Window Open)
                    </label>
                    <input 
                        type="datetime-local" 
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-gray-700"
                        value={windowStart}
                        onChange={e => setWindowStart(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                        End Date & Time (Window Close)
                    </label>
                    <input 
                        type="datetime-local" 
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-gray-700"
                        value={windowEnd}
                        onChange={e => setWindowEnd(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <button 
                    onClick={handleUpdate}
                    disabled={loading}
                    className="px-6 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save Settings"}
                </button>
            </div>
        </div>
    );
}
