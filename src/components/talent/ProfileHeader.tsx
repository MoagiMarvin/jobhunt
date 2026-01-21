"use client";

import { useState, useEffect } from "react";
import { Briefcase, MapPin, Edit2, Mail, Phone, Download, Github, Linkedin, Globe, Car, CreditCard, GraduationCap } from "lucide-react";

interface ProfileHeaderProps {
    name: string;
    headline: string;
    email?: string;
    phone?: string;
    location?: string;
    avatar: string;
    availabilityStatus: "Looking for Work" | "Not Looking";
    github?: string;
    linkedin?: string;
    portfolio?: string;
    haveLicense?: boolean;
    licenseCode?: string;
    haveCar?: boolean;
    educationLevel?: string;
    onEdit?: () => void;
    onDownloadResume?: () => void;
    downloadAction?: React.ReactNode;
    isOwner?: boolean;
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
    educationLevel,
    onEdit,
    onDownloadResume,
    downloadAction,
    isOwner = true
}: ProfileHeaderProps) {
    const [isMounted, setIsMounted] = useState(false);

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
        }
    };

    const status = statusConfig[availabilityStatus] || statusConfig["Not Looking"];

    return (
        <div className="bg-white rounded-xl border-2 border-blue-100 shadow-sm overflow-hidden">
            {/* Background Banner */}
            <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            {/* Content */}
            <div className="px-8 pb-8 -mt-16 relative">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                    {/* Avatar */}
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white shrink-0">
                        {avatar}
                    </div>

                    {/* Info */}
                    <div className="flex-1 pt-4">
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                                <h1 className="text-2xl font-bold text-primary mb-1">{name}</h1>
                                <p className="text-base text-slate-600 font-medium">{headline}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                {isOwner && onEdit && (
                                    <button
                                        onClick={onEdit}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-blue-200 text-blue-600 hover:bg-blue-50 transition-all font-semibold text-xs"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                        Edit Profile
                                    </button>
                                )}
                                {downloadAction ? downloadAction : (onDownloadResume && (
                                    <button
                                        onClick={onDownloadResume}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-slate-800 transition-all font-semibold text-xs shadow-sm"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download Resume
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">
                            {location && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                    {location}
                                </div>
                            )}

                            {email && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                                    {email}
                                </div>
                            )}

                            {phone && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
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
                                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-purple-200 bg-purple-50 text-purple-700 shadow-sm">
                                    <CreditCard className="w-3 h-3" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                        {isMounted && licenseCode ? `License: ${licenseCode}` : "Driver's License"}
                                    </span>
                                </div>
                            )}

                            {haveCar && (
                                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 shadow-sm">
                                    <Car className="w-3 h-3" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Own Transport</span>
                                </div>
                            )}

                            {educationLevel && (
                                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-green-200 bg-green-50 text-green-700 shadow-sm">
                                    <GraduationCap className="w-3 h-3" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{educationLevel}</span>
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
