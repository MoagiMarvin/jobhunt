"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProfileHeader from "@/components/talent/ProfileHeader";
import ProjectCard from "@/components/talent/ProjectCard";
import CredentialCard from "@/components/talent/CredentialCard";
import ExperienceCard from "@/components/talent/ExperienceCard";
import ReferenceCard from "@/components/talent/ReferenceCard";
import SecondaryEducationCard from "@/components/talent/SecondaryEducationCard";
import DownloadResumeButton from "@/components/pdf/DownloadResumeButton";
import { Loader2, FileText, FolderKanban, Building2, Languages, Award, Briefcase, School, MessageSquare, Layers, GraduationCap, User } from "lucide-react";
import Link from "next/link";

interface WorkExperience {
    id: string;
    company: string;
    position: string;
    description: string;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
}

interface Project {
    id: string;
    title: string;
    description: string;
    technologies: string[];
    link: string;
    image_url: string | null;
}

interface Qualification {
    id: string;
    type: 'high_school' | 'tertiary' | 'certification' | string;
    title: string;
    institution: string;
    year: number | null;
    start_date: string | null;
    end_date: string | null;
    qualification_level: string | null;
    is_verified: boolean;
    document_url: string | null;
}

interface UIExperience {
    id: string;
    role: string;
    company: string;
    duration: string;
    description: string;
}

interface UIProject {
    id: string;
    title: string;
    description: string;
    technologies: string[];
    github_url: string;
    image_url: string;
}

interface UIQualification {
    id: string;
    title: string;
    issuer: string;
    date: string;
    qualification_level: string | null;
    document_url: string | null;
    isVerified: boolean;
}

interface TalentSkill {
    id?: string;
    name: string;
    minYears?: number;
    category?: string;
    isSoftSkill?: boolean;
}

interface Language {
    id: string;
    language: string;
    proficiency: string;
}

interface Reference {
    id: string;
    name: string;
    relationship: string;
    company: string;
    phone: string;
    email: string;
}

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [user, setUser] = useState({
        name: "",
        email: "",
        phone: "",
        avatar: "",
        headline: "",
        location: "",
        availabilityStatus: "Not Looking" as any,
        targetRoles: [] as string[],
        github: "",
        linkedin: "",
        portfolio: "",
        haveLicense: false,
        licenseCode: "",
        haveCar: false,
        summary: ""
    });

    const [skills, setSkills] = useState<TalentSkill[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [projectsList, setProjectsList] = useState<UIProject[]>([]);
    const [experiences, setExperiences] = useState<UIExperience[]>([]);
    const [educationList, setEducationList] = useState<UIQualification[]>([]);
    const [certificationsList, setCertificationsList] = useState<UIQualification[]>([]);
    const [references, setReferences] = useState<Reference[]>([]);
    const [matricData, setMatricData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPublicData = async () => {
            if (!userId) return;
            setIsLoading(true);
            try {
                // Fetch basic profile
                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", userId)
                    .single();

                if (profileError) throw profileError;

                if (profile) {
                    setUser({
                        name: profile.full_name || "",
                        email: profile.email || "",
                        phone: profile.phone || "",
                        summary: profile.summary || "",
                        linkedin: profile.linkedin_url || "",
                        github: profile.github_url || "",
                        portfolio: profile.portfolio_url || "",
                        headline: profile.headline || "",
                        location: profile.location || "",
                        availabilityStatus: profile.availability_status || "Not Looking",
                        targetRoles: profile.target_roles || [],
                        haveLicense: profile.have_license,
                        licenseCode: profile.license_code || "",
                        haveCar: profile.have_car,
                        avatar: profile.avatar_url || "",
                    });
                }

                // Fetch work experiences
                const { data: dbExperiences } = await supabase
                    .from("work_experiences")
                    .select("*")
                    .eq("user_id", userId)
                    .order("start_date", { ascending: false });

                if (dbExperiences) {
                    setExperiences(dbExperiences.map((exp: any) => ({
                        id: exp.id,
                        role: exp.position,
                        company: exp.company,
                        duration: exp.is_current
                            ? `${formatDate(exp.start_date)} - Present`
                            : `${formatDate(exp.start_date)} - ${formatDate(exp.end_date)}`,
                        description: exp.description || ""
                    })));
                }

                // Fetch projects
                const { data: dbProjects } = await supabase
                    .from("projects")
                    .select("*")
                    .eq("user_id", userId);

                if (dbProjects) {
                    setProjectsList(dbProjects.map((proj: any) => ({
                        id: proj.id,
                        title: proj.title,
                        description: proj.description || "",
                        technologies: proj.technologies || [],
                        github_url: proj.link || "",
                        image_url: proj.image_url || "/mock/cv-project.jpg",
                    })));
                }

                // Fetch Qualifications
                const { data: qData } = await supabase
                    .from("qualifications")
                    .select("*")
                    .eq("user_id", userId)
                    .order("year", { ascending: false });

                if (qData) {
                    const typedQData = qData as Qualification[];
                    const matric = typedQData.find((q: Qualification) => q.type === 'high_school');
                    if (matric) {
                        setMatricData({
                            id: matric.id,
                            schoolName: matric.institution,
                            completionYear: matric.year
                        });
                    }

                    setEducationList(typedQData.filter((q: Qualification) => q.type !== 'certification' && q.type !== 'high_school').map((q: Qualification) => ({
                        id: q.id,
                        title: q.title,
                        issuer: q.institution,
                        date: q.year?.toString() || "",
                        qualification_level: q.qualification_level || null,
                        document_url: q.document_url || "",
                        isVerified: q.is_verified
                    })));

                    setCertificationsList(typedQData.filter((q: Qualification) => q.type === 'certification').map((q: Qualification) => ({
                        id: q.id,
                        title: q.title,
                        issuer: q.institution,
                        date: q.year?.toString() || "",
                        qualification_level: q.qualification_level || null,
                        document_url: q.document_url || "",
                        isVerified: q.is_verified
                    })));
                }

                // Fetch skills
                const { data: dbSkills } = await supabase
                    .from("skills")
                    .select("*")
                    .eq("user_id", userId);
                if (dbSkills) {
                    setSkills(dbSkills.map((s: any) => ({
                        id: s.id,
                        name: s.name,
                        minYears: s.min_experience_years || 0,
                        category: s.category || (s.is_soft_skill ? "Soft Skills" : "Other Skills"),
                        isSoftSkill: s.is_soft_skill || s.category === "Soft Skills"
                    })));
                }

                // Fetch languages
                const { data: dbLangs } = await supabase
                    .from("languages")
                    .select("*")
                    .eq("user_id", userId);
                if (dbLangs) setLanguages(dbLangs);

                // Fetch references
                const { data: dbRefs } = await supabase
                    .from("references")
                    .select("*")
                    .eq("user_id", userId);
                if (dbRefs) setReferences(dbRefs);

            } catch (err: any) {
                console.error("Error fetching public profile:", err);
                setError(err.message || "Profile not found");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPublicData();
    }, [userId]);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "";
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } catch { return ""; }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
                    <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Vita...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl max-w-md text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h1>
                    <p className="text-slate-500 mb-6">The profile you're looking for doesn't exist or is currently unavailable.</p>
                    <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const fullProfileData = {
        user: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            summary: user.summary,
            linkedin: user.linkedin,
            github: user.github,
            portfolio: user.portfolio,
            headline: user.headline,
            location: user.location,
            availabilityStatus: user.availabilityStatus,
            haveLicense: user.haveLicense,
            licenseCode: user.licenseCode,
            haveCar: user.haveCar,
            avatar: user.avatar,
        },
        skills,
        experiences,
        projectsList,
        educationList,
        certificationsList,
        references,
        matricData
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="max-w-6xl mx-auto px-2.5 py-4 md:px-6 md:py-12">
                {/* Header */}
                <div className="mb-8">
                    <ProfileHeader
                        {...user}
                        isOwner={false}
                        downloadAction={
                            <DownloadResumeButton
                                data={fullProfileData}
                                showCustomize={false}
                                variant="button"
                            />
                        }
                    />
                </div>

                {/* Summary */}
                {user.summary && (
                    <div className="mb-8 bg-white rounded-2xl border border-slate-100 p-5 md:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                <FileText className="w-4 h-4" />
                            </div>
                            <h2 className="text-base md:text-lg font-semibold text-slate-800 tracking-tight">Professional Summary</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                            {user.summary}
                        </p>
                    </div>
                )}

                <div className="space-y-8">
                    {/* Projects */}
                    {projectsList.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <FolderKanban className="w-5 h-5 text-blue-500" />
                                <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">Projects</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {projectsList.map((project, idx) => (
                                    <ProjectCard key={idx} {...project} isOwner={false} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Experience */}
                    {experiences.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-500" />
                                <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">Experience</h2>
                            </div>
                            <div className="space-y-4">
                                {experiences.map((exp, idx) => (
                                    <ExperienceCard key={idx} {...exp} isOwner={false} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Technical Skills */}
                    {skills.some(s => !s.isSoftSkill) && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Layers className="w-5 h-5 text-blue-500" />
                                <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">Technical Skills</h2>
                            </div>
                            <div className="p-4 md:p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex flex-wrap gap-2">
                                    {skills.filter(s => !s.isSoftSkill).map((skill, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl transition-all font-medium">
                                            <span className="text-sm text-slate-700">{skill.name}</span>
                                            {(skill.minYears ?? 0) > 0 && (
                                                <span className="text-[10px] text-blue-600 font-black bg-blue-100/50 px-1.5 rounded tracking-tighter">
                                                    {skill.minYears}Y
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {educationList.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-blue-500" />
                                <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">Tertiary Education</h2>
                            </div>
                            <div className="space-y-4">
                                {educationList.map((edu, idx) => (
                                    <CredentialCard key={idx} type="education" {...edu} qualification_level={edu.qualification_level || undefined} document_url={edu.document_url || undefined} isOwner={false} viewerRole="public" />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Matric */}
                    {matricData && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <School className="w-5 h-5 text-blue-500" />
                                <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">Matric</h2>
                            </div>
                            <SecondaryEducationCard {...matricData} isOwner={false} />
                        </div>
                    )}

                    {/* Certifications */}
                    {certificationsList.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-blue-500" />
                                <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">Certifications</h2>
                            </div>
                            <div className="space-y-4">
                                {certificationsList.map((cert, idx) => (
                                    <CredentialCard key={idx} type="certification" {...cert} qualification_level={cert.qualification_level || undefined} document_url={cert.document_url || undefined} isOwner={false} viewerRole="public" />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* References */}
                    {references.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-500" />
                                <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">Professional References</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {references.map((ref, idx) => (
                                    <ReferenceCard key={idx} {...ref} isOwner={false} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200 text-center">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Powered by VitaHunt</p>
                    <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-600 font-bold hover:border-blue-300 hover:text-blue-600 transition-all">
                        Create Your Own Vita
                    </Link>
                </div>
            </div>
        </main>
    );
}

function X(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}
