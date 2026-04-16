"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What was your childhood nickname?",
  "What is your father's middle name?",
  "What is your hometown?",
  "What was the name of your first school?",
  "What is your favorite childhood movie?",
];

function SetPinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [formData, setFormData] = useState({
    email: emailFromUrl,
    pin: "",
    confirmPin: "",
    pinQuestion: SECURITY_QUESTIONS[0],
    pinAnswer: "",
  });
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{4}$/.test(formData.pin)) {
      setError("PIN must be exactly 4 digits (numbers only)");
      return;
    }
    if (formData.pin !== formData.confirmPin) {
      setError("PINs do not match. Please re-enter.");
      return;
    }
    if (!formData.pinAnswer.trim()) {
      setError("Please provide your security answer");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          pin: formData.pin,
          pinQuestion: formData.pinQuestion,
          pinAnswer: formData.pinAnswer,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set PIN");
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-green-700 mb-2">PIN Set Successfully!</h2>
          <p className="text-gray-500 text-sm">Please log in with your new PIN. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/login" className="flex justify-center items-center text-primary mb-6 hover:underline gap-2 text-sm">
          <ArrowLeftIcon className="w-4 h-4" /> Back to Login
        </Link>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set Your Security PIN</h1>
          <p className="text-gray-500 text-sm mt-1">Create a 4-digit PIN to secure your account</p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-xl border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            {/* Email - pre-filled or editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>

            {/* PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">4-Digit PIN</label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  required
                  maxLength={4}
                  placeholder="● ● ● ●"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-center text-2xl tracking-widest pr-12"
                  value={formData.pin}
                  onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                />
                <button type="button" onClick={() => setShowPin(!showPin)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showPin ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm PIN</label>
              <input
                type="password"
                required
                maxLength={4}
                placeholder="Re-enter PIN"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-center text-2xl tracking-widest"
                value={formData.confirmPin}
                onChange={e => setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              />
            </div>

            {/* Security Question */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Security Question</label>
              <p className="text-xs text-gray-400 mb-2">Used to recover your PIN if forgotten</p>
              <select
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white text-sm"
                value={formData.pinQuestion}
                onChange={e => setFormData({ ...formData, pinQuestion: e.target.value })}
              >
                {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>

            {/* Security Answer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Answer</label>
              <input
                type="text"
                required
                placeholder="Enter your answer (case-insensitive)"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                value={formData.pinAnswer}
                onChange={e => setFormData({ ...formData, pinAnswer: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1">⚠️ Remember this answer — you&apos;ll need it to reset your PIN</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Setting PIN..." : "Set PIN & Go to Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SetPinPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <SetPinForm />
    </Suspense>
  );
}
