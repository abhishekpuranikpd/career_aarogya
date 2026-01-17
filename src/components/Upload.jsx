"use client";

import { UploadButton } from "@uploadthing/react";
import { useState } from "react";

export default function ResumeUpload({ onUploadComplete, onUploadError }) {
    const [key, setKey] = useState(0); // reset key to force re-render if needed on clear (optional)

    return (
        <div className="w-full">
            <UploadButton
                endpoint="resumeUploader"
                onClientUploadComplete={(res) => {
                    // Do something with the response
                    console.log("Files: ", res);
                    if (res && res[0]) {
                        onUploadComplete(res[0].url);
                    }
                }}
                onUploadError={(error) => {
                    // Do something with the error.
                    console.error(`ERROR! ${error.message}`);
                    onUploadError(error.message);
                }}
                appearance={{
                    button: "bg-primary text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors cursor-pointer text-sm font-medium w-full",
                    allowedContent: "text-gray-400 text-xs"
                }}
            />
        </div>
    );
}
