"use client";

import { useState, useEffect } from "react";
import { Briefcase, MapPin, Edit2, Mail, Phone, Download, Github, Linkedin, Globe, Car, CreditCard, ChevronDown, Share2, Settings } from "lucide-react";

interface ProfileHeaderProps {
    name: string;
    headline: string;
    email?: string;
    phone?: string;
    location?: string;
    avatar: string;
    availabilityStatus: "Looking for Work" | "Not Looking" | "Open to Offers" | "Unavailable";
    github?: string;
    linkedin?: string;
    portfolio?: string;
    haveLicense?: boolean;
    licenseCode?: string;
    haveCar?: boolean;
    onEdit?: () => void;
    onDownloadResume?: () => void;
    downloadAction?: React.ReactNode;
    targetRoles?: string[];
    isOwner?: boolean;
    userId?: string;
    onShare?: () => void;
    isEditMode?: boolean;
}

export default function ProfileHeader({
    name,
    headline,
    email,
    phone,
    location,
    avatar,
    availabilityStatus,
    github,
    linkedin,
    portfolio,
    haveLicense,
    licenseCode,
    haveCar,
    onEdit,
    onDownloadResume,
    downloadAction,
    targetRoles = [],
    isOwner = true,
    userId,
    onShare,
    isEditMode = true, // Default to true now for owner
}: ProfileHeaderProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [isActionsOpen, setIsActionsOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const statusConfig = {
        "Looking for Work": {
            bg: "bg-green-50",
            text: "text-green-700",
            border: "border-green-200",
            dot: "bg-green-500"
        },
        "Not Looking": {
            bg: "bg-slate-50",
            text: "text-slate-600",
            border: "border-slate-200",
            dot: "bg-slate-400"
        },
        "Open to Offers": {
            bg: "bg-blue-50",
            text: "text-blue-700",
            border: "border-blue-200",
            dot: "bg-blue-500"
        },
        "Unavailable": {
            bg: "bg-red-50",
            text: "text-red-700",
            border: "border-red-200",
            dot: "bg-red-500"
        }
    };

    const status = statusConfig[availabilityStatus] || statusConfig["Not Looking"];

    return (
        <div className="bg-white rounded-xl border border-blue-100 md:border-2 shadow-sm overflow-hidden">
            {/* Background Banner */}
            <div className="h-24 md:h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            {/* Content */}
            <div className="px-5 pb-6 md:px-8 md:pb-8 -mt-12 md:-mt-16 relative">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-end">
                    {/* Avatar */}
                    <div className="group/avatar relative">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-xl border-4 border-white shrink-0 overflow-hidden">
                            {avatar && (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('blob:')) ? (
                                <img src={avatar} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                <span>{name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</span>
                            )}
                        </div>

                        {/* Over-Avatar Action Button (Desktop) */}
                        {isOwner && onEdit && (
                            <button
                                onClick={onEdit}
                                className="absolute bottom-1 right-1 p-2 rounded-full bg-blue-600 text-white shadow-lg border-2 border-white hover:bg-blue-700 transition-all transform hover:scale-110 z-10"
                                title="Change Profile Picture"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 pt-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">{name}</h1>
                                </div>
                                <p className="text-[13px] md:text-sm text-slate-500 font-medium leading-relaxed mt-1 mb-3">{headline}</p>

                                {targetRoles.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {targetRoles.map((role, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-blue-100 shadow-sm"
                                            >
                                                Seeking {role}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Header Actions Menu */}
                            <div className="absolute top-0 right-0 md:relative md:top-auto md:right-auto shrink-0 flex items-center gap-2">
                                {isOwner && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsActionsOpen(!isActionsOpen)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all font-bold text-xs shadow-lg group"
                                        >
                                            <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                                            <span>Manage</span>
                                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isActionsOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isActionsOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-20"
                                                    onClick={() => setIsActionsOpen(false)}
                                                ></div>
                                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-30 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                                                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Options</p>
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            setIsActionsOpen(false);
                                                            onEdit?.();
                                                        }}
                                                        className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                        Customize Profile
                                                    </button>

                                                    <div className="py-1">
                                                        {downloadAction ? (
                                                            <div onClick={() => setIsActionsOpen(false)}>{downloadAction}</div>
                                                        ) : (onDownloadResume && (
                                                            <button
                                                                onClick={() => {
                                                                    setIsActionsOpen(false);
                                                                    onDownloadResume();
                                                                }}
                                                                className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                                Download CV
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            setIsActionsOpen(false);
                                                            onShare?.();
                                                        }}
                                                        className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3 border-t border-slate-50"
                                                    >
                                                        <Share2 className="w-4 h-4" />
                                                        Copy Profile Link
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 md:mt-4">
                            {location && (
                                <div className="flex items-center gap-2 text-[11px] text-slate-800 font-bold">
                                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                    {location}
                                </div>
                            )}

                            {email && (
                                <div className="flex items-center gap-2 text-[11px] text-slate-800 font-bold">
                                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                                    {email}
                                </div>
                            )}

                            {phone && (
                                <div className="flex items-center gap-2 text-[11px] text-slate-800 font-bold">
                                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                                    {phone}
                                </div>
                            )}

                            {/* Availability Badge */}
                            <div className={`flex items-center gap-2 px-2.5 py-0.5 rounded-full border ${status.bg} ${status.text} ${status.border}`}>
                                <div className={`w-1 h-1 rounded-full ${status.dot} animate-pulse`}></div>
                                <Briefcase className="w-3 h-3" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{availabilityStatus}</span>
                            </div>

                            {haveLicense && (
                                <div className="flex items-center gap-2 text-[11px] text-slate-800 font-bold">
                                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                                    <span>{isMounted && licenseCode ? `License: ${licenseCode}` : "Drivers License"}</span>
                                </div>
                            )}

                            {haveCar && (
                                <div className="flex items-center gap-2 text-[11px] text-slate-800 font-bold">
                                    <Car className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Own Transport</span>
                                </div>
                            )}

                            {/* Social Links */}
                            <div className="flex items-center gap-2.5 ml-auto">
                                {github && (
                                    <a href={github} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all">
                                        <Github className="w-3.5 h-3.5" />
                                    </a>
                                )}
                                {linkedin && (
                                    <a href={linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all">
                                        <Linkedin className="w-3.5 h-3.5" />
                                    </a>
                                )}
                                {portfolio && (
                                    <a href={portfolio} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all">
                                        <Globe className="w-3.5 h-3.5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
