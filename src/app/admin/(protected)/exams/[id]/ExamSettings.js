"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ExamSettings({ exam }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Initialize dates (convert ISO strings to YYYY-MM-DDTHH:mm for input)
    const formatForInput = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        // Adjust for timezone offset to show local time in input properly
        // Or simpler: just use substring if it is ISO. But DB stores UTC usually.
        // datetime-local expects "YYYY-MM-DDThh:mm" in local time.
        // Let's use a simple util to format local.
        const pad = (n) => n < 10 ? '0' + n : n;
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const [windowStart, setWindowStart] = useState(formatForInput(exam.windowStart));
    const [windowEnd, setWindowEnd] = useState(formatForInput(exam.windowEnd));

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/exam/${exam.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    windowStart: windowStart || null,
                    windowEnd: windowEnd || null
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
