"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function BackButton({ label = "Back" }) {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition"
        >
            <ArrowLeftIcon className="w-4 h-4" /> {label}
        </button>
    );
}
