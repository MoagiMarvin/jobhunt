"use client";

import { Building2, Calendar, Briefcase } from "lucide-react";
import ItemActionMenu from "./ItemActionMenu";
import { useState } from "react";

interface ExperienceCardProps {
    role: string;
    company: string;
    duration: string;
    description: string;
    onDelete?: () => void;
    onEdit?: () => void;
    isOwner?: boolean;
}

export default function ExperienceCard({
    role,
    company,
    duration,
    description,
    onDelete,
    onEdit,
    isOwner = true
}: ExperienceCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const achievements = description.split('\n').filter(line => line.trim());
    const initialShown = 3;
    const hasMore = achievements.length > initialShown;
    const displayedAchievements = isExpanded ? achievements : achievements.slice(0, initialShown);

    return (
        <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 p-4 md:p-6 shadow-sm group relative hover:border-blue-200 transition-all">
            <div className={`flex gap-3 md:gap-4 items-start ${isExpanded ? '' : 'max-h-none'}`}>
                {/* Visual Marker */}
                <div className="flex flex-col items-center shrink-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100 italic font-bold text-base md:text-lg">
                        {company.charAt(0)}
                    </div>
                    <div className="flex-1 w-0.5 bg-slate-100 my-2"></div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2 pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="space-y-1">
                            <h3 className="text-[13px] md:text-sm font-semibold text-slate-800 tracking-tight leading-tight">{role}</h3>
                            <div className="flex items-center gap-2 text-[13px] md:text-sm text-blue-500 font-medium">
                                <Building2 className="w-4 h-4" />
                                {company}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 self-end sm:self-auto">
                            <div className="text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5 text-[9px] bg-slate-100 px-2 py-0.5 rounded-lg whitespace-nowrap">
                                <Calendar className="w-3.5 h-3.5" />
                                {duration}
                            </div>
                            {isOwner && (
                                <div className="-mr-2 shrink-0">
                                    <ItemActionMenu
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-2 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Key Impact & Responsibilities</span>
                        <div className="space-y-1.5">
                            {displayedAchievements.map((line, idx) => (
                                <div key={idx} className="flex gap-2 text-xs text-slate-600 leading-relaxed italic animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="w-1 h-1 rounded-full bg-blue-300 mt-1.5 shrink-0" />
                                    <p>{line}</p>
                                </div>
                            ))}
                        </div>

                        {hasMore && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 mt-1 flex items-center gap-1 transition-colors uppercase tracking-tight w-fit"
                            >
                                {isExpanded ? 'Show Less' : `Show ${achievements.length - initialShown} More...`}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
