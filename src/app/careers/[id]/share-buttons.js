"use client";

import { ShareIcon, LinkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function ShareButtons({ title }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Apply for ${title} at Aarogya Aadhar`,
          text: `Check out this opportunity: ${title}`,
          url: url
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleShare}
      className="p-4 bg-white/10 backdrop-blur border border-white/20 text-white rounded-full hover:bg-white/20 transition flex items-center justify-center w-14 h-14"
      title="Share this job"
    >
      {copied ? <span className="text-xs font-bold">Copied</span> : <ShareIcon className="w-6 h-6" />}
    </button>
  );
}
