"use client";

import { UploadButton } from "@uploadthing/react";
import { useState } from "react";

export default function JobPdfUpload({ onUploadComplete, initialUrl }) {
    const [pdfUrl, setPdfUrl] = useState(initialUrl || "");

    if (pdfUrl) {
        return (
            <div className="relative w-full p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3 overflow-hidden">
                    <svg className="w-8 h-8 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate">
                        View Uploaded Document
                    </a>
                </div>
                <button
                    type="button"
                    onClick={() => { setPdfUrl(""); onUploadComplete(""); }}
                    className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        );
    }

    return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors group">
            <UploadButton
                endpoint="resumeUploader"
                onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                        setPdfUrl(res[0].url);
                        onUploadComplete(res[0].url);
                    }
                }}
                onUploadError={(error) => {
                    alert(`ERROR! ${error.message}`);
                }}
                appearance={{
                    button: "bg-white text-primary border border-primary hover:bg-primary hover:text-white transition-all text-sm font-semibold px-4 py-2 rounded-md",
                    allowedContent: "text-xs text-gray-400 mt-1"
                }}
            />
            <p className="text-xs text-gray-500 mt-2 text-center">Supported: PDF, DOCX (Max 4MB)</p>
        </div>
    );
}
