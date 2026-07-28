"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  DevicePhoneMobileIcon, 
  ArrowRightOnRectangleIcon, 
  BriefcaseIcon, 
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

export default function AppRedirect({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isWebView = /wv/i.test(userAgent) || (window.Android && window.Android.inApp);

    if (isWebView) {
      setStatus("app");
    } else {
      setStatus("outside_app");
    }
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50/50 backdrop-blur-sm">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (status === "outside_app") {
    const steps = [
      {
        id: 1,
        title: "Download App",
        description: "Get the Livo Aarogya Aadhar app from the Google Play Store.",
        icon: <DevicePhoneMobileIcon className="h-6 w-6" />
      },
      {
        id: 2,
        title: "Sign In",
        description: "Open the app and securely log in to your account.",
        icon: <ArrowRightOnRectangleIcon className="h-6 w-6" />
      },
      {
        id: 3,
        title: "Go to Careers",
        description: "Navigate to the dedicated 'Careers' section.",
        icon: <BriefcaseIcon className="h-6 w-6" />
      },
      {
        id: 4,
        title: "Explore & Apply",
        description: "Browse open positions and apply instantly.",
        icon: <MagnifyingGlassIcon className="h-6 w-6" />
      }
    ];

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.2 }
      }
    };

    const itemVariants = {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F0F5FA] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
        {/* Medical-themed floating background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Medical crosses */}
          <motion.div 
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[15%] left-[10%] text-blue-400/40"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M19 10h-5V5h-4v5H5v4h5v5h4v-5h5v-4z"/></svg>
          </motion.div>
          <motion.div 
            animate={{ y: [0, 30, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[20%] right-[15%] text-indigo-400/40"
          >
            <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M19 10h-5V5h-4v5H5v4h5v5h4v-5h5v-4z"/></svg>
          </motion.div>
          <motion.div 
            animate={{ y: [0, -15, 0], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[40%] right-[8%] text-blue-300/40"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M19 10h-5V5h-4v5H5v4h5v5h4v-5h5v-4z"/></svg>
          </motion.div>
          
          {/* Bubbles */}
          <motion.div 
            animate={{ y: [0, -40, 0], x: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[25%] right-[25%] w-16 h-16 rounded-full bg-blue-300/20 blur-sm"
          />
          <motion.div 
            animate={{ y: [0, 30, 0], x: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute bottom-[30%] left-[20%] w-24 h-24 rounded-full bg-indigo-300/20 blur-md"
          />
          <motion.div 
            animate={{ y: [0, -25, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-[60%] left-[8%] w-12 h-12 rounded-full border-2 border-blue-400/30"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,100,200,0.15)] border border-white/50 overflow-hidden relative z-10"
        >
          <div className="bg-gradient-to-br from-[#0B5394] via-[#1A73E8] to-[#174EA6] px-8 py-14 text-center relative overflow-hidden">
            {/* Subtle overlay medical pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTIwIDEwdi01aC00djVoLTV2NGg1djVoNHYtNWg1di00eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')] bg-[length:60px_60px]"></div>
            
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="bg-white p-4 rounded-[1.25rem] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] mb-6 ring-4 ring-white/20">
                <img 
                  src="https://res.cloudinary.com/dorreici1/image/upload/v1763636388/420a5318-cb6c-4915-a728-979d8973a9d1.png" 
                  alt="Logo" 
                  className="h-16 w-16 object-contain"
                />
              </div>
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-white tracking-tight sm:text-4xl drop-shadow-md"
              >
                Experience the App
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-base sm:text-lg text-blue-50 max-w-lg mx-auto font-light"
              >
                Our careers portal is exclusively available on our mobile application. Follow these simple steps to start applying.
              </motion.p>
            </motion.div>
          </div>
          
          <div className="px-6 py-10 sm:px-12 sm:py-12 bg-white">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              {/* Refined subtle line */}
              <div className="hidden sm:block absolute left-[1.75rem] top-8 bottom-8 w-[2px] bg-gradient-to-b from-blue-100 via-blue-50 to-transparent"></div>
              
              <ul className="space-y-8 sm:space-y-10 relative">
                {steps.map((step, index) => (
                  <motion.li 
                    key={step.id} 
                    variants={itemVariants}
                    className="relative flex flex-col sm:flex-row items-start sm:items-center group cursor-default"
                  >
                    <div className="flex items-center sm:mr-8 mb-4 sm:mb-0 relative z-10">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50/50 text-blue-600 border border-blue-100 shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-blue-200">
                        <div className="transition-colors duration-300">
                           {step.icon}
                        </div>
                      </div>
                      {/* Mobile line */}
                      {index !== steps.length - 1 && (
                        <div className="sm:hidden absolute left-[1.75rem] top-14 bottom-[-32px] w-[2px] bg-blue-50 -ml-[1px]"></div>
                      )}
                    </div>
                    <div className="flex-1 w-full transform transition-all duration-300 group-hover:translate-x-2">
                      <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold sm:hidden">
                          {step.id}
                        </span>
                        {step.title}
                      </h3>
                      <p className="mt-1.5 text-slate-500 leading-relaxed font-light">{step.description}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mt-14 flex justify-center pt-8 border-t border-slate-100"
            >
              <a
                href="https://play.google.com/store/apps/details?id=com.aarogyaaadhar.app"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-block rounded-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] focus:outline-none focus:ring-4 focus:ring-blue-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Get it on Google Play"
                  className="h-14 sm:h-16 object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
