import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vitah - AI-Powered Tech Career Platform",
  description: "Accelerate your tech career with AI-driven job searching and interview prep.",
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
        <Sidebar />
        <main className="flex-1 overflow-y-auto mt-16 md:mt-0 w-full min-w-0">
          {children}
        </main>
      </body>
    </html>
  );
}
