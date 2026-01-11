"use client";

import { Search, SlidersHorizontal, ChevronDown, CheckCircle2, GraduationCap, Award, Briefcase, MapPin, X } from "lucide-react";

export default function SearchFilters() {
    return (
        <aside className="w-full md:w-80 space-y-6 lg:sticky lg:top-8 h-fit">
            {/* Search Header */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                        Filters
                    </h2>
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Reset All</button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search for roles or names..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                    />
                </div>
            </div>

            {/* Filter Groups */}
            <div className="space-y-4">
                {/* Core Filters */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
                    {/* Verified Only */}
                    <label className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100 cursor-pointer group">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            <span className="text-[13px] font-bold text-blue-900">Verified Talent Only</span>
                        </div>
                        <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded" />
                    </label>

                    {/* Job Role */}
                    <div className="space-y-3">
                        <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            Job Role
                        </h3>
                        <div className="space-y-2">
                            {["Accountant", "Marketing Specialist", "Software Developer", "HR Coordinator", "Legal Assistant"].map((role) => (
                                <label key={role} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 cursor-pointer transition-colors px-1">
                                    <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded border-slate-300" />
                                    <span className="font-medium">{role}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Specialization / Skills */}
                    <div className="space-y-3">
                        <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
                            <Award className="w-4 h-4 text-slate-400" />
                            Key Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {["Financial Audit", "React", "Digital Marketing", "Research", "Project Management", "IFRS"].map((skill) => (
                                <button key={skill} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all">
                                    {skill}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Education */}
                    <div className="space-y-3">
                        <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-slate-400" />
                            Education Level
                        </h3>
                        <select className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none text-slate-600">
                            <option value="">Any Education</option>
                            <option value="diploma">Diploma</option>
                            <option value="degree">Bachelor's Degree</option>
                            <option value="honours">Honours / Masters</option>
                            <option value="phd">PhD</option>
                        </select>
                    </div>

                    {/* Additional Options */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-700">Driver's License</span>
                            <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-700">Own Transport</span>
                            <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded" />
                        </div>
                    </div>
                </div>

                {/* Location Filter */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        Preferred Location
                    </h3>
                    <div className="space-y-2">
                        {["Remote", "Johannesburg", "Cape Town", "Durban"].map((loc) => (
                            <label key={loc} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 cursor-pointer transition-colors px-1">
                                <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded border-slate-300" />
                                <span className="font-medium">{loc}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}
