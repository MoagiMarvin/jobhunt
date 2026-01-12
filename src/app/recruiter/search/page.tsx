"use client";

import { useState, useMemo } from "react";
import SearchFilters, { RecruiterFilters } from "@/components/recruiter/SearchFilters";
import TalentCard from "@/components/recruiter/TalentCard";
import { Users, LayoutGrid, List, Search as SearchIcon, CheckCircle2 } from "lucide-react";

// Diverse Mock Data based on the user's snippet
const MOCK_TALENT = [
    {
        id: "1",
        name: "Thabo Mkhize",
        sector: "Technology & IT",
        headline: "Senior Full Stack Developer",
        location: "Johannesburg",
        avatar: "TM",
        topSkills: ["React", "Node.js", "MongoDB", "TypeScript", "AWS"],
        experienceYears: 5,
        education: "Bachelor's Degree",
        isVerified: true,
        targetRoles: ["Full Stack Developer", "Software Lead"],
        haveLicense: true,
        haveCar: true,
        availabilityStatus: "Immediate",
        certifications: ["AWS Certified Developer", "React Professional"],
        skillsDetailed: [
            { name: "React", years: 5, proficiency: "Expert" },
            { name: "Node.js", years: 4, proficiency: "Expert" },
            { name: "MongoDB", years: 3, proficiency: "Intermediate" }
        ]
    },
    {
        id: "2",
        name: "Nomsa Dlamini",
        sector: "Healthcare & Medical Services",
        headline: "Registered Nurse | ICU Specialist",
        location: "Durban",
        avatar: "ND",
        topSkills: ["Patient Care", "Emergency Response", "ICU", "Clinical Audit"],
        experienceYears: 3,
        education: "Diploma",
        isVerified: true,
        targetRoles: ["Registered Nurse", "Clinical Nurse"],
        haveLicense: true,
        haveCar: false,
        availabilityStatus: "2 weeks notice",
        certifications: ["Advanced Nursing Diploma", "BLS Certification"],
        skillsDetailed: [
            { name: "Patient Care", years: 3, proficiency: "Expert" },
            { name: "Emergency Response", years: 2, proficiency: "Intermediate" },
            { name: "ICU", years: 1, proficiency: "Beginner" }
        ]
    },
    {
        id: "3",
        name: "Sipho Ndlovu",
        sector: "Transport & Logistics",
        headline: "Professional Driver (Code 14)",
        location: "Cape Town",
        avatar: "SN",
        topSkills: ["Code 14 License", "Route Planning", "Fleet Management", "Safety First"],
        experienceYears: 8,
        education: "Matric",
        isVerified: true,
        targetRoles: ["Truck Driver", "Fleet Supervisor"],
        haveLicense: true,
        haveCar: true,
        availabilityStatus: "Immediate",
        certifications: ["PDP License", "First Aid L1"],
        skillsDetailed: [
            { name: "Code 14 License", years: 8, proficiency: "Expert" },
            { name: "GPS Navigation", years: 8, proficiency: "Expert" },
            { name: "Route Planning", years: 8, proficiency: "Expert" }
        ]
    },
    {
        id: "4",
        name: "Lerato Mokoena",
        sector: "Finance & Accounting",
        headline: "Financial Analyst | Master's Graduate",
        location: "Pretoria",
        avatar: "LM",
        topSkills: ["Financial Modeling", "Excel", "SAP", "Internal Audit"],
        experienceYears: 4,
        education: "Master's Degree",
        isVerified: true,
        targetRoles: ["Financial Analyst", "Accountant"],
        haveLicense: true,
        haveCar: true,
        availabilityStatus: "1 month notice",
        certifications: ["CFA Level 1", "ACCA Foundation"],
        skillsDetailed: [
            { name: "Financial Modeling", years: 4, proficiency: "Expert" },
            { name: "Excel", years: 6, proficiency: "Expert" },
            { name: "SAP", years: 3, proficiency: "Intermediate" }
        ]
    },
    {
        id: "5",
        name: "Mandla Zulu",
        sector: "Security Services",
        headline: "Security Officer | PSIRA Grade A",
        location: "Johannesburg",
        avatar: "MZ",
        topSkills: ["Access Control", "CCTV Monitoring", "Risk Assessment", "Tactical Response"],
        experienceYears: 4,
        education: "Matric",
        isVerified: false,
        targetRoles: ["Security Officer", "Security Supervisor"],
        haveLicense: true,
        haveCar: false,
        availabilityStatus: "Immediate",
        certifications: ["Grade A PSIRA", "Firearm Competency"],
        skillsDetailed: [
            { name: "PSIRA Registered", years: 4, proficiency: "Expert" },
            { name: "Access Control", years: 4, proficiency: "Expert" },
            { name: "CCTV Monitoring", years: 3, proficiency: "Intermediate" }
        ]
    },
    {
        id: "6",
        name: "Precious Mahlangu",
        sector: "Hospitality & Tourism",
        headline: "Head Chef | Culinary Arts Specialist",
        location: "Cape Town",
        avatar: "PM",
        topSkills: ["Menu Planning", "Kitchen Management", "Food Safety", "Fine Dining"],
        experienceYears: 7,
        education: "Diploma",
        isVerified: true,
        targetRoles: ["Head Chef", "Sous Chef"],
        haveLicense: true,
        haveCar: true,
        availabilityStatus: "2 weeks notice",
        certifications: ["Culinary Arts Certificate", "Food Safety L3"],
        skillsDetailed: [
            { name: "Menu Planning", years: 7, proficiency: "Expert" },
            { name: "Kitchen Management", years: 5, proficiency: "Expert" },
            { name: "Food Safety", years: 7, proficiency: "Expert" }
        ]
    }
];

export default function RecruiterSearchPage() {
    const [viewType, setViewType] = useState<"grid" | "list">("grid");
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<RecruiterFilters>({
        sector: '',
        jobRole: '',
        education: '',
        experienceLevel: '',
        location: '',
        availability: '',
        isVerified: false,
        haveLicense: false,
        haveCar: false,
        certification: '',
        skills: []
    });

    const filteredTalents = useMemo(() => {
        return MOCK_TALENT.filter(talent => {
            // Text Search
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                talent.name.toLowerCase().includes(searchLower) ||
                talent.headline.toLowerCase().includes(searchLower) ||
                talent.topSkills.some(s => s.toLowerCase().includes(searchLower));

            if (!matchesSearch) return false;

            // Categorical Filters
            if (filters.isVerified && !talent.isVerified) return false;
            if (filters.sector && filters.sector !== 'All' && talent.sector !== filters.sector) return false;
            // Job Role check: if specific role is selected (and not 'All'), talent must have it in targetRoles
            if (filters.jobRole && filters.jobRole !== 'All' && !talent.targetRoles.includes(filters.jobRole)) return false;
            if (filters.haveLicense && !talent.haveLicense) return false;
            if (filters.haveCar && !talent.haveCar) return false;
            if (filters.location && !talent.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
            if (filters.education && talent.education !== filters.education) return false;

            // Certification Filter
            if (filters.certification) {
                const certLower = filters.certification.toLowerCase();
                const hasCert = talent.certifications?.some(c => c.toLowerCase().includes(certLower));
                if (!hasCert) return false;
            }

            // Advanced Skill Filtering
            if (filters.skills && filters.skills.some(s => s.skill)) {
                return filters.skills.every(f => {
                    if (!f.skill) return true;
                    const talentSkill = talent.skillsDetailed?.find(ts => ts.name.toLowerCase().includes(f.skill.toLowerCase()));
                    if (!talentSkill) return false;

                    if (f.minYears) {
                        const min = parseInt(f.minYears);
                        if (talentSkill.years < min) return false;
                    }
                    if (f.proficiency && talentSkill.proficiency !== f.proficiency) return false;

                    return true;
                });
            }

            return true;
        });
    }, [searchTerm, filters]);

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-12 pt-24">
                {/* Simplified Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Talent Marketplace</h1>
                    <p className="text-slate-600">Browse and filter for top-tier verified talent across South Africa.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <SearchFilters
                        onFilterChange={setFilters}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                    />

                    {/* Results Area */}
                    <div className="flex-1 space-y-6">
                        {/* Top Search Bar (Smart Move) */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="relative">
                                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by role, name, or key skills..."
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-base focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700"
                                />
                            </div>
                        </div>

                        {/* Results Count & View Toggle */}
                        <div className="flex items-center justify-between bg-white p-3 px-4 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Found <span className="font-bold text-slate-900">{filteredTalents.length}</span> candidates
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setViewType("grid")}
                                    className={`p-1.5 rounded-lg transition-all ${viewType === "grid" ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "text-slate-400 hover:bg-slate-50"}`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewType("list")}
                                    className={`p-1.5 rounded-lg transition-all ${viewType === "list" ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "text-slate-400 hover:bg-slate-50"}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Talent Grid */}
                        {filteredTalents.length > 0 ? (
                            <div className={viewType === "grid" ? "grid md:grid-cols-1 xl:grid-cols-2 gap-6" : "space-y-4"}>
                                {filteredTalents.map((talent) => (
                                    <TalentCard key={talent.id} talent={talent as any} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                                    <SearchIcon className="w-8 h-8 text-slate-200" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">No candidates found</h3>
                                <p className="text-slate-500 max-w-xs mx-auto">Try adjusting your filters or searching for different keywords.</p>
                                <button
                                    onClick={() => { setSearchTerm(""); window.location.reload(); }}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}

                        {/* Pagination / Load More */}
                        {filteredTalents.length > 0 && (
                            <div className="pt-8 flex justify-center">
                                <button className="px-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                                    Load More Candidates
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
