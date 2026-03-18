import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vitah | Smart AI Career Intelligence",
  description: "Find your dream job in South Africa with Vitah. Advanced AI job search, automated CV tailoring, and professional interview practice.",
  keywords: ["jobs south africa", "career AI", "job search", "CV tailoring", "interview practice", "Vitah"],
  openGraph: {
    title: "Vitah | Your Career, Powered by AI",
    description: "Launch your career with the most advanced job discovery platform in SA.",
    url: "https://vitah.io",
    siteName: "Vitah",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
};

import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-slate-50/50 flex flex-col md:flex-row min-h-screen`}>
        <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-multiply">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>
        <Sidebar />
        <main className="flex-1 overflow-y-auto mt-16 md:mt-0 w-full min-w-0">
          {children}
        </main>
      </body>
    </html>
  );
}
