"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LockClosedIcon, ArrowLeftIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function ForgotPinPage() {
  const router = useRouter();
  const [step, setStep] = useState("email"); // "email" → "answer" → "done"
  const [email, setEmail] = useState("");
  const [pinQuestion, setPinQuestion] = useState("");
  const [pinAnswer, setPinAnswer] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFetchQuestion = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/forgot-pin?email=${encodeURIComponent(email.toLowerCase().trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch security question");
      setPinQuestion(data.pinQuestion);
      setStep("answer");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPin = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{4}$/.test(newPin)) {
      setError("New PIN must be exactly 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          pinAnswer,
          newPin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset PIN");
      setStep("done");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-green-700 mb-2">PIN Reset Successfully!</h2>
          <p className="text-gray-500 text-sm">Redirecting you to login...</p>
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
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot PIN</h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === "email" ? "Enter your email to retrieve your security question" : "Answer your security question to reset your PIN"}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {["email", "answer"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === s || (step === "answer" && s === "email") ? "bg-primary text-white" : "bg-gray-200 text-gray-400"}`}>
                {i + 1}
              </div>
              <span className={`text-xs ${step === s ? "text-primary font-medium" : "text-gray-400"}`}>
                {s === "email" ? "Email" : "Security"}
              </span>
              {i === 0 && <div className="w-8 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-xl border border-gray-100">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 mb-5">
              {error}
            </div>
          )}

          {step === "email" && (
            <form onSubmit={handleFetchQuestion} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registered Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-70"
              >
                {loading ? "Searching..." : "Find My Account"}
              </button>
            </form>
          )}

          {step === "answer" && (
            <form onSubmit={handleResetPin} className="space-y-5">
              {/* Security Question */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-xs text-blue-500 font-medium mb-1">Your Security Question:</p>
                <p className="text-sm font-semibold text-blue-800">{pinQuestion}</p>
              </div>

              {/* Answer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Answer</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your answer"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  value={pinAnswer}
                  onChange={e => setPinAnswer(e.target.value)}
                />
              </div>

              {/* New PIN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New 4-Digit PIN</label>
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    required
                    maxLength={4}
                    placeholder="New PIN"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-center text-2xl tracking-widest pr-12"
                    value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  />
                  <button type="button" onClick={() => setShowPin(!showPin)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                    {showPin ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm PIN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New PIN</label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  placeholder="Re-enter PIN"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-center text-2xl tracking-widest"
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep("email"); setError(""); }}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-all text-sm"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-70 text-sm"
                >
                  {loading ? "Resetting..." : "Reset PIN"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
