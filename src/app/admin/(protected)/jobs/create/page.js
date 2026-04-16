"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import JobImageUpload from "@/components/JobImageUpload";
import JobPdfUpload from "@/components/JobPdfUpload";

export default function CreateJobPost() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    responsibilitiesPdf: "",
    location: "Remote",
    type: "Full-time",
    salary: "",
    examId: "",
    // New fields
    referenceIdPrefix: "",
    whatsappGroupLink: "",
    examStartDate: "",
    applicationStartDate: "",
    resultDate: "",
    inductionDate: "",
    joiningDate: "",
    applicationProcess: "",
  });
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/exam")
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
        const data = await res.json();
        alert("Failed to create job: " + (data.error || "Unknown error"));
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

            {/* Responsibilities PDF */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Roles &amp; Responsibilities (PDF/Docx)</label>
              <JobPdfUpload 
                onUploadComplete={(url) => setFormData({...formData, responsibilitiesPdf: url})} 
                initialUrl={formData.responsibilitiesPdf}
              />
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

            {/* Salary */}
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

            {/* ── NEW: Applicant Reference & Communication ── */}
            <div className="p-5 bg-green-50 rounded-xl border border-green-100 space-y-4">
              <h3 className="font-semibold text-green-900">Applicant Reference & Communication</h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Reference ID Prefix */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Reference ID Prefix <span className="text-xs text-gray-400">(2–4 letters, e.g. &quot;SN&quot; for Staff Nurse)</span>
                  </label>
                  <input 
                    type="text" 
                    maxLength={4}
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-200 outline-none uppercase"
                    placeholder="e.g. SN"
                    value={formData.referenceIdPrefix}
                    onChange={e => setFormData({...formData, referenceIdPrefix: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')})}
                  />
                  <p className="text-xs text-gray-500 mt-1">Applicant IDs will be like: {formData.referenceIdPrefix || "AA"}4821</p>
                </div>

                {/* WhatsApp Group Link */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    WhatsApp Group Link
                  </label>
                  <input 
                    type="url" 
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-200 outline-none"
                    placeholder="https://chat.whatsapp.com/..."
                    value={formData.whatsappGroupLink}
                    onChange={e => setFormData({...formData, whatsappGroupLink: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* ── NEW: Important Dates ── */}
            <div className="p-5 bg-amber-50 rounded-xl border border-amber-100 space-y-4">
              <h3 className="font-semibold text-amber-900">📅 Important Dates for Applicants</h3>
              <p className="text-xs text-amber-700">These dates appear on the applicant&apos;s hall ticket PDF.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Application Starts On</label>
                  <input 
                    type="datetime-local" 
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-amber-200 outline-none text-sm"
                    value={formData.applicationStartDate}
                    onChange={e => setFormData({...formData, applicationStartDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Exam Starts On</label>
                  <input 
                    type="datetime-local" 
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-amber-200 outline-none text-sm"
                    value={formData.examStartDate}
                    onChange={e => setFormData({...formData, examStartDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Result Declared On</label>
                  <input 
                    type="datetime-local" 
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-amber-200 outline-none text-sm"
                    value={formData.resultDate}
                    onChange={e => setFormData({...formData, resultDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Induction Date</label>
                  <input 
                    type="datetime-local" 
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-amber-200 outline-none text-sm"
                    value={formData.inductionDate}
                    onChange={e => setFormData({...formData, inductionDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Joining Date</label>
                  <input 
                    type="datetime-local" 
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-amber-200 outline-none text-sm"
                    value={formData.joiningDate}
                    onChange={e => setFormData({...formData, joiningDate: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* ── NEW: Application Process (HTML Supported) ── */}
            <div className="p-5 bg-purple-50 rounded-xl border border-purple-100 space-y-4">
              <h3 className="font-semibold text-purple-900 text-lg flex items-center gap-2">
                📋 Application Process (HTML Supported)
              </h3>
              <p className="text-xs text-purple-700">Enter the steps applicants should follow. HTML is allowed for custom formatting.</p>
              
              <textarea 
                className="w-full border p-4 rounded-lg focus:ring-2 focus:ring-purple-200 outline-none min-h-[200px] font-mono text-sm leading-relaxed whitespace-pre-wrap"
                placeholder="<ol><li>Click Apply...</li><li>Upload Doc...</li></ol>"
                value={formData.applicationProcess}
                onChange={e => setFormData({...formData, applicationProcess: e.target.value})}
              ></textarea>
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
