"use client";

import { useState } from "react";
import { updateResponseScore } from "../actions";
import { CheckIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

export default function ScoreUpdater({ responseId, currentScore }) {
    const [score, setScore] = useState(currentScore || 0);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        await updateResponseScore(responseId, score);
        setLoading(false);
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition"
            >
                Score: {score} <PencilSquareIcon className="w-3.5 h-3.5" />
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
                onClick={handleSave}
                disabled={loading}
                className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
            >
                <CheckIcon className="w-4 h-4" />
            </button>
        </div>
    );
}
