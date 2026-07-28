import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AppRedirect from "@/components/AppRedirect";

const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
});

export const metadata = {
  title: "Career - Livo Aarogya Aadhar PVT LTD",
  description: "Join our team at Livo Aarogya Aadhar PVT LTD",
  icons: {
    icon: "https://res.cloudinary.com/dorreici1/image/upload/v1763636388/420a5318-cb6c-4915-a728-979d8973a9d1.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans bg-gray-50 text-gray-900`}>
        <Providers>
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          
          <AppRedirect>
            <div className="print:hidden">
              <Navbar />
            </div>

            <main className="min-h-[calc(100vh-64px)]">
              {children}
            </main>

            <div className="print:hidden">
              <Footer />
            </div>
          </AppRedirect>
        </Providers>
      </body>
    </html>
  );
}
