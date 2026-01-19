"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StatusUpdater({ userId, currentStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    setStatus(newStatus);
    
    try {
      const res = await fetch('/api/admin/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, status: newStatus }),
      });

      if (res.ok) {
        router.refresh(); // Refresh server components to reflect change
      } else {
        alert("Failed to update status");
        setStatus(currentStatus); // Revert on failure
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
      setStatus(currentStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={loading}
        className={`text-xs font-bold py-1 px-2 rounded-full border outline-none cursor-pointer ${
          status === 'PASSED' ? 'bg-green-100 text-green-700 border-green-200' :
          status === 'FAILED' ? 'bg-red-100 text-red-700 border-red-200' :
          'bg-yellow-100 text-yellow-700 border-yellow-200'
        }`}
      >
        <option value="PENDING">PENDING</option>
        <option value="PASSED">PASSED</option>
        <option value="FAILED">FAILED</option>
        <option value="COMPLETED">COMPLETED</option>
      </select>
      {loading && <span className="text-xs text-gray-400">Saving...</span>}
    </div>
  );
}
