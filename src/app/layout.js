import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
});

export const metadata = {
  title: "Career - Aarogya Aadhar",
  description: "Join our team at Aarogya Aadhar",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans bg-gray-50 text-gray-900`}>
        <Providers>
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          
          <div className="print:hidden">
            <Navbar />
          </div>

          <main className="min-h-[calc(100vh-64px)]">
            {children}
          </main>

          <div className="print:hidden">
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
