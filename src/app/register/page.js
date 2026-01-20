"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import ResumeUpload from "@/components/Upload";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const jobId = searchParams.get('jobId');
  const jobTitle = searchParams.get('title');

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    position: "Staff Nurse", // Default
  });
  
  useEffect(() => {
    if (jobTitle) {
      setFormData(prev => ({ ...prev, position: jobTitle }));
    }
  }, [jobTitle]);

  const [resumeUrl, setResumeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!resumeUrl) {
      setError("Please upload your resume first.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          resumeUrl,
          jobPostId: jobId // Pass job ID if exists
        }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccessData(data);
      
      setSuccessData(data);
      
      // Auto-login the user
      await signIn("user-login", {
        redirect: false,
        email: formData.email,
        password: formData.password
      });

      // Auto redirect to dashboard after short delay
      setTimeout(() => {
          router.push("/dashboard");
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center container mx-auto px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-8">
            Redirecting you to the Careers page...
          </p>
          <Link href="/dashboard" className="block w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Continue to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-primary/5 p-8 border-b border-primary/10">
          <h1 className="text-2xl font-bold text-primary">
            {jobTitle ? `Apply for ${jobTitle}` : "Career Registration"}
          </h1>
          <p className="text-gray-500 mt-2">Fill in your details to apply for a position.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Create Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min. 6 characters"
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mobile Number</label>
              <input
                type="tel"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Position Applying For</label>
              {jobTitle ? (
                 <input 
                    type="text" 
                    readOnly 
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                    value={formData.position}
                 />
              ) : (
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                >
                  <option>Staff Nurse</option>
                  <option>Doctor</option>
                  <option>Lab Technician</option>
                  <option>Pharmacist</option>
                  <option>Teleradiologist</option>
                  <option>Ambulance Driver</option>
                  <option>Software Developer</option>
                  <option>MBA / Management</option>
                  <option>HR Manager</option>
                  <option>Marketing Executive</option>
                  <option>Data Analyst</option>
                  <option>Accountant</option>
                  <option>Other</option>
                </select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Upload Resume / CV</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-white transition-colors">
               {resumeUrl ? (
                 <div className="text-green-600 font-medium flex items-center gap-2">
                   <CheckCircleIcon className="w-5 h-5" /> Resume Uploaded
                 </div>
               ) : (
                 <ResumeUpload 
                   onUploadComplete={(url) => setResumeUrl(url)} 
                   onUploadError={(msg) => setError(msg)}
                 />
               )}
            </div>
            <p className="text-xs text-gray-400 text-center">Supported formats: PDF, DOCX (Max 4MB)</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading form...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
