"use client";

import { MapPin, Briefcase, GraduationCap, Award, CheckCircle2, Star, CreditCard, ExternalLink } from "lucide-react";

interface TalentCardProps {
    talent: {
        id: string;
        name: string;
        headline: string;
        location: string;
        avatar: string;
        topSkills: string[];
        experienceYears: number;
        education: string;
        isVerified: boolean;
        targetRoles: string[];
        haveLicense: boolean;
        availabilityStatus: string;
    };
}

export default function TalentCard({ talent }: TalentCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform">
                        {talent.avatar}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-slate-900">{talent.name}</h3>
                            {talent.isVerified && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Verified
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-slate-600 font-medium line-clamp-1">{talent.headline}</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-blue-500" />
                                {talent.location}
                            </span>
                            <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-blue-500" />
                                {talent.experienceYears} Years Exp
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${talent.availabilityStatus === "Looking for Work"
                            ? "bg-green-50 text-green-600 border border-green-100"
                            : "bg-slate-50 text-slate-400 border border-slate-100"
                        }`}>
                        {talent.availabilityStatus}
                    </span>
                    {talent.haveLicense && (
                        <div className="text-blue-500" title="Valid License">
                            <CreditCard className="w-4 h-4" />
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {/* Information Grid */}
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-50">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                        <span className="text-[11px] font-semibold text-slate-700 truncate">{talent.education}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        <span className="text-[11px] font-semibold text-slate-700 truncate">{talent.targetRoles[0]}</span>
                    </div>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-1.5">
                    {talent.topSkills.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate-50 text-slate-600 rounded-md text-[10px] font-bold border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                            {skill}
                        </span>
                    ))}
                    {talent.topSkills.length > 4 && (
                        <span className="px-2 py-1 text-slate-400 text-[10px] font-bold">
                            +{talent.topSkills.length - 4} more
                        </span>
                    )}
                </div>

                {/* Footer Action */}
                <button className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 text-[11px] font-bold transition-all flex items-center justify-center gap-2 border border-slate-100 hover:border-blue-700">
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Full Profile
                </button>
            </div>
        </div>
    );
}
