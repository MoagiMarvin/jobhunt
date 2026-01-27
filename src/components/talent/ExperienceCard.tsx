"use client";

import { Building2, Calendar, Trash2, MoreVertical, Edit2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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
    const [showMenu, setShowMenu] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const achievements = description.split('\n').filter(line => line.trim());
    const initialShown = 3;
    const hasMore = achievements.length > initialShown;
    const displayedAchievements = isExpanded ? achievements : achievements.slice(0, initialShown);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="bg-white rounded-xl border border-slate-200 hover:border-blue-200 transition-all shadow-sm p-5 group relative">
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{role}</h3>
                        <div className="flex items-center gap-3">
                            <div className="text-slate-600 uppercase tracking-wider font-extrabold flex items-center gap-1.5 text-[10px] bg-slate-100 px-2 py-0.5 rounded-lg whitespace-nowrap">
                                <Calendar className="w-3.5 h-3.5" />
                                {duration}
                            </div>

                            {isOwner && (
                                <div className="relative" ref={menuRef}>
                                    <button
                                        onClick={() => setShowMenu(!showMenu)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        title="Options"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>

                                    {showMenu && (
                                        <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-10 animate-in fade-in zoom-in duration-100">
                                            {onEdit && (
                                                <button
                                                    onClick={() => {
                                                        onEdit();
                                                        setShowMenu(false);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                    Edit
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => {
                                                        onDelete();
                                                        setShowMenu(false);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold">
                        <Building2 className="w-4 h-4" />
                        {company}
                    </div>

                    <div className="pt-1 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Key Impact & Responsibilities</span>
                        {displayedAchievements.map((line, idx) => (
                            <div key={idx} className="flex gap-2 text-xs text-slate-600 leading-relaxed italic animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="w-1 h-1 rounded-full bg-blue-300 mt-1.5 shrink-0" />
                                <p>
                                    {line}
                                </p>
                            </div>
                        ))}

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
