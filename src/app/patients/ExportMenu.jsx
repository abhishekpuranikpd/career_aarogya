"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

export default function ExportMenu({ total = 10000 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadingPart, setDownloadingPart] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const triggerDownload = (url, partLabel) => {
    setDownloadingPart(partLabel);
    setIsOpen(false);

    // Create a temporary anchor to reliably trigger the browser download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Reset notification after 4 seconds
    setTimeout(() => {
      setDownloadingPart(null);
    }, 4000);
  };

  const exportOptions = [
    {
      id: "part1",
      title: "Part 1 (1 – 5,000)",
      description: "First 5,000 patient records",
      badge: "Records 1 - 5,000",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      iconBg: "bg-emerald-50 text-emerald-600",
      url: "/api/patients/export?range=1-5000",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
    },
    {
      id: "part2",
      title: "Part 2 (5,001 – 10,000)",
      description: "Second 5,000 patient records",
      badge: "Records 5,001 - 10,000",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      iconBg: "bg-purple-50 text-purple-600",
      url: "/api/patients/export?range=5001-10000",
      buttonColor: "bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
    },
    {
      id: "all",
      title: "Full Database (1 – 10,000)",
      description: `Complete dataset of all ${total.toLocaleString()} patients`,
      badge: "All 10,000",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      iconBg: "bg-blue-50 text-blue-600",
      url: "/api/patients/export?range=all",
      buttonColor: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Action Buttons Container */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Direct Quick Download Pills (Desktop & Tablet) */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">
            Download:
          </span>

          <button
            onClick={() => triggerDownload("/api/patients/export?range=1-5000", "Part 1 (1 - 5,000)")}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
            title="Download records 1 to 5,000 as Excel (.xlsx)"
          >
            <ArrowDownTrayIcon className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>1 – 5,000</span>
          </button>

          <button
            onClick={() => triggerDownload("/api/patients/export?range=5001-10000", "Part 2 (5,001 - 10,000)")}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
            title="Download records 5,001 to 10,000 as Excel (.xlsx)"
          >
            <ArrowDownTrayIcon className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>5,001 – 10,000</span>
          </button>

          <button
            onClick={() => triggerDownload("/api/patients/export?range=all", "All Records (1 - 10,000)")}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
            title="Download all 10,000 records as Excel (.xlsx)"
          >
            <TableCellsIcon className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>All (10k)</span>
          </button>
        </div>

        {/* Dropdown Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium py-2 px-3.5 rounded-lg shadow-sm transition-all cursor-pointer text-sm"
        >
          <DocumentArrowDownIcon className="w-4 h-4 text-emerald-600" />
          <span>Export Excel</span>
          <ChevronDownIcon
            className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Select Download Range
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Total {total.toLocaleString()} records • Excel (.xlsx) format
            </p>
          </div>

          <div className="p-1 space-y-1">
            {exportOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => triggerDownload(opt.url, opt.title)}
                className="w-full text-left flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
              >
                <div className={`p-2 rounded-lg ${opt.iconBg} mt-0.5 flex-shrink-0`}>
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {opt.title}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${opt.badgeColor}`}
                    >
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 rounded-b-xl text-[11px] text-gray-500 flex items-center justify-between">
            <span>Fast download partitioned in 5,000 batches</span>
            <span className="font-mono text-[10px] text-gray-400">.XLSX</span>
          </div>
        </div>
      )}

      {/* Temporary Notification Toast */}
      {downloadingPart && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl text-sm border border-gray-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="font-semibold text-white">Preparing Download</div>
            <div className="text-xs text-gray-300">
              Generating Excel for <span className="text-emerald-300">{downloadingPart}</span>...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
