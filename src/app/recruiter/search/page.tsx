"use client";

import { useState } from "react";
import SearchFilters from "@/components/recruiter/SearchFilters";
import TalentCard from "@/components/recruiter/TalentCard";
import { Users, Filter, LayoutGrid, List } from "lucide-react";
import Link from "next/link";

// Mock Data for initial UI development
const MOCK_TALENT = [
    {
        id: "1",
        name: "Moagi Marvin",
        headline: "Computer Science Graduate | Full-Stack Developer",
        location: "Johannesburg",
        avatar: "MM",
        topSkills: ["React", "TypeScript", "Python", "Node.js", "AWS"],
        experienceYears: 1,
        education: "Bachelor's Degree",
        isVerified: true,
        targetRoles: ["Full Stack Developer", "Software Intern"],
        haveLicense: true,
        availabilityStatus: "Looking for Work"
    },
    {
        id: "2",
        name: "Lindiwe Dlamini",
        headline: "Chartered Accountant (SA) | Audit & Assurance",
        location: "Cape Town",
        avatar: "LD",
        topSkills: ["IFRS", "Financial Modeling", "Corporate Tax", "Internal Audit"],
        experienceYears: 3,
        education: "Honours Degree",
        isVerified: true,
        targetRoles: ["Accountant", "External Auditor"],
        haveLicense: true,
        availabilityStatus: "Looking for Work"
    },
    {
        id: "3",
        name: "Sipho Zulu",
        headline: "Marketing Graduate | Brand Strategy & Digital Content",
        location: "Durban",
        avatar: "SZ",
        topSkills: ["SEO", "Content Marketing", "Adobe Creative Suite", "Meta Ads"],
        experienceYears: 1,
        education: "Bachelor's Degree",
        isVerified: true,
        targetRoles: ["Marketing Coordinator", "Social Media Manager"],
        haveLicense: true,
        availabilityStatus: "Looking for Work"
    },
    {
        id: "4",
        name: "Katlego Motaung",
        headline: "Legal Researcher | LLB Graduate",
        location: "Pretoria",
        avatar: "KM",
        topSkills: ["Legal Writing", "Case Research", "Litigation Support", "Contract Law"],
        experienceYears: 1,
        education: "Bachelor's Degree",
        isVerified: false,
        targetRoles: ["Candidate Attorney", "Legal Assistant"],
        haveLicense: true,
        availabilityStatus: "Looking for Work"
    },
    {
        id: "5",
        name: "Sarah Jenkins",
        headline: "Human Resources Coordinator | Employee Relations",
        location: "Johannesburg",
        avatar: "SJ",
        topSkills: ["Payroll Management", "Interviewing", "Onboarding", "Labor Law"],
        experienceYears: 2,
        education: "Bachelor's Degree",
        isVerified: true,
        targetRoles: ["HR Officer", "Recruitment Consultant"],
        haveLicense: true,
        availabilityStatus: "Looking for Work"
    },
    {
        id: "6",
        name: "Thabo Molefe",
        headline: "Supply Chain Analyst | Logistics Specialist",
        location: "Johannesburg",
        avatar: "TM",
        topSkills: ["Inventory Management", "ERP Systems", "Procurement", "Data Analysis"],
        experienceYears: 2,
        education: "Bachelor's Degree",
        isVerified: false,
        targetRoles: ["Logistics Coordinator", "Supply Chain Analyst"],
        haveLicense: true,
        availabilityStatus: "Looking for Work"
    }
];

export default function RecruiterSearchPage() {
    const [viewType, setViewType] = useState<"grid" | "list">("grid");

    return (
        <main className="min-h-screen bg-slate-50/50">

            <div className="max-w-7xl mx-auto px-6 py-10 pt-24">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                <Users className="w-6 h-6" />
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Talent Marketplace</h1>
                        </div>
                        <p className="text-slate-500 font-medium">Discover and connect with top-tier verified graduates across South Africa.</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                        <button
                            onClick={() => setViewType("grid")}
                            className={`p-2 rounded-xl transition-all ${viewType === "grid" ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewType("grid")} // List view would be similar
                            className={`p-2 rounded-xl transition-all ${viewType === "list" ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <SearchFilters />

                    {/* Results Area */}
                    <div className="flex-1 space-y-6">
                        {/* Results Count & Sort */}
                        <div className="flex items-center justify-between mb-4 px-2">
                            <p className="text-sm font-bold text-slate-700">
                                Showing <span className="text-blue-600">{MOCK_TALENT.length}</span> candidates found
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort by:</span>
                                <select className="bg-transparent border-none text-sm font-bold text-blue-600 focus:ring-0 cursor-pointer">
                                    <option>Most Relevant</option>
                                    <option>Newest Members</option>
                                    <option>Experience (High-Low)</option>
                                </select>
                            </div>
                        </div>

                        {/* Talent Grid */}
                        <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-6">
                            {MOCK_TALENT.map((talent) => (
                                <TalentCard key={talent.id} talent={talent} />
                            ))}
                        </div>

                        {/* Pagination / Load More */}
                        <div className="pt-10 flex justify-center">
                            <button className="px-8 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-600 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm">
                                Load More Candidates
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
