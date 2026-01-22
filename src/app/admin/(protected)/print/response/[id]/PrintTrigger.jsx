"use client";

import { useEffect } from "react";
import { PrinterIcon } from "@heroicons/react/24/outline";

export default function PrintTrigger() {

    // Optional: Auto-print on load
    // useEffect(() => {
    //     setTimeout(() => {
    //         window.print();
    //     }, 500);
    // }, []);

    return (
        <div className="fixed top-4 right-4 print:hidden z-50">
            <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-lg transition-colors font-bold"
            >
                <PrinterIcon className="w-5 h-5" />
                Print / Save PDF
            </button>
        </div>
    );
}
