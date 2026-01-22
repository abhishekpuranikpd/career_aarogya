"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function UserLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "", otp: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("user-login", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        otp: formData.otp
      });

      if (res.error) {
        setError("Invalid email or password");
        setLoading(false);
      } else {
        router.push("/dashboard"); // Redirect to User Dashboard
      }
    } catch (err) {
      setError("Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center items-center text-primary mb-6 hover:underline gap-2">
           <ArrowLeftIcon className="w-4 h-4" /> Back to Home
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Applicant Login</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or <Link href="/register" className="font-medium text-primary hover:underline">register for a new position</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
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
                          body: JSON.stringify({ email: formData.email, type: 'login' })
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
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 whitespace-nowrap"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                )}
              </div>
            </div>

            {otpSent && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">One-Time Password (OTP)</label>
                  <div className="mt-1">
                    <input
                      type="text"
                      required
                      placeholder="Enter the 4-digit code sent to your email"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={formData.otp}
                      onChange={e => setFormData({...formData, otp: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm pr-10"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <div className="text-right mt-1">
                    <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot your password?
                    </Link>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
                  >
                    {loading ? "Verifying & Signing in..." : "Verify & Sign in"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="mt-2 w-full text-center text-xs text-gray-500 hover:text-gray-700"
                  >
                    Change Email / Resend OTP
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
