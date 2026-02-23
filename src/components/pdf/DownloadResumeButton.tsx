"use client";

import { useState, useEffect } from 'react';
import { Download, FileEdit } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { cn } from "@/lib/utils";
import { ResumeDocument } from './ResumeDocument';

const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    { ssr: false }
);

interface DownloadResumeButtonProps {
    data?: any;
    showCustomize?: boolean;
    className?: string;
    variant?: 'menu' | 'button';
}

export default function DownloadResumeButton({
    data,
    showCustomize = true,
    className,
    variant = 'menu'
}: DownloadResumeButtonProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        console.log("Download Button: Mounted with data check:", {
            hasData: !!data,
            userName: data?.user?.name || data?.personalInfo?.name,
            userEmail: data?.user?.email || data?.personalInfo?.email
        });
    }, [data]);

    if (!isMounted) return null;

    const btnClasses = variant === 'button'
        ? cn("flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all font-bold text-xs shadow-lg cursor-pointer", className)
        : cn("w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3 cursor-pointer", className);

    // More permissive data check
    const canDownload = !!data;

    return (
        <div className="contents">
            {canDownload ? (
                <PDFDownloadLink
                    document={<ResumeDocument data={data} />}
                    fileName={`${(data.user?.name || data.personalInfo?.name || 'Resume').replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')}_Resume.pdf`}
                    className={btnClasses}
                >
                    {({ loading, error }: any) => {
                        if (error) console.error("PDF Download Error:", error);
                        return (
                            <>
                                <Download className={cn("w-4 h-4", loading ? "text-slate-400 animate-pulse" : "text-blue-600")} />
                                {loading ? 'Preparing PDF...' : 'Quick Download'}
                            </>
                        );
                    }}
                </PDFDownloadLink>
            ) : (
                <button
                    disabled
                    className={cn(btnClasses, "opacity-50 cursor-not-allowed")}
                    title="No data available for download"
                >
                    <Download className="w-4 h-4 text-slate-400" />
                    No Data
                </button>
            )}

            {showCustomize && (
                <Link
                    href="/cv/preview"
                    className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3"
                >
                    <FileEdit className="w-4 h-4 text-slate-400" />
                    Customize CV
                </Link>
            )}
        </div>
    );
}
