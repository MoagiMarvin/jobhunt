"use client";

import { PDFDownloadLink } from '@react-pdf/renderer';
import { ResumeDocument } from './ResumeDocument';
import { Download, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DownloadResumeButtonProps {
    data: {
        user: any;
        experiences: any[];
        educationList: any[];
        skills: any[];
        projectsList: any[];
        certificationsList: any[];
        languages?: { language: string; proficiency: string }[];
    };
}

export default function DownloadResumeButton({ data }: DownloadResumeButtonProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        console.log("DownloadResumeButton Data:", data);
    }, [data]);

    if (!isClient) {
        return (
            <button disabled className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-400 font-semibold text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading PDF...
            </button>
        );
    }

    return (
        <PDFDownloadLink
            document={
                <ResumeDocument />
            }
            fileName={`${data.user.name.replace(/\s+/g, '_')}_Resume.pdf`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-slate-800 transition-all font-semibold text-sm shadow-sm"
        >
            {({ blob, url, loading, error }) =>
                loading ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download Resume
                    </span>
                )
            }
        </PDFDownloadLink>
    );
}
