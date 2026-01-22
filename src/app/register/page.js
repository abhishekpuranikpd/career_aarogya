"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import ResumeUpload from "@/components/Upload";
import Link from "next/link";
import { CheckCircleIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

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
    otp: "",
  });
  
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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
        password: formData.password,
        otp: formData.otp // Pass the same OTP
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
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={otpSent}
                />
                {!otpSent && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!formData.email) {
                        setError("Please enter email first");
                        return;
                      }
                      setLoading(true);
                       try {
                        const res = await fetch('/api/auth/send-otp', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: formData.email, type: 'register' })
                        });
                        const data = await res.json();
                        if (data.success) {
                          setOtpSent(true);
                          setError("");
                        } else {
                          setError(data.error);
                        }
                      } catch (err) {
                        setError("Failed to send OTP");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading || !formData.email}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 whitespace-nowrap disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                )}
              </div>
              {otpSent && (
                  <div className="mt-2 animate-fadeIn">
                       <label className="text-sm font-medium text-gray-700">One-Time Password (OTP)</label>
                       <div className="flex gap-2 mt-1">
                           <input
                            type="text"
                            required
                            placeholder="Enter 4-digit code"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={formData.otp}
                            onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                          />
                          <button
                             type="button"
                             onClick={() => setOtpSent(false)}
                             className="text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap px-2"
                          >
                             Change Email
                          </button>
                       </div>
                       <p className="text-xs text-green-600 mt-1">OTP sent to {formData.email}</p>
                  </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Create Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
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
