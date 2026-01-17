"use client";

import { useState } from "react";

export default function StatusPage() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkStatus = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (data.found) {
        setResult(data.user);
      } else {
        setError("No application found for this email.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center container mx-auto px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-bold text-center mb-6">Check Application Status</h1>
        
        <form onSubmit={checkStatus} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="enter@email.com"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
          >
            {loading ? "Checking..." : "Check Status"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg text-center text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-100">
            <h3 className="font-bold text-lg mb-2 text-primary">{result.name}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Position:</span>
                <span className="font-medium text-gray-900">{result.positionApplied}</span>
              </div>
              <div className="flex justify-between">
                <span>Applied On:</span>
                <span className="font-medium text-gray-900">{new Date(result.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center border-t border-blue-200 pt-2 mt-2">
                <span>Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  result.examStatus === 'PASSED' ? 'bg-green-100 text-green-700' :
                  result.examStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                  result.examStatus === 'COMPLETED' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-200 text-gray-700'
                }`}>
                  {result.examStatus}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
