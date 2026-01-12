"use client";

import { MapPin, Briefcase, GraduationCap, CheckCircle2, Star, Download, Mail, Search, Award } from "lucide-react";

interface TalentSkill {
    name: string;
    years: number;
    proficiency: string;
}

interface TalentCardProps {
    talent: {
        id: string;
        name: string;
        sector: string;
        headline: string;
        location: string;
        avatar: string;
        topSkills: string[];
        experienceYears: number;
        education: string;
        isVerified: boolean;
        targetRoles: string[];
        haveLicense: boolean;
        haveCar: boolean;
        availabilityStatus: string;
        certifications?: string[];
        skillsDetailed?: TalentSkill[];
    };
}

export default function TalentCard({ talent }: TalentCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition-all group overflow-hidden flex flex-col md:flex-row gap-6">
            {/* Left Column: Avatar & Basic Info */}
            <div className="flex flex-col items-center gap-3">
                <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400 border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        {talent.avatar}
                    </div>
                    {talent.isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md border border-slate-100">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        </div>
                    )}
                </div>

                <div className="space-y-1.5 w-full">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {talent.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        {talent.experienceYears} Years Exp
                    </div>
                </div>
            </div>

            {/* Right Column: Info & Actions */}
            <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {talent.name}
                        </h3>
                        <p className="text-sm font-medium text-slate-500">{talent.headline}</p>
                    </div>

                    <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                        {talent.sector}
                    </div>
                </div>

                {/* Education & Role Chips */}
                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-600">{talent.education}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-600">{talent.targetRoles[0]}</span>
                    </div>
                    {talent.haveCar && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg border border-green-100 text-green-700">
                            <Search className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-bold">Own Vehicle</span>
                        </div>
                    )}
                    {/* Certifications Display */}
                    {talent.certifications && talent.certifications.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {talent.certifications.map((cert, i) => (
                                <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg border border-amber-100 text-[10px] font-bold text-amber-700">
                                    <Award className="w-3 h-3" />
                                    {cert}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Skills Section */}
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Key Competencies</p>
                    <div className="flex flex-wrap gap-2">
                        {(talent.skillsDetailed || talent.topSkills).slice(0, 4).map((skill, idx) => {
                            const isDetailed = typeof skill === 'object';
                            const name = isDetailed ? (skill as TalentSkill).name : skill as string;
                            const level = isDetailed ? (skill as TalentSkill).proficiency : null;

                            return (
                                <div key={idx} className="flex items-center gap-2 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600">
                                    {name}
                                    {level && (
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider ${level === 'Expert' ? 'bg-blue-600 text-white' :
                                            level === 'Intermediate' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {level}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <button className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all">
                        Profile
                    </button>
                    <button className="flex-[2] py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group/btn">
                        <Mail className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" />
                        Contact
                    </button>
                    <button className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl border border-slate-200 transition-all">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
