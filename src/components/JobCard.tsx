"use client";

import { useState } from "react";
import { MapPin, Briefcase, ExternalLink, Copy, Check, Mic, Building2, Globe } from "lucide-react";
import Image from "next/image";

interface JobCardProps {
    job: {
        id: string;
        title: string;
        company: string;
        location: string;
        link: string;
        source: string;
        isNiche?: boolean;
        date?: string;
    };
    router: any;
}

export default function JobCard({ job, router }: JobCardProps) {
    const [copied, setCopied] = useState(false);
    const [imgError, setImgError] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(job.link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Heuristic for logo domain (not perfect, but good for demo)
    const companyDomain = job.company.toLowerCase().replace(/\s+/g, '') + '.com';
    const logoUrl = `https://logo.clearbit.com/${companyDomain}`;

    return (
        <div
            onClick={() => {
                const params = new URLSearchParams({
                    url: job.link,
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    source: job.source,
                    date: job.date || ''
                });
                router.push(`/jobs/view?${params.toString()}`);
            }}
            className="group relative bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 transition-all duration-300 cursor-pointer active:scale-[0.99]"
        >
            {/* Glassmorphism Gradient Blob (Subtle) */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* "New" Badge - if date is recent */}
            {/* <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                VIEW JOB
            </div> */}

            <div className="flex gap-5 relative z-10">
                {/* Company Logo / Avatar */}
                <div className="w-14 h-14 shrink-0 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform p-2">
                    {!imgError ? (
                        <img
                            src={logoUrl}
                            alt={`${job.company} logo`}
                            className="w-full h-full object-contain"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-xl">
                            {job.company.charAt(0)}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate pr-4 leading-tight">
                                {job.title}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                                <span className="font-semibold text-slate-700">
                                    {job.company}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {job.location}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Badge Row */}
                    <div className="flex items-center gap-2 mt-4">
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border flex items-center gap-1.5 ${job.source.toLowerCase().includes('linkedin') ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            job.source.toLowerCase().includes('pnet') ? 'bg-red-50 text-red-700 border-red-100' :
                                'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                            <Globe className="w-3 h-3" />
                            {job.source}
                        </div>
                        {job.isNiche && (
                            <div className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wide border border-emerald-100 flex items-center gap-1.5">
                                <Check className="w-3 h-3" />
                                Verified
                            </div>
                        )}
                        <div className="ml-auto text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            Read More <ExternalLink className="w-3 h-3" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
