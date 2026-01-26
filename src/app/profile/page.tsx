"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Sparkles, User, Mail, Phone, LogOut, Edit2, Save, X, Loader2, GraduationCap, FolderKanban, Plus, Building2, Languages, Award, Briefcase, School } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProfileHeader from "@/components/talent/ProfileHeader";
import ProjectCard from "@/components/talent/ProjectCard";
import CredentialCard from "@/components/talent/CredentialCard";
import ExperienceCard from "@/components/talent/ExperienceCard";
import EditProfileModal from "@/components/talent/EditProfileModal";
import AddSkillModal, { TalentSkill } from "@/components/talent/AddSkillModal";
import AddCredentialModal from "@/components/talent/AddCredentialModal";
import AddProjectModal from "@/components/talent/AddProjectModal";
import EditSummaryModal from "@/components/talent/EditSummaryModal";
import DownloadResumeButton from "@/components/pdf/DownloadResumeButton";
import ReferenceCard from "@/components/talent/ReferenceCard";
import AddReferenceModal from "@/components/talent/AddReferenceModal";
import SecondaryEducationCard from "@/components/talent/SecondaryEducationCard";
import AddSecondaryEducationModal from "@/components/talent/AddSecondaryEducationModal";
import AddExperienceModal from "@/components/talent/AddExperienceModal";

export default function ProfilePage() {
    const router = useRouter();

    const [user, setUser] = useState({
        name: "Moagi Marvin",
        email: "moagi@example.com",
        phone: "+27 61 234 5678",
        avatar: "MM",
        headline: "Computer Science Graduate | Full-Stack Developer",
        location: "Johannesburg, South Africa",
        availabilityStatus: "Looking for Work" as "Looking for Work" | "Not Looking",
        targetRoles: ["Full Stack Developer", "AI Engineer", "Software Intern"],
        github: "https://github.com/moagi",
        linkedin: "https://linkedin.com/in/moagi",
        portfolio: "https://moagi.dev",
        haveLicense: true,
        licenseCode: "Code 8 / B",
        haveCar: true,
        summary: "Passionate Computer Science graduate with a strong foundation in full-stack development. Experienced in building scalable web applications using React, Node.js, and cloud technologies. Eager to contribute to innovative projects and continue learning in a fast-paced environment."
    });

    const [skills, setSkills] = useState<(string | TalentSkill)[]>([
        { name: "React", minYears: 1, level: "Advanced" },
        { name: "TypeScript", minYears: 1, level: "Intermediate" },
        "Public Speaking",
        "Agile Methodology"
    ]);

    const [languages, setLanguages] = useState([
        { language: "English", proficiency: "Native" },
        { language: "Zulu", proficiency: "Fluent" },
        { language: "Afrikaans", proficiency: "Basic" }
    ]);

    // Mock Talent Profile Data
    const [projectsList, setProjectsList] = useState([
        {
            title: "AI CV Optimizer",
            description: "Built with Next.js and Gemini AI to help students optimize their career paths.",
            technologies: ["Next.js", "Gemini AI", "Tailwind"],
            github_url: "https://github.com",
            image_url: "/mock/cv-project.jpg",
            topSkills: ["React", "Next.js", "Framer Motion", "TailwindCSS"],
            experienceYears: 2,
            education: "Bachelor's Degree",
            isVerified: true,
        },
        {
            title: "Talent Marketplace",
            description: "A platform for connecting verified graduates with recruiters in South Africa.",
            technologies: ["React", "Supabase", "TypeScript"],
            link_url: "https://talent.example.com",
            image_url: "/mock/talent-project.jpg"
        },
        {
            title: "Portfolio Website",
            description: "Personal portfolio showcasing modern design and clean animations.",
            technologies: ["Framer Motion", "React", "PostCSS"],
            github_url: "https://github.com",
            topSkills: ["Figma", "Design Systems", "User Research", "Prototyping"],
            experienceYears: 3,
            education: "Diploma",
            isVerified: true,
        },
        {
            title: "E-commerce App",
            description: "Mobile-first electronics store for local businesses.",
            technologies: ["ReactNative", "Stripe", "Firebase"],
            image_url: "/mock/shop.jpg",
            topSkills: ["React Native", "Flutter", "Firebase", "Redux"],
            experienceYears: 2,
            education: "Bachelor's Degree",
            isVerified: false,
        }
    ]);

    // Mock Experience Data
    const [experiences, setExperiences] = useState([
        {
            role: "Full Stack Intern",
            company: "Tech StartUp SA",
            duration: "Jun 2024 - Present",
            description: "Developed and maintained several React-based dashboards and integrated Supabase for real-time data sync."
        },
        {
            role: "Open Source Contributor",
            company: "GitHub / Community",
            duration: "2023 - 2024",
            description: "Mentored 3 junior developers and improved documentation for a popular UI library used by 2k+ developers."
        }
    ]);

    const [educationList, setEducationList] = useState([
        {
            title: "BSc Computer Science",
            issuer: "University of Johannesburg",
            date: "2021 - 2024",
            qualification_level: "Bachelor's Degree",
            document_url: "/mock/degree.pdf",
            isVerified: true,
            topSkills: ["React", "TypeScript", "Python", "Node.js", "AWS"],
            experienceYears: 1,
            education: "Bachelor's Degree",
        },
        {
            title: "MSc Software Engineering",
            issuer: "University of Cape Town",
            date: "2019 - 2020",
            qualification_level: "Master's Degree",
            document_url: "/mock/masters.pdf",
            isVerified: false,
            topSkills: ["Go", "Kubernetes", "PostgreSQL", "Docker", "Microservices"],
            experienceYears: 4,
            education: "Bachelor's Degree",
        }
    ]);

    const [certificationsList, setCertificationsList] = useState([
        {
            title: "Google Cloud Professional Developer",
            issuer: "Google Cloud",
            date: "January 2024",
            credential_url: "https://cloud.google.com/certification",
            document_url: "/mock/google-cert.pdf",
            isVerified: true
        },
        {
            title: "AWS Certified Solutions Architect",
            issuer: "Amazon Web Services",
            date: "November 2023",
            credential_url: "https://aws.amazon.com/certification",
            document_url: "/mock/aws-cert.pdf",
            isVerified: true
        }
    ]);

    const [references, setReferences] = useState([
        {
            name: "Sarah Jenkins",
            relationship: "Senior Developer / Manager",
            company: "Tech StartUp SA",
            phone: "+27 11 987 6543",
            email: "sarah@techstartup.co.za"
        }
    ]);

    const [matricData, setMatricData] = useState<any>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [isEditSummaryOpen, setIsEditSummaryOpen] = useState(false);
    const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
    const [isAddLanguageOpen, setIsAddLanguageOpen] = useState(false); // New Language Modal State
    const [newLanguage, setNewLanguage] = useState({ language: "", proficiency: "Fluent" });
    const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
    const [isAddCredentialOpen, setIsAddCredentialOpen] = useState<{ open: boolean, type: "education" | "certification" }>({ open: false, type: "education" });
    const [isAddReferenceOpen, setIsAddReferenceOpen] = useState(false);
    const [isAddMatricOpen, setIsAddMatricOpen] = useState(false);
    const [isAddExperienceOpen, setIsAddExperienceOpen] = useState(false);

    const [editedUser, setEditedUser] = useState(user);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [newTargetRole, setNewTargetRole] = useState("");

    const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);
    const [isSkillsExpanded, setIsSkillsExpanded] = useState(false);

    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Fetch real profile data from Supabase
    useEffect(() => {
        const loadProfile = async () => {
            setIsLoadingProfile(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/");
                return;
            }

            const userId = session.user.id;
            setCurrentUserId(userId);

            try {
                // Fetch basic profile
                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", userId)
                    .single();

                if (profileError && profileError.code !== "PGRST116") throw profileError;

                if (profile) {
                    setUser(prev => ({
                        ...prev,
                        name: profile.full_name || prev.name,
                        email: profile.email || prev.email,
                        phone: profile.phone || prev.phone,
                        summary: profile.summary || prev.summary,
                        linkedin: profile.linkedin_url || prev.linkedin,
                        portfolio: profile.portfolio_url || prev.portfolio,
                        headline: profile.headline || prev.headline, // Assuming you add headline to table or it's in master_cv
                    }));
                    setEditedUser(prev => ({
                        ...prev,
                        name: profile.full_name || prev.name,
                        email: profile.email || prev.email,
                    }));
                }

                // Fetch work experiences
                const { data: dbExperiences } = await supabase
                    .from("work_experiences")
                    .select("*")
                    .eq("user_id", userId)
                    .order("start_date", { ascending: false });

                if (dbExperiences && dbExperiences.length > 0) {
                    setExperiences(dbExperiences.map(exp => ({
                        role: exp.position,
                        company: exp.company,
                        duration: `${exp.start_date}${exp.is_current ? " - Present" : ""}`,
                        description: exp.description || ""
                    })));
                }

                // Fetch projects
                const { data: dbProjects } = await supabase
                    .from("projects")
                    .select("*")
                    .eq("user_id", userId);

                if (dbProjects && dbProjects.length > 0) {
                    setProjectsList(dbProjects.map(proj => ({
                        title: proj.title,
                        description: proj.description || "",
                        technologies: proj.technologies || [],
                        github_url: proj.link || "",
                        image_url: proj.image_url || "/mock/cv-project.jpg",
                        topSkills: proj.technologies || [],
                        experienceYears: 1,
                        education: "Bachelor's Degree",
                        isVerified: true
                    })));
                }

            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setIsLoadingProfile(false);
            }
        };

        loadProfile();
    }, [router]);

    // Legacy localStorage loading (keeping for backward compatibility/temp fallback)
    useEffect(() => {
        const savedBasic = localStorage.getItem("user_basic_info");
        // ... only load if not already loaded from DB or for local overrides
    }, []);

    const handleSave = async () => {
        if (!currentUserId) return;

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: editedUser.name,
                    phone: editedUser.phone,
                    linkedin_url: editedUser.linkedin,
                    portfolio_url: editedUser.portfolio,
                })
                .eq("id", currentUserId);

            if (error) throw error;

            setUser(editedUser);
            setIsEditing(false);
            localStorage.setItem("user_basic_info", JSON.stringify(editedUser));
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save changes. Please try again.");
        }
    };

    const handleCancel = () => {
        setEditedUser(user);
        setIsEditing(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem("is_logged_in");
        localStorage.removeItem("mock_role");
        router.push("/");
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* New Profile Header */}
                <div className="mb-8">
                    <ProfileHeader
                        name={user.name}
                        headline={user.headline}
                        email={user.email}
                        phone={user.phone}
                        location={user.location}
                        avatar={user.avatar}
                        availabilityStatus={user.availabilityStatus}
                        github={user.github}
                        linkedin={user.linkedin}
                        portfolio={user.portfolio}
                        haveLicense={user.haveLicense}
                        licenseCode={user.licenseCode}
                        haveCar={user.haveCar}
                        onEdit={() => setIsEditing(true)}
                        downloadAction={<DownloadResumeButton data={{
                            user,
                            experiences,
                            educationList,
                            certificationsList,
                            skills,
                            projectsList,
                            languages,
                            references,
                            matricData
                        }} />}
                        isOwner={true}
                    />
                </div>

                {/* Upload CV Button */}
                <div className="mb-6 flex justify-end">
                    <Link href="/profile/master-cv" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all border border-blue-700 shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        Upload CV
                    </Link>
                </div>

                {/* Professional Summary Section (New) */}
                {/* Professional Summary Section (New) */}
                <div className="mb-8 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm relative group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <FileText className="w-4 h-4" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Professional Summary</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {!user.summary && (
                                <button
                                    onClick={() => setIsEditSummaryOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all border border-blue-700 shadow-sm"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Summary
                                </button>
                            )}
                            {user.summary && (
                                <button
                                    onClick={() => setIsEditSummaryOpen(true)}
                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 flex items-center gap-2"
                                    title="Edit Summary"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    <span className="text-xs font-bold md:hidden">Edit</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {user.summary ? (
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                            {user.summary}
                        </p>
                    ) : (
                        <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-slate-400 text-sm italic">No professional summary added yet. Click 'Add Summary' above to get started.</p>
                        </div>
                    )}
                </div>

                {/* Target Roles Section */}
                <div className="mb-8 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-primary">Targeting Roles</h2>
                            <p className="text-xs text-slate-500 font-medium">What I'm looking for next (Max: 3)</p>
                        </div>
                    </div>

                    {/* Current Roles with Delete */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {(user.targetRoles || []).map((role: string, idx: number) => (
                            <div
                                key={idx}
                                className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-200 text-blue-600 text-sm font-bold shadow-sm flex items-center gap-2 group"
                            >
                                <span>{role}</span>
                                <button
                                    onClick={() => {
                                        const updatedRoles = user.targetRoles.filter((_: string, i: number) => i !== idx);
                                        const updatedUser = { ...user, targetRoles: updatedRoles };
                                        setUser(updatedUser);
                                        localStorage.setItem("user_basic_info", JSON.stringify(updatedUser));
                                    }}
                                    className="text-blue-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {(!user.targetRoles || user.targetRoles.length === 0) && (
                            <p className="text-slate-600 font-bold uppercase tracking-wider">No target roles added yet</p>
                        )}
                    </div>

                    {/* Add New Role */}
                    {(user.targetRoles || []).length < 3 && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="e.g. Full Stack Developer"
                                value={newTargetRole}
                                onChange={(e) => setNewTargetRole(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter" && newTargetRole.trim()) {
                                        const updatedRoles = [...(user.targetRoles || []), newTargetRole.trim()];
                                        const updatedUser = { ...user, targetRoles: updatedRoles };
                                        setUser(updatedUser);
                                        localStorage.setItem("user_basic_info", JSON.stringify(updatedUser));
                                        setNewTargetRole("");
                                    }
                                }}
                                className="flex-1 px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            />
                            <button
                                onClick={() => {
                                    if (newTargetRole.trim()) {
                                        const updatedRoles = [...(user.targetRoles || []), newTargetRole.trim()];
                                        const updatedUser = { ...user, targetRoles: updatedRoles };
                                        setUser(updatedUser);
                                        localStorage.setItem("user_basic_info", JSON.stringify(updatedUser));
                                        setNewTargetRole("");
                                    }
                                }}
                                disabled={!newTargetRole.trim()}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-lg transition-all text-sm"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Talent Profile */}
                <div>
                    <div className="space-y-8">
                        {/* Projects Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FolderKanban className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Projects</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        if (projectsList.length >= 4) {
                                            alert("Maximum of 4 projects allowed for a focused profile.");
                                        } else {
                                            setIsAddProjectOpen(true);
                                        }
                                    }}
                                    disabled={projectsList.length >= 4}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${projectsList.length >= 4
                                        ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                                        : "bg-blue-600 text-white hover:bg-blue-700 border-blue-700 shadow-sm"
                                        }`}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Project {projectsList.length >= 4 && "(Limit Reached)"}
                                </button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {projectsList.slice(0, isProjectsExpanded ? undefined : 2).map((project: any, idx: number) => (
                                    <ProjectCard
                                        key={idx}
                                        {...project}
                                        onDelete={() => setProjectsList(projectsList.filter((_: any, i: number) => i !== idx))}
                                        isOwner={true}
                                    />
                                ))}
                            </div>
                            {projectsList.length > 2 && (
                                <button
                                    onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                                    className="w-full py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                >
                                    {isProjectsExpanded ? "Show Less" : `Show More (${projectsList.length - 2} more)`}
                                </button>
                            )}
                        </div>

                        {/* Experience Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Experience</h2>
                                </div>
                                <button
                                    onClick={() => setIsAddExperienceOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all border border-blue-700 shadow-sm"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Experience
                                </button>
                            </div>
                            <div className="space-y-4">
                                {experiences.map((exp: any, idx: number) => (
                                    <ExperienceCard
                                        key={idx}
                                        {...exp}
                                        onDelete={() => setExperiences(experiences.filter((_: any, i: number) => i !== idx))}
                                        isOwner={true}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Skills Section (Simplified) */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Skills</h2>
                                </div>
                                <button
                                    onClick={() => setIsAddSkillOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all border border-blue-700 shadow-sm"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Skill
                                </button>
                            </div>

                            <div className="bg-white rounded-xl border-2 border-slate-100 p-6 shadow-sm">
                                <div className="flex flex-col space-y-3">
                                    {[...skills].reverse().slice(0, isSkillsExpanded ? undefined : 2).map((skill: any, idx) => {
                                        const name = typeof skill === "string" ? skill : skill.name;
                                        const minYears = typeof skill === "string" ? undefined : skill.minYears;
                                        const level = typeof skill === "string" ? undefined : skill.level;

                                        // Reverse index for deletion
                                        const originalIdx = skills.length - 1 - idx;

                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-xl transition-all group/skill border border-slate-100 hover:border-blue-100"
                                            >
                                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0 shadow-sm shadow-blue-200" />
                                                <div className="flex-1 flex flex-col gap-1">
                                                    <span className="text-sm font-bold text-slate-800 leading-relaxed">
                                                        {name}
                                                    </span>
                                                    {(minYears || level) && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
                                                                {minYears ? `${minYears}+ yrs` : null}
                                                                {minYears && level ? " • " : ""}
                                                                {level ? level : null}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const updated = skills.filter((_, i) => i !== originalIdx);
                                                        setSkills(updated);
                                                        localStorage.setItem("user_skills_list", JSON.stringify(updated));
                                                    }}
                                                    className="text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover/skill:opacity-100 p-1 hover:bg-red-50 rounded-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {skills.length > 2 && (
                                        <button
                                            onClick={() => setIsSkillsExpanded(!isSkillsExpanded)}
                                            className="w-full py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                        >
                                            {isSkillsExpanded ? "Show Less" : `Show More (${skills.length - 2} more)`}
                                        </button>
                                    )}
                                    {skills.length === 0 && (
                                        <div className="text-center py-8 text-slate-600 font-bold uppercase tracking-wider border-2 border-dashed border-slate-100 rounded-xl">
                                            No skills showcased yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Languages Section (New) */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Languages className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Languages</h2>
                                </div>
                                <button
                                    onClick={() => setIsAddLanguageOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all border border-blue-700 shadow-sm"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Language
                                </button>
                            </div>
                            <div className="bg-white rounded-xl border-2 border-slate-100 p-6 shadow-sm">
                                <div className="grid md:grid-cols-3 gap-4">
                                    {languages.map((lang, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                                            <div>
                                                <p className="font-semibold text-slate-800 text-sm">{lang.language}</p>
                                                <p className="text-[10px] text-slate-500">{lang.proficiency}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const updated = languages.filter((_, i) => i !== idx);
                                                    setLanguages(updated);
                                                    localStorage.setItem("user_languages_list", JSON.stringify(updated));
                                                }}
                                                className="text-slate-400 hover:text-red-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Education Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Tertiary Education</h2>
                                </div>
                                <button
                                    onClick={() => setIsAddCredentialOpen({ open: true, type: "education" })}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all border border-blue-700 shadow-sm"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Degree
                                </button>
                            </div>
                            <div className="space-y-4">
                                {educationList.map((edu: any, idx: number) => (
                                    <CredentialCard
                                        key={idx}
                                        type="education"
                                        title={edu.title}
                                        issuer={edu.issuer}
                                        date={edu.date}
                                        qualification_level={edu.qualification_level}
                                        document_url={edu.document_url}
                                        isVerified={edu.isVerified}
                                        viewerRole="owner"
                                        onDelete={() => {
                                            const updated = educationList.filter((_: any, i: number) => i !== idx);
                                            setEducationList(updated);
                                            // Save combined credentials to localStorage
                                            const allCredentials = [...updated.map((e: any) => ({ ...e, type: 'education' })), ...certificationsList.map((c: any) => ({ ...c, type: 'certification' }))];
                                            localStorage.setItem("user_credentials_list", JSON.stringify(allCredentials));
                                        }}
                                        isOwner={true}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Matric Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <School className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-xl font-bold text-primary">Matric</h2>
                                </div>
                                {!matricData && (
                                    <button
                                        onClick={() => setIsAddMatricOpen(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all border border-blue-700 shadow-sm"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add Matric
                                    </button>
                                )}
                            </div>
                            {matricData ? (
                                <SecondaryEducationCard
                                    {...matricData}
                                    onDelete={() => {
                                        setMatricData(null);
                                        localStorage.removeItem("user_matric_data");
                                    }}
                                    isOwner={true}
                                />
                            ) : (
                                <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-xl">
                                    <p className="text-slate-400 text-sm italic">High school details are important for graduate programs. Add yours now.</p>
                                </div>
                            )}
                        </div>

                        {/* Certifications Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-xl font-bold text-primary">Certifications</h2>
                                </div>
                                <button
                                    onClick={() => setIsAddCredentialOpen({ open: true, type: "certification" })}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all border border-blue-700 shadow-sm"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Certification
                                </button>
                            </div>
                            <div className="space-y-4">
                                {certificationsList.map((cert: any, idx: number) => (
                                    <CredentialCard
                                        key={idx}
                                        type="certification"
                                        title={cert.title}
                                        issuer={cert.issuer}
                                        date={cert.date}
                                        credential_url={cert.credential_url}
                                        document_url={cert.document_url}
                                        isVerified={cert.isVerified}
                                        viewerRole="owner"
                                        onDelete={() => {
                                            const updated = certificationsList.filter((_: any, i: number) => i !== idx);
                                            setCertificationsList(updated);
                                            // Save combined credentials to localStorage
                                            const allCredentials = [...educationList.map((e: any) => ({ ...e, type: 'education' })), ...updated.map((c: any) => ({ ...c, type: 'certification' }))];
                                            localStorage.setItem("user_credentials_list", JSON.stringify(allCredentials));
                                        }}
                                        isOwner={true}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* References Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-xl font-bold text-primary">Professional References</h2>
                                </div>
                                <button
                                    onClick={() => setIsAddReferenceOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all border border-blue-700 shadow-sm"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Reference
                                </button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {references.map((ref: any, idx: number) => (
                                    <ReferenceCard
                                        key={idx}
                                        {...ref}
                                        onDelete={() => {
                                            const updated = references.filter((_, i) => i !== idx);
                                            setReferences(updated);
                                            localStorage.setItem("user_references_list", JSON.stringify(updated));
                                        }}
                                        isOwner={true}
                                    />
                                ))}
                            </div>
                            {references.length === 0 && (
                                <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-xl">
                                    <p className="text-slate-400 text-sm italic">Recruiters often require 2-3 references. Add them here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <EditProfileModal
                    isOpen={isEditing}
                    onClose={() => setIsEditing(false)}
                    onSave={(newData) => {
                        setUser(newData);
                        setIsEditing(false);
                        // Mock persist
                        localStorage.setItem("user_basic_info", JSON.stringify(newData));
                        alert("Profile updated successfully!");
                    }}
                    initialData={user}
                />
                <AddSkillModal
                    isOpen={isAddSkillOpen}
                    onClose={() => setIsAddSkillOpen(false)}
                    onAdd={(newSkill) => {
                        const updated = [...skills, newSkill];
                        setSkills(updated);
                        localStorage.setItem("user_skills_list", JSON.stringify(updated));
                        setIsAddSkillOpen(false);
                    }}
                />
                <EditSummaryModal
                    isOpen={isEditSummaryOpen}
                    initialSummary={user.summary}
                    onClose={() => setIsEditSummaryOpen(false)}
                    onSave={async (newSummary: string) => {
                        if (!currentUserId) return;

                        try {
                            const { error } = await supabase
                                .from("profiles")
                                .update({ summary: newSummary })
                                .eq("id", currentUserId);

                            if (error) throw error;

                            setUser(prev => ({ ...prev, summary: newSummary }));
                            // Assuming setEditedUser is defined elsewhere if needed, otherwise remove.
                            // For this change, we'll keep it as provided in the instruction snippet.
                            // If `editedUser` state is not present, this line will cause an error.
                            // Assuming `editedUser` is a state variable similar to `user`.
                            // If `setEditedUser` is not available, it should be removed.
                            // For now, I'll include it as per the instruction.
                            // setEditedUser(prev => ({ ...prev, summary: newSummary }));
                            localStorage.setItem("user_basic_info", JSON.stringify({ ...user, summary: newSummary }));
                        } catch (error) {
                            console.error("Error saving summary:", error);
                            alert("Failed to save summary.");
                        }
                    }}
                />
                {/* Simple Inline Language Modal (For speed) */}
                {isAddLanguageOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in fade-in zoom-in">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Languages className="w-5 h-5 text-blue-600" /> Add Language
                            </h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Language (e.g. French)"
                                    className="w-full px-4 py-2 border rounded-lg"
                                    value={newLanguage.language}
                                    onChange={e => setNewLanguage({ ...newLanguage, language: e.target.value })}
                                />
                                <select
                                    className="w-full px-4 py-2 border rounded-lg"
                                    value={newLanguage.proficiency}
                                    onChange={e => setNewLanguage({ ...newLanguage, proficiency: e.target.value })}
                                >
                                    <option value="Native">Native</option>
                                    <option value="Fluent">Fluent</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Basic">Basic</option>
                                </select>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => setIsAddLanguageOpen(false)}
                                        className="flex-1 py-2 rounded-lg bg-slate-100 font-semibold text-slate-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (newLanguage.language) {
                                                const updated = [...languages, newLanguage];
                                                setLanguages(updated);
                                                localStorage.setItem("user_languages_list", JSON.stringify(updated));
                                                setNewLanguage({ language: "", proficiency: "Fluent" });
                                                setIsAddLanguageOpen(false);
                                            }
                                        }}
                                        className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <AddCredentialModal
                    isOpen={isAddCredentialOpen.open}
                    type={isAddCredentialOpen.type}
                    onClose={() => setIsAddCredentialOpen({ ...isAddCredentialOpen, open: false })}
                    onAdd={(newCredential: any) => {
                        if (isAddCredentialOpen.type === "education") {
                            const updated = [...educationList, newCredential];
                            setEducationList(updated);
                            // Save combined credentials to localStorage
                            const allCredentials = [...updated.map((e: any) => ({ ...e, type: 'education' })), ...certificationsList.map((c: any) => ({ ...c, type: 'certification' }))];
                            localStorage.setItem("user_credentials_list", JSON.stringify(allCredentials));
                        } else {
                            const updated = [...certificationsList, newCredential];
                            setCertificationsList(updated);
                            // Save combined credentials to localStorage
                            const allCredentials = [...educationList.map((e: any) => ({ ...e, type: 'education' })), ...updated.map((c: any) => ({ ...c, type: 'certification' }))];
                            localStorage.setItem("user_credentials_list", JSON.stringify(allCredentials));
                        }
                        setIsAddCredentialOpen({ ...isAddCredentialOpen, open: false });
                    }}
                />

                <AddProjectModal
                    isOpen={isAddProjectOpen}
                    onClose={() => setIsAddProjectOpen(false)}
                    onAdd={async (newProject: any) => {
                        if (!currentUserId) return;
                        try {
                            const { error } = await supabase
                                .from("projects")
                                .insert({
                                    user_id: currentUserId,
                                    title: newProject.title,
                                    description: newProject.description,
                                    technologies: newProject.technologies,
                                    link: newProject.github_url || newProject.link_url,
                                });
                            if (error) throw error;
                            const updated = [...projectsList, newProject];
                            setProjectsList(updated);
                            localStorage.setItem("user_projects_list", JSON.stringify(updated));
                            setIsAddProjectOpen(false);
                            alert("Project added!");
                        } catch (error) {
                            console.error("Error adding project:", error);
                            alert("Failed to add project.");
                        }
                    }}
                />

                <AddReferenceModal
                    isOpen={isAddReferenceOpen}
                    onClose={() => setIsAddReferenceOpen(false)}
                    onAdd={(newRef) => {
                        const updated = [...references, newRef];
                        setReferences(updated);
                        localStorage.setItem("user_references_list", JSON.stringify(updated));
                        setIsAddReferenceOpen(false);
                    }}
                />

                <AddSecondaryEducationModal
                    isOpen={isAddMatricOpen}
                    onClose={() => setIsAddMatricOpen(false)}
                    onAdd={(data) => {
                        setMatricData(data);
                        localStorage.setItem("user_matric_data", JSON.stringify(data));
                        setIsAddMatricOpen(false);
                    }}
                />

                <AddExperienceModal
                    isOpen={isAddExperienceOpen}
                    onClose={() => setIsAddExperienceOpen(false)}
                    onAdd={async (newExp: any) => {
                        if (!currentUserId) return;
                        try {
                            const { error } = await supabase
                                .from("work_experiences")
                                .insert({
                                    user_id: currentUserId,
                                    company: newExp.company,
                                    position: newExp.role,
                                    start_date: new Date().toISOString().split('T')[0], // Placeholder date
                                    is_current: newExp.duration.includes("Present"),
                                });
                            if (error) throw error;
                            const updated = [...experiences, newExp];
                            setExperiences(updated);
                            localStorage.setItem("user_experience_list", JSON.stringify(updated));
                            setIsAddExperienceOpen(false);
                            alert("Experience added!");
                        } catch (error) {
                            console.error("Error adding experience:", error);
                            alert("Failed to add experience.");
                        }
                    }}
                />

                {/* Settings Menu Button - Bottom Right */}
                <div className="fixed bottom-8 right-8 z-40">
                    <div className="relative">
                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all hover:shadow-xl"
                            title="Settings"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isSettingsOpen && (
                            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                <button
                                    onClick={() => {
                                        setIsSettingsOpen(false);
                                        setIsEditing(true);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit Profile
                                </button>
                                <div className="border-t border-slate-100"></div>
                                <button
                                    onClick={() => {
                                        setIsSettingsOpen(false);
                                        handleLogout();
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
