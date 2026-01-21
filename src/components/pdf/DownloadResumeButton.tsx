"use client";

import { useState, useEffect } from 'react';
import { Download, FileEdit } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ResumeDocument } from './ResumeDocument';

const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    { ssr: false }
);

interface DownloadResumeButtonProps {
    data?: any;
}

export default function DownloadResumeButton({ data }: DownloadResumeButtonProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <div className="flex items-center gap-2">
            {data && (
                <PDFDownloadLink
                    document={<ResumeDocument data={data} />}
                    fileName={`${(data.user?.name || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-700 hover:bg-slate-50 transition-all font-semibold text-sm border border-slate-200 shadow-sm"
                >
                    {({ loading }: any) => (
                        <>
                            <Download className="w-4 h-4 text-blue-600" />
                            {loading ? 'Preparing...' : 'Quick Download'}
                        </>
                    )}
                </PDFDownloadLink>
            )}

            <Link
                href="/cv/preview"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all font-semibold text-sm shadow-sm"
            >
                <FileEdit className="w-4 h-4" />
                Customize
            </Link>
        </div>
    );
}
