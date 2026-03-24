"use client";

import { useState, useEffect } from 'react';
import { Download, FileEdit, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from "@/lib/utils";

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
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    const btnClasses = variant === 'button'
        ? cn("flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all font-bold text-xs shadow-lg cursor-pointer", className)
        : cn("w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3 cursor-pointer", className);

    const canDownload = !!data;

    const handleDownload = async () => {
        if (!data || isGenerating) return;
        setIsGenerating(true);
        setError(null);

        try {
            // Dynamically import to avoid SSR and reduce initial bundle
            const { pdf } = await import('@react-pdf/renderer');
            const { ResumeDocument } = await import('./ResumeDocument');
            const React = (await import('react')).default;

            const doc = React.createElement(ResumeDocument, { data });
            const blob = await pdf(doc).toBlob();

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const name = (data.user?.name || data.personalInfo?.name || 'Resume')
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '_');
            a.download = `${name}_Resume.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error("PDF Download Error:", err);
            setError(err?.message || String(err));
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="contents">
            {canDownload ? (
                <button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className={cn(btnClasses, isGenerating && "opacity-70 cursor-wait")}
                    title={error || undefined}
                >
                    {isGenerating
                        ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        : <Download className={cn("w-4 h-4", error ? "text-red-400" : "text-blue-600")} />
                    }
                    {isGenerating
                        ? 'Generating PDF...'
                        : error
                            ? 'Retry Download'
                            : 'Quick Download'
                    }
                </button>
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

            {error && (
                <p className="text-[10px] text-red-500 px-4 pb-1 leading-tight">{error}</p>
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
