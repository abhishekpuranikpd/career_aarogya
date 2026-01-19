"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import JobImageUpload from "@/components/JobImageUpload";

export default function CreateJobPost() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    location: "Remote",
    type: "Full-time",
    salary: "",
    examId: ""
  });
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch exams to link
    fetch("/api/exam") // We need to make sure this route lists all exams
      .then(res => res.json())
      .then(data => setExams(data))
      .catch(err => console.error("Failed to fetch exams", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert("Job Post created successfully!");
        router.push("/admin/dashboard");
      } else {
        alert("Failed to create job");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-3xl">
        <Link href="/admin/dashboard" className="flex items-center text-gray-500 hover:text-primary mb-6 transition-colors">
          <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Job Opening</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Job Title</label>
              <input 
                type="text" 
                required
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="e.g. Senior Medical Officer"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
              <textarea 
                required
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none min-h-[150px]"
                placeholder="Detailed job description..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Cover Image</label>
              <JobImageUpload onUploadComplete={(url) => setFormData({...formData, imageUrl: url})} />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Employment Type</label>
                <select 
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Location</label>
                <input 
                  type="text" 
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. Mumbai / Remote"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>

            {/* Salary (Optional) */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Salary Range (Optional)</label>
              <input 
                type="text" 
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="e.g. ₹5,00,000 - ₹8,00,000 PA"
                value={formData.salary}
                onChange={e => setFormData({...formData, salary: e.target.value})}
              />
            </div>

            {/* Linked Exam */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
               <h3 className="font-semibold text-blue-900 mb-2">Assessment Link</h3>
               <p className="text-sm text-blue-700 mb-4">Select the exam that applicants must take for this position.</p>
               
               <select 
                  required
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                  value={formData.examId}
                  onChange={e => setFormData({...formData, examId: e.target.value})}
               >
                 <option value="">-- Select an Exam --</option>
                 {exams.map(exam => (
                   <option key={exam.id} value={exam.id}>{exam.title} ({exam.type})</option>
                 ))}
               </select>
               <div className="mt-2 text-right">
                  <Link href="/admin/exams/create" className="text-sm text-primary hover:underline font-medium">+ Create New Exam</Link>
               </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-md text-lg"
            >
              {loading ? "Publishing..." : "Publish Job Opening"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
