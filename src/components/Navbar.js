"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-48 h-14 relative">
             <Image 
                src="https://res.cloudinary.com/dorreici1/image/upload/v1763636388/420a5318-cb6c-4915-a728-979d8973a9d1.png" 
                alt="Aarogya Aadhar Logo" 
                fill
                className="object-contain object-left"
                priority
             />
          </div>
{/* Logo Only */}
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
          <Link href="/careers" className="text-sm font-medium hover:text-primary transition-colors">Careers</Link>
          
          {!session ? (
            <>
              <Link href="/status" className="text-sm font-medium hover:text-primary transition-colors">Check Status</Link>
              <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
              <Link href="/register" className="px-5 py-2.5 bg-primary text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                Join Us
              </Link>
            </>
          ) : (
            <>
              {session.user.role === 'admin' ? (
                 <Link href="/admin/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Admin Dashboard</Link>
              ) : (
                 <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">My Dashboard</Link>
              )}
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Sign Out
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-lg absolute w-full left-0">
          <Link href="/" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link href="/careers" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Careers</Link>
          
          {!session ? (
            <>
              <Link href="/status" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Check Status</Link>
              <Link href="/login" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link href="/register" className="block w-full text-center px-4 py-3 bg-primary text-white rounded-lg font-bold" onClick={() => setMobileMenuOpen(false)}>
                Join Us
              </Link>
            </>
          ) : (
            <>
              {session.user.role === 'admin' ? (
                 <Link href="/admin/dashboard" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Admin Dashboard</Link>
              ) : (
                 <Link href="/dashboard" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>My Dashboard</Link>
              )}
               <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="block w-full text-left text-sm font-medium py-2 text-red-600"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
