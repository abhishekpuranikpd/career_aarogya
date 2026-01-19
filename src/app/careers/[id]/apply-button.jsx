"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplyButton({ jobId, jobTitle }) {
    const { data: session } = useSession();
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const router = useRouter();

    const isAppliedToThis = session?.user?.jobPostId === jobId;
    const hasActiveApplication = session?.user?.jobPostId && !isAppliedToThis;

    const handleApply = async () => {
        setApplying(true);
        try {
            const res = await fetch("/api/jobs/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobPostId: jobId,
                    position: jobTitle
                })
            });

            const data = await res.json();

            if (res.ok) {
                setApplied(true);
                router.refresh();
                // Force reload/sign-in to update session with new jobPostId? 
                // Alternatively, just rely on UI state for now.
                window.location.href = "/dashboard"; // Redirect to dashboard to take exam
            } else {
                alert(data.error || "Failed to apply");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to apply");
        } finally {
            setApplying(false);
        }
    };

    // If applied (state or previously), show "Take Assessment" or "Applied"
    // Note: For full persistence, we'd check user.jobPostId from session or DB, 
    // but for this interaction, local state + session check is a good start.

    if (session) {
        if (applied || isAppliedToThis) {
            return (
                <div className="flex flex-col gap-2 w-full">
                    <div className="p-3 bg-green-100 text-green-700 rounded-lg text-center font-bold">
                        Already Applied
                    </div>
                    <Link href="/dashboard" className="block w-full px-8 py-3 bg-primary text-white font-bold rounded-lg text-center shadow hover:bg-blue-700 transition">
                        Go to Dashboard
                    </Link>
                </div>
            )
        }

        if (hasActiveApplication) {
            return (
                <div className="flex flex-col gap-2 w-full">
                    <div className="p-3 bg-amber-100 text-amber-800 rounded-lg text-center text-sm font-medium">
                        You have another active application.
                    </div>
                    <Link href="/dashboard" className="block w-full px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg text-center hover:bg-gray-50 transition">
                        Check Status
                    </Link>
                </div>
            )
        }

        return (
            <button
                onClick={handleApply}
                disabled={applying}
                className="block w-full px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-blue-700 transition shadow-lg text-lg text-center min-w-[160px] disabled:opacity-70"
            >
                {applying ? "Applying..." : "Apply Now"}
            </button>
        );
    }

    // Guest User
    return (
        <Link
            href={`/register?jobId=${jobId}&title=${encodeURIComponent(jobTitle)}`}
            className="block w-full px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-blue-50 transition shadow-lg text-lg text-center min-w-[160px]"
        >
            Apply Now
        </Link>
    );
}
