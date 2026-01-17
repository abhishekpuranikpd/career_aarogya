"use client";

import { UploadButton } from "@uploadthing/react";
import { useState } from "react";
import Image from "next/image";

export default function JobImageUpload({ onUploadComplete }) {
    const [imageUrl, setImageUrl] = useState("");

    if (imageUrl) {
        return (
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <Image src={imageUrl} alt="Job Cover" fill className="object-cover" />
                <button
                    type="button"
                    onClick={() => { setImageUrl(""); onUploadComplete(""); }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        );
    }

    return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
            <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                        setImageUrl(res[0].url);
                        onUploadComplete(res[0].url);
                    }
                }}
                onUploadError={(error) => {
                    alert(`ERROR! ${error.message}`);
                }}
            />
            <p className="text-sm text-gray-500 mt-2">Upload Cover Image</p>
        </div>
    );
}
