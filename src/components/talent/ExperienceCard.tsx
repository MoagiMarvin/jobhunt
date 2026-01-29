"use client";

import { Building2, Calendar, MapPin, ChevronDown, ChevronUp, Briefcase } from "lucide-react";
import ItemActionMenu from "./ItemActionMenu";
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
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm group relative hover:border-blue-200 transition-all">
            {isOwner && (
                <ItemActionMenu
                    onEdit={onEdit}
                    onDelete={onDelete}
                    className="absolute top-4 right-4 z-10"
                />
            )}
            <div className={`flex gap-4 items-start mt-4 ${isExpanded ? '' : 'max-h-32 overflow-hidden'}`}>
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
