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
    }, []);

    if (!isMounted) return null;

    const btnClasses = variant === 'button'
        ? cn("flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all font-bold text-xs shadow-lg", className)
        : cn("w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3", className);

    return (
        <div className="contents">
            {data && (
                <PDFDownloadLink
                    document={<ResumeDocument data={data} />}
                    fileName={`${(data.user?.name || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`}
                    className={btnClasses}
                >
                    {({ loading }: any) => (
                        <>
                            <Download className="w-4 h-4 text-blue-600" />
                            {loading ? 'Preparing...' : 'Quick Download'}
                        </>
                    )}
                </PDFDownloadLink>
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
