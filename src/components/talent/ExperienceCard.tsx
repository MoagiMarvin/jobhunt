"use client";

import { Building2, Calendar, Trash2 } from "lucide-react";

interface ExperienceCardProps {
    role: string;
    company: string;
    duration: string;
    description: string;
    onDelete?: () => void;
    isOwner?: boolean;
}

export default function ExperienceCard({
    role,
    company,
    duration,
    description,
    onDelete,
    isOwner = true
}: ExperienceCardProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 hover:border-blue-200 transition-all shadow-sm p-5 group relative">
            {isOwner && onDelete && (
                <button
                    onClick={onDelete}
                    className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}

            <div className="flex gap-4">
                {/* Visual Marker */}
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 italic font-bold text-lg">
                        {company.charAt(0)}
                    </div>
                    <div className="flex-1 w-0.5 bg-slate-100 my-2"></div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2 pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{role}</h3>
                        <div className="text-slate-600 uppercase tracking-wider font-extrabold flex items-center gap-1.5 text-[10px] bg-slate-100 px-2 py-0.5 rounded-lg">
                            <Calendar className="w-3.5 h-3.5" />
                            {duration}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold">
                        <Building2 className="w-4 h-4" />
                        {company}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pt-1 italic">
                        <span className="font-bold text-slate-800 not-italic">Key Impact:</span> {description}
                    </p>
                </div>
            </div>
        </div>
    );
}
