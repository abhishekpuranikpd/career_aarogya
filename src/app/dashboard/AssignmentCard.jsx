"use client";

import { useState } from "react";
import {
  FilmIcon,
  PhotoIcon,
  CheckCircleIcon,
  ArrowUpCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function AssignmentCard({ assignment, initialSubmission }) {
  const [reelLink, setReelLink] = useState(initialSubmission?.reelLink || "");
  const [posterLink, setPosterLink] = useState(
    initialSubmission?.posterLink || ""
  );
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(!!initialSubmission);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reelLink && !posterLink) {
      setError("Please provide at least one link (Reel or Poster).");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/assignments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment.id,
          reelLink,
          posterLink,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || "Submission failed. Try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden mt-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowUpCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{assignment.title}</h2>
            <p className="text-purple-100 text-sm mt-0.5">
              {assignment.description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">


        {/* Creative Tasks */}
        <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-xl p-5 border border-pink-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            🎨 Creative Tasks
          </h3>
          <div className="space-y-3">
            <div className="flex gap-3 bg-white rounded-lg p-4 border border-pink-100 shadow-sm">
              <FilmIcon className="w-6 h-6 text-pink-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  🎬 Instagram Reel — "Why Is Health Important?"
                </p>
                <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                  Create a 30–60 second Reel that is informative and engaging.
                  Tag{" "}
                  <span className="font-bold text-pink-600">@aarogyaaadhar</span>{" "}
                  in the caption and on the Reel. Upload it publicly and submit
                  the link below.
                </p>
              </div>
            </div>
            <div className="flex gap-3 bg-white rounded-lg p-4 border border-orange-100 shadow-sm">
              <PhotoIcon className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  🖼️ Health Awareness Poster — with Aarogya Aadhar Logo
                </p>
                <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                  Design a poster using the{" "}
                  <span className="font-bold">Aarogya Aadhar logo</span>{" "}
                  highlighting why health is important. Post it on Instagram /
                  LinkedIn and tag{" "}
                  <span className="font-bold text-orange-600">
                    @aarogyaaadhar
                  </span>
                  . Submit the post link below.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submission Form */}
        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-4">
            <CheckCircleIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-green-800">
                Submission Received! 🎉
              </p>
              <p className="text-green-700 text-sm mt-1">
                Your links have been saved successfully. You can update them
                below anytime.
              </p>
              {reelLink && (
                <p className="text-xs text-green-600 mt-2">
                  🎬 Reel:{" "}
                  <a
                    href={reelLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {reelLink}
                  </a>
                </p>
              )}
              {posterLink && (
                <p className="text-xs text-green-600 mt-1">
                  🖼️ Poster:{" "}
                  <a
                    href={posterLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {posterLink}
                  </a>
                </p>
              )}
              <button
                onClick={() => setSubmitted(false)}
                className="mt-3 text-xs text-green-700 underline hover:text-green-900"
              >
                Edit submission
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-indigo-400" />
              Submit Your Work
            </h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                🎬 Reel Link (Instagram / YouTube Shorts)
              </label>
              <input
                type="url"
                value={reelLink}
                onChange={(e) => setReelLink(e.target.value)}
                placeholder="https://www.instagram.com/reel/..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-gray-50 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                🖼️ Poster Post Link (Instagram / LinkedIn)
              </label>
              <input
                type="url"
                value={posterLink}
                onChange={(e) => setPosterLink(e.target.value)}
                placeholder="https://www.instagram.com/p/..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-gray-50 focus:bg-white transition"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-100 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <ArrowUpCircleIcon className="w-5 h-5" />
                  Submit Assignment
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Make sure both social posts are public and tag{" "}
              <span className="font-bold text-purple-500">@aarogyaaadhar</span>{" "}
              before submitting.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
