"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import ResumeUpload from "@/components/Upload";
import Link from "next/link";
import { CheckCircleIcon, EyeIcon, EyeSlashIcon, LockClosedIcon, ArrowDownTrayIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What was your childhood nickname?",
  "What is your father's middle name?",
  "What is your hometown?",
  "What was the name of your first school?",
  "What is your favorite childhood movie?",
];

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function SuccessView({ data, pin }) {
  const maskedPin = pin ? `${pin.slice(0, 2).replace(/./g, "●")}${pin.slice(2)}` : "●●" + (pin?.slice(2) || "**");

  const handleDownloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });

    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(240, 245, 255);
    doc.rect(0, 0, pw, ph, "F");

    // Header bar
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pw, 30, "F");

    // Add Logo from Cloudinary
    try {
      doc.addImage(
        "https://res.cloudinary.com/dorreici1/image/upload/v1763636388/420a5318-cb6c-4915-a728-979d8973a9d1.png",
        "PNG",
        10, 5, 15, 15
      );
    } catch (e) {
      console.error("Logo failed to load:", e);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("AAROGYA AADHAR", pw / 2, 12, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Career Application — Registration & Induction Document", pw / 2, 20, { align: "center" });
    doc.text("career.aarogyaaadhar.com", pw / 2, 27, { align: "center" });

    // Document Title
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("REGISTRATION DOCUMENT", pw / 2, 42, { align: "center" });

    // Divider
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.5);
    doc.line(10, 46, pw - 10, 46);

    // Reference ID — prominent
    doc.setFillColor(30, 64, 175);
    doc.roundedRect(10, 50, pw - 20, 14, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Reference ID", pw / 2, 56, { align: "center" });
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(data.referenceId || "N/A", pw / 2, 62, { align: "center" });

    // Applicant details table
    const fields = [
      ["Name", data.user?.name || "—"],
      ["Email", data.user?.email || "—"],
      ["Position", data.user?.positionApplied || "—"],
      ["Mobile No.", data.user?.mobile || "—"],
    ];

    let y = 74;
    doc.setFontSize(9);
    fields.forEach(([label, value], i) => {
      doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 255);
      doc.rect(10, y, pw - 20, 8, "F");
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text(label, 13, y + 5.5);
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.text(String(value), pw / 2, y + 5.5);
      y += 8;
    });

    // Important dates
    y += 4;
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(10, y, pw - 20, 42, 2, 2, "F");
    doc.setDrawColor(147, 197, 253);
    doc.roundedRect(10, y, pw - 20, 42, 2, 2, "S");

    doc.setTextColor(30, 64, 175);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("IMPORTANT DATES", pw / 2, y + 7, { align: "center" });

    const dates = [
      ["Application Starts On", formatDate(data.applicationStartDate)],
      ["Exam Starts On", formatDate(data.examStartDate)],
      ["Result Declared On", formatDate(data.resultDate)],
      ["Induction Date", formatDate(data.inductionDate)],
      ["Joining Date", formatDate(data.joiningDate)],
    ];

    doc.setFontSize(8);
    dates.forEach(([label, value], i) => {
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");
      doc.text(label + ":", 14, y + 14 + i * 7);
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.text(value, pw - 14, y + 14 + i * 7, { align: "right" });
    });

    y += 46;

    // WhatsApp group
    // Join WhatsApp Highlight (Compulsory)
    doc.setFillColor(255, 243, 230);
    doc.roundedRect(10, y, pw - 20, 18, 2, 2, "F");
    doc.setTextColor(194, 120, 57);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("NOTICE: Join Official WhatsApp Group via your Candidate Dashboard", pw / 2, y + 7.5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("Joining is COMPULSORY. All future updates & notifications will be", pw / 2, y + 12, { align: "center" });
    doc.text("shared through the WhatsApp group only.", pw / 2, y + 15.5, { align: "center" });
    y += 22;
    if (data.applicationProcess) {
      y += 2;
      doc.setTextColor(30, 64, 175);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Instructions:", 14, y);
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      
      const processText = data.applicationProcess || "Application process shared on WhatsApp group";
      const cleanProcess = processText.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
      const processLines = doc.splitTextToSize(cleanProcess, pw - 28);
      doc.text(processLines, 14, y + 4);
      y += 6 + processLines.length * 3;
    }

    // Disclaimer
    y += 2;
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.setFont("helvetica", "italic");
    const disclaimer = "If selected, join through the induction date or else ignore this document. Joining through this WhatsApp group is mandatory for receiving official updates.";
    const disclaimerLines = doc.splitTextToSize(disclaimer, pw - 20);
    doc.text(disclaimerLines, 10, y);

    // Footer
    doc.setFillColor(30, 64, 175);
    doc.rect(0, ph - 12, pw, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Aarogya Aadhar Pvt. Ltd. | info@aarogyaaadhar.com | This is a system generated document.", pw / 2, ph - 5, { align: "center" });

    doc.save(`RegistrationDocument_${data.referenceId || "AArogya"}.pdf`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center container mx-auto px-4 py-8">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Success header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Registration Successful!</h2>
          <p className="text-green-100 mt-1 text-sm">Your application has been submitted</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Reference ID */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">Your Reference ID</p>
            <p className="text-3xl font-black text-blue-700 tracking-wider">{data.referenceId}</p>
            <p className="text-xs text-gray-500 mt-1 font-bold">Keep this safe with your side — needed for verification</p>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-0.5">Position Applied</p>
              <p className="font-semibold text-gray-800">{data.user?.positionApplied || "—"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-0.5">Applicant Name</p>
              <p className="font-semibold text-gray-800">{data.user?.name || "—"}</p>
            </div>
          </div>

          {/* Important Dates */}
          {(data.examStartDate || data.resultDate || data.inductionDate || data.joiningDate) && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <h3 className="font-semibold text-amber-800 text-sm mb-3">📅 Important Dates</h3>
              <div className="space-y-2 text-sm">
                {data.applicationStartDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Application Starts On</span>
                    <span className="font-semibold text-gray-800">{formatDate(data.applicationStartDate)}</span>
                  </div>
                )}
                {data.examStartDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exam Starts On</span>
                    <span className="font-semibold text-gray-800">{formatDate(data.examStartDate)}</span>
                  </div>
                )}
                {data.resultDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Result Declared On</span>
                    <span className="font-semibold text-gray-800">{formatDate(data.resultDate)}</span>
                  </div>
                )}
                {data.inductionDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Induction Date</span>
                    <span className="font-semibold text-gray-800">{formatDate(data.inductionDate)}</span>
                  </div>
                )}
                {data.joiningDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Joining Date</span>
                    <span className="font-semibold text-gray-800">{formatDate(data.joiningDate)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WhatsApp */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 border-l-4">
              <div className="flex items-start gap-3">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-900">Compulsory: Join Official WhatsApp Group</p>
                  <p className="text-xs text-amber-700 font-medium mt-1">
                    All future updates, recruitment status, and induction schedules are shared through the WhatsApp group ONLY. Please join immediately.
                  </p>
                </div>
              </div>
              {data.whatsappGroupLink && (
                <a
                  href={data.whatsappGroupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition shadow-sm"
                >
                  Join Official Group Now
                </a>
              )}
            </div>

          {/* Application Process Display */}
          {data.applicationProcess && (
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
              <h3 className="font-semibold text-purple-800 text-sm mb-3">📋 Instructions</h3>
              <div 
                className="text-sm text-purple-700 prose prose-sm prose-purple max-w-none"
                dangerouslySetInnerHTML={{ __html: data.applicationProcess }}
              />
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 text-center px-2">
            If selected, join through the induction date. Else, you may ignore.
            Follow the WhatsApp group for official updates.
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Download Your Document
            </button>
            <Link
              href="/dashboard"
              className="flex-1 text-center py-3 border border-primary text-primary rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PinCreationStep({ email, password, registrationData, onComplete }) {
  const [pinData, setPinData] = useState({
    pin: "",
    confirmPin: "",
    pinQuestion: SECURITY_QUESTIONS[0],
    pinAnswer: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleSetPin = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{4}$/.test(pinData.pin)) {
      setError("PIN must be exactly 4 digits");
      return;
    }
    if (pinData.pin !== pinData.confirmPin) {
      setError("PINs do not match");
      return;
    }
    if (!pinData.pinAnswer.trim()) {
      setError("Please provide your security answer");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          pin: pinData.pin,
          pinQuestion: pinData.pinQuestion,
          pinAnswer: pinData.pinAnswer,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set PIN");
      // Auto-login after PIN is set so 'Go to Dashboard' works
      await signIn("user-login", {
        redirect: false,
        email,
        password,
        pin: pinData.pin,
      });
      onComplete(pinData.pin);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center container mx-auto px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-600 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <LockClosedIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold">Create Your Security PIN</h2>
          <p className="text-blue-100 text-sm mt-1">Set a 4-digit PIN to secure your account</p>
        </div>

        <form onSubmit={handleSetPin} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {/* PIN */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">4-Digit PIN</label>
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                required
                maxLength={4}
                placeholder="Enter 4 digits"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-center text-2xl tracking-widest pr-12"
                value={pinData.pin}
                onChange={e => setPinData({ ...pinData, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              />
              <button type="button" onClick={() => setShowPin(!showPin)} className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                {showPin ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm PIN */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Confirm PIN</label>
            <input
              type="password"
              required
              maxLength={4}
              placeholder="Re-enter 4 digits"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-center text-2xl tracking-widest"
              value={pinData.confirmPin}
              onChange={e => setPinData({ ...pinData, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            />
          </div>

          {/* Security Question */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Security Question</label>
            <p className="text-xs text-gray-400">Used to recover your PIN if forgotten</p>
            <select
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white text-sm"
              value={pinData.pinQuestion}
              onChange={e => setPinData({ ...pinData, pinQuestion: e.target.value })}
            >
              {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>

          {/* Security Answer */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Your Answer</label>
            <input
              type="text"
              required
              placeholder="Type your answer (case-insensitive)"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              value={pinData.pinAnswer}
              onChange={e => setPinData({ ...pinData, pinAnswer: e.target.value })}
            />
            <p className="text-xs text-gray-400">Remember this answer — you&apos;ll need it to reset your PIN</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Setting PIN..." : "Set PIN & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

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
    position: "Staff Nurse",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  
  useEffect(() => {
    if (jobTitle) {
      setFormData(prev => ({ ...prev, position: jobTitle }));
    }
  }, [jobTitle]);

  const [resumeUrl, setResumeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("form"); // "form" | "pin" | "success"
  const [registrationData, setRegistrationData] = useState(null);
  const [userPin, setUserPin] = useState("");

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
          jobPostId: jobId || null
        }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setRegistrationData(data);
      setStep("pin"); // Move to PIN creation step
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePinComplete = (pin) => {
    setUserPin(pin);
    setStep("success");
  };

  if (step === "pin") {
    return (
      <PinCreationStep
        email={formData.email}
        password={formData.password}
        registrationData={registrationData}
        onComplete={handlePinComplete}
      />
    );
  }

  if (step === "success") {
    return <SuccessView data={registrationData} pin={userPin} />;
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

            <div className="space-y-2 md:col-span-2">
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

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
            <LockClosedIcon className="w-4 h-4 inline mr-1" />
            After registration, you&apos;ll be asked to set a <strong>4-digit security PIN</strong> to protect your account.
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
