"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export default function UserLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "", pin: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!/^\d{4}$/.test(formData.pin)) {
      setError("PIN must be exactly 4 digits");
      setLoading(false);
      return;
    }

    try {
      const res = await signIn("user-login", {
        redirect: false,
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        pin: formData.pin,
      });

      if (res?.error === "PIN_NOT_SET") {
        // Redirect to set PIN page for users who haven't set up PIN yet
        router.push(`/set-pin?email=${encodeURIComponent(formData.email.toLowerCase().trim())}`);
      } else if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
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
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center border border-red-100">
                {error}
              </div>
            )}
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* Password */}
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
            </div>

            {/* 4-digit PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                <LockClosedIcon className="w-4 h-4 text-primary" />
                4-Digit Security PIN
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  maxLength={4}
                  pattern="\d{4}"
                  placeholder="Enter your 4-digit PIN"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm tracking-widest text-center text-lg"
                  value={formData.pin}
                  onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-400">Enter your 4-digit PIN to sign in</p>
                <Link href="/forgot-pin" className="text-xs text-primary hover:underline">
                  Forgot PIN?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>

            <div className="text-center">
              <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-gray-700 hover:underline">
                Forgot your password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
