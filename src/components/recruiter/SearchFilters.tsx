"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, CheckCircle2, GraduationCap, Award, Briefcase, MapPin, X, Plus, Trash2, Star } from "lucide-react";
import { SECTORS, JOB_ROLES_BY_SECTOR } from "@/lib/taxonomy";

export interface SkillFilter {
    skill: string;
    minYears: string;
    proficiency: string;
}

export interface RecruiterFilters {
    sector: string;
    jobRole: string;
    education: string;
    experienceLevel: string;
    location: string;
    availability: string;
    isVerified: boolean;
    haveLicense: boolean;
    haveCar: boolean;
    certification: string;
    skills: SkillFilter[];
}

interface SearchFiltersProps {
    onFilterChange: (filters: RecruiterFilters) => void;
    searchTerm: string;
    onSearchChange: (val: string) => void;
}

export default function SearchFilters({ onFilterChange, searchTerm, onSearchChange }: SearchFiltersProps) {
    const [filters, setFilters] = useState({
        sector: '',
        jobRole: '',
        education: '',
        experienceLevel: '',
        location: '',
        availability: '',
        isVerified: false,
        haveLicense: false,
        haveCar: false,
        certification: ''
    });

    const [skillFilters, setSkillFilters] = useState<SkillFilter[]>([
        { skill: '', minYears: '', proficiency: '' }
    ]);

    const [showAdvancedSkills, setShowAdvancedSkills] = useState(false);

    const handleFilterChange = (newFilters: any) => {
        const updated = { ...filters, ...newFilters };
        setFilters(updated);
        onFilterChange({ ...updated, skills: skillFilters });
    };

    const addSkillFilter = () => {
        const updated = [...skillFilters, { skill: '', minYears: '', proficiency: '' }];
        setSkillFilters(updated);
        onFilterChange({ ...filters, skills: updated });
    };

    const removeSkillFilter = (index: number) => {
        const updated = skillFilters.filter((_, i) => i !== index);
        setSkillFilters(updated);
        onFilterChange({ ...filters, skills: updated });
    };

    const updateSkillFilter = (index: number, field: string, value: string) => {
        const updated = [...skillFilters];
        (updated[index] as any)[field] = value;
        setSkillFilters(updated);
        onFilterChange({ ...filters, skills: updated });
    };

    const resetFilters = () => {
        const reset = {
            sector: '',
            jobRole: '',
            education: '',
            experienceLevel: '',
            location: '',
            availability: '',
            isVerified: false,
            haveLicense: false,
            haveCar: false,
            certification: ''
        };
        setFilters(reset);
        setSkillFilters([{ skill: '', minYears: '', proficiency: '' }]);
        onFilterChange({ ...reset, skills: [{ skill: '', minYears: '', proficiency: '' }] });
    };

    const availableJobRoles = filters.sector && filters.sector !== 'All'
        ? JOB_ROLES_BY_SECTOR[filters.sector] || ['All']
        : ['All'];

    return (
        <aside className="w-full md:w-80 space-y-6 lg:sticky lg:top-24 h-fit">
            {/* Search Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                        Filters
                    </h2>
                    <button
                        onClick={resetFilters}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        Reset All
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search roles or names..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {/* Main Filter Group */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                    {/* Verified Only */}
                    <label className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100 cursor-pointer group transition-colors hover:bg-blue-50">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            <span className="text-[13px] font-bold text-blue-900">Verified Talent Only</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={filters.isVerified}
                            onChange={(e) => handleFilterChange({ isVerified: e.target.checked })}
                            className="w-4 h-4 accent-blue-600 rounded"
                        />
                    </label>

                    {/* Sector Filter */}
                    <div className="space-y-3">
                        <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            Sector / Industry
                        </h3>
                        <select
                            value={filters.sector}
                            onChange={(e) => handleFilterChange({ sector: e.target.value, jobRole: '' })}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none text-slate-600 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                        >
                            <option value="">Select industry</option>
                            {SECTORS.map(sector => (
                                <option key={sector} value={sector}>{sector}</option>
                            ))}
                        </select>
                    </div>

                    {/* Job Role Filter */}
                    {filters.sector && filters.sector !== 'All' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
                                <Award className="w-4 h-4 text-slate-400" />
                                Specific Job Role
                            </h3>
                            <select
                                value={filters.jobRole}
                                onChange={(e) => handleFilterChange({ jobRole: e.target.value })}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none text-slate-600 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                            >
                                <option value="">Select role</option>
                                {availableJobRoles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Education Level */}
                    <div className="space-y-3">
                        <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-slate-400" />
                            Min Education
                        </h3>
                        <select
                            value={filters.education}
                            onChange={(e) => handleFilterChange({ education: e.target.value })}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none text-slate-600 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                        >
                            <option value="">Any Education</option>
                            <option value="Matric">Matric</option>
                            <option value="Diploma">Diploma</option>
                            <option value="Bachelor's Degree">Bachelor's Degree</option>
                            <option value="Master's Degree">Master's Degree</option>
                        </select>
                    </div>

                    {/* Certifications Filter */}
                    <div className="space-y-3">
                        <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
                            <Award className="w-4 h-4 text-slate-400" />
                            Certifications
                        </h3>
                        <input
                            type="text"
                            value={filters.certification}
                            onChange={(e) => handleFilterChange({ certification: e.target.value })}
                            placeholder="e.g. AWS, Project Management"
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none text-slate-600 focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    {/* Logistics */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between group">
                            <span className="text-sm font-bold text-slate-700 transition-colors group-hover:text-blue-600">Driver's License</span>
                            <input
                                type="checkbox"
                                checked={filters.haveLicense}
                                onChange={(e) => handleFilterChange({ haveLicense: e.target.checked })}
                                className="w-4 h-4 accent-blue-600 rounded"
                            />
                        </div>
                        <div className="flex items-center justify-between group">
                            <span className="text-sm font-bold text-slate-700 transition-colors group-hover:text-blue-600">Own Transport</span>
                            <input
                                type="checkbox"
                                checked={filters.haveCar}
                                onChange={(e) => handleFilterChange({ haveCar: e.target.checked })}
                                className="w-4 h-4 accent-blue-600 rounded"
                            />
                        </div>
                    </div>
                </div>

                {/* Advanced Skill Search Toggle */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <button
                        onClick={() => setShowAdvancedSkills(!showAdvancedSkills)}
                        className={`w-full py-3 px-4 rounded-xl flex items-center justify-between transition-all ${showAdvancedSkills ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                    >
                        <span className="text-xs font-bold uppercase tracking-wider">Advanced Skill Search</span>
                        {showAdvancedSkills ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>

                    {showAdvancedSkills && (
                        <div className="mt-6 space-y-6 animate-in fade-in zoom-in duration-200">
                            {skillFilters.map((filter, index) => (
                                <div key={index} className="p-4 bg-slate-50 rounded-2xl space-y-3 relative group">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requirement #{index + 1}</span>
                                        {skillFilters.length > 1 && (
                                            <button
                                                onClick={() => removeSkillFilter(index)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    <input
                                        type="text"
                                        value={filter.skill}
                                        onChange={(e) => updateSkillFilter(index, 'skill', e.target.value)}
                                        placeholder="Skill (e.g. React)"
                                        className="w-full px-3 py-2 bg-white border border-slate-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />

                                    <div className="grid grid-cols-2 gap-2">
                                        <select
                                            value={filter.minYears}
                                            onChange={(e) => updateSkillFilter(index, 'minYears', e.target.value)}
                                            className="px-2 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Min Exp</option>
                                            {['1+', '2+', '3+', '5+', '10+'].map(y => (
                                                <option key={y} value={y.replace('+', '')}>{y} Years</option>
                                            ))}
                                        </select>
                                        <select
                                            value={filter.proficiency}
                                            onChange={(e) => updateSkillFilter(index, 'proficiency', e.target.value)}
                                            className="px-2 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Level</option>
                                            {['Beginner', 'Intermediate', 'Expert'].map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={addSkillFilter}
                                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-[11px] font-bold text-slate-400 hover:border-blue-200 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Another Requirement
                            </button>
                        </div>
                    )}
                </div>

                {/* Location Filter */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        Location / City
                    </h3>
                    <input
                        type="text"
                        value={filters.location}
                        onChange={(e) => handleFilterChange({ location: e.target.value })}
                        placeholder="e.g. Durban, remote"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none text-slate-600 focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                    />
                </div>
            </div>
        </aside>
    );
}

// Removed duplicate Star import
