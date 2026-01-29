"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Sparkles, User, Mail, Phone, LogOut, Edit2, Save, X, Loader2, GraduationCap, FolderKanban, Plus, Building2, Languages, Award, Briefcase, School, MessageSquare, Layers } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProfileHeader from "@/components/talent/ProfileHeader";
import ProjectCard from "@/components/talent/ProjectCard";
import CredentialCard from "@/components/talent/CredentialCard";
import ExperienceCard from "@/components/talent/ExperienceCard";
import ItemActionMenu from "@/components/talent/ItemActionMenu";
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
        name: "",
        email: "",
        phone: "",
        avatar: "",
        headline: "",
        location: "",
        availabilityStatus: "Looking for Work" as "Looking for Work" | "Not Looking" | "Open to Offers" | "Unavailable",
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

    const [languages, setLanguages] = useState<{ id?: string; language: string; proficiency: string }[]>([]);

    const [projectsList, setProjectsList] = useState<any[]>([]);

    const [experiences, setExperiences] = useState<any[]>([]);

    const [educationList, setEducationList] = useState<any[]>([]);

    const [certificationsList, setCertificationsList] = useState<any[]>([]);

    const [references, setReferences] = useState<any[]>([]);

    const [matricData, setMatricData] = useState<any>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [isEditSummaryOpen, setIsEditSummaryOpen] = useState(false);
    const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
    const [addSkillMode, setAddSkillMode] = useState<"technical" | "soft">("technical");
    const [isAddLanguageOpen, setIsAddLanguageOpen] = useState(false); // New Language Modal State
    const [newLanguage, setNewLanguage] = useState({ language: "", proficiency: "Fluent" });
    const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
    const [isAddCredentialOpen, setIsAddCredentialOpen] = useState<{ open: boolean, type: "education" | "certification" }>({ open: false, type: "education" });
    const [isAddReferenceOpen, setIsAddReferenceOpen] = useState(false);
    const [isAddMatricOpen, setIsAddMatricOpen] = useState(false);
    const [isAddExperienceOpen, setIsAddExperienceOpen] = useState(false);
    const [editingExperience, setEditingExperience] = useState<any>(null);
    const [editingProject, setEditingProject] = useState<any>(null);
    const [editingCredential, setEditingCredential] = useState<any>(null);
    const [editingReference, setEditingReference] = useState<any>(null);
    const [editingMatric, setEditingMatric] = useState<any>(null);
    const [editingSkill, setEditingSkill] = useState<TalentSkill | null>(null);
    const [editingLanguage, setEditingLanguage] = useState<any>(null);

    const [editedUser, setEditedUser] = useState(user);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);
    const [isSoftSkillsExpanded, setIsSoftSkillsExpanded] = useState(false);
    const [isSkillsExpanded, setIsSkillsExpanded] = useState(false);

    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Fetch real profile data from Supabase
    useEffect(() => {
        const loadProfile = async () => {
            setIsLoadingProfile(true);

            // Small delay to ensure session is ready
            await new Promise(resolve => setTimeout(resolve, 300));

            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                console.log("No session found, redirecting to login");
                setIsLoadingProfile(false);
                router.push("/");
                return;
            }

            console.log("Session found for user:", session.user.id);
            const userId = session.user.id;
            setCurrentUserId(userId);
            await fetchProfileData(userId);
            setIsLoadingProfile(false);
        };

        const fetchProfileData = async (userId: string) => {
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
                        github: profile.github_url || prev.github,
                        portfolio: profile.portfolio_url || prev.portfolio,
                        headline: profile.headline || prev.headline,
                        location: profile.location || prev.location,
                        availabilityStatus: profile.availability_status || prev.availabilityStatus,
                        targetRoles: profile.target_roles || prev.targetRoles,
                        haveLicense: profile.have_license,
                        licenseCode: profile.license_code || prev.licenseCode,
                        haveCar: profile.have_car,
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

                if (dbProjects && dbProjects.length > 0) {
                    setProjectsList(dbProjects.map(proj => ({
                        id: proj.id,
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

                // Fetch Qualifications (Matric, Uni, Certs) from unified table
                const { data: qData } = await supabase
                    .from("qualifications")
                    .select("*")
                    .eq("user_id", userId)
                    .order("year", { ascending: false });

                if (qData) {
                    // 1. Handle Matric (High School)
                    const matric = qData.find(q => q.type === 'high_school');
                    if (matric) {
                        setMatricData({
                            id: matric.id,
                            schoolName: matric.institution,
                            completionYear: matric.year
                        });
                    }

                    // 2. Handle Tertiary Education (exclude high_school and certification)
                    setEducationList(qData.filter(q => q.type !== 'certification' && q.type !== 'high_school').map(q => {
                        // Create a display date range (prefer only years for profile display)
                        let displayDate = q.year?.toString() || "";
                        if (q.start_date && q.end_date) {
                            const startYear = q.start_date.split("-")[0];
                            const endYear = q.end_date.split("-")[0];
                            displayDate = `${startYear} - ${endYear}`;
                        } else if (q.start_date) {
                            displayDate = q.start_date.split("-")[0];
                        }

                        return {
                            id: q.id,
                            title: q.title,
                            issuer: q.institution,
                            date: displayDate,
                            start_date: q.start_date,
                            end_date: q.end_date,
                            qualification_level: q.qualification_level || 'Tertiary',
                            document_url: q.document_url || "",
                            isVerified: q.is_verified
                        };
                    }));

                    // 3. Handle Certifications
                    setCertificationsList(qData.filter(q => q.type === 'certification').map(q => {
                        let displayDate = q.year?.toString() || "";
                        if (q.end_date) {
                            displayDate = q.end_date.split("-")[0];
                        }

                        return {
                            id: q.id,
                            title: q.title,
                            issuer: q.institution,
                            date: displayDate,
                            start_date: q.start_date,
                            end_date: q.end_date,
                            qualification_level: q.qualification_level,
                            credential_url: "",
                            document_url: q.document_url || "",
                            isVerified: q.is_verified
                        };
                    }));
                }

                // Fetch skills
                const { data: dbSkills } = await supabase
                    .from("skills")
                    .select("*")
                    .eq("user_id", userId);
                if (dbSkills) {
                    setSkills(dbSkills.map(s => ({
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
                if (dbLangs) {
                    setLanguages(dbLangs.map(l => ({
                        id: l.id,
                        language: l.language,
                        proficiency: l.proficiency
                    })));
                }

                // Fetch references
                const { data: dbRefs } = await supabase
                    .from("references")
                    .select("*")
                    .eq("user_id", userId);
                if (dbRefs) {
                    setReferences(dbRefs.map(r => ({
                        id: r.id,
                        name: r.name,
                        relationship: r.relationship,
                        company: r.company,
                        phone: r.phone,
                        email: r.email
                    })));
                }

            } catch (error) {
                console.error("Error loading profile:", error);
            }
        };

        loadProfile();
    }, [router]);

    // Helper to format DB date (YYYY-MM-DD) to "MMM YYYY"
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "";
        try {
            const [year, month] = dateStr.split('-');
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return `${months[parseInt(month) - 1]} ${year}`;
        } catch (e) {
            return dateStr || "";
        }
    };

    // Sync all profile data to LocalStorage for CV Generator
    useEffect(() => {
        if (isLoadingProfile) return;

        localStorage.setItem("user_basic_info", JSON.stringify(user));
        localStorage.setItem("user_skills_list", JSON.stringify(skills));
        localStorage.setItem("user_experience_list", JSON.stringify(experiences));
        localStorage.setItem("user_projects_list", JSON.stringify(projectsList));
        localStorage.setItem("user_languages_list", JSON.stringify(languages));
        localStorage.setItem("user_references_list", JSON.stringify(references));
        localStorage.setItem("user_matric_data", JSON.stringify(matricData));

        // Combine education and certifications into credentials list
        const allCredentials = [
            ...educationList.map((e: any) => ({ ...e, type: 'education' })),
            ...certificationsList.map((c: any) => ({ ...c, type: 'certification' }))
        ];
        localStorage.setItem("user_credentials_list", JSON.stringify(allCredentials));

        console.log("Profile Synced to LocalStorage");
    }, [user, skills, experiences, projectsList, languages, references, matricData, educationList, certificationsList, isLoadingProfile]);

    const handleSaveProfile = async (newData: any) => {
        if (!currentUserId) return;

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: newData.name,
                    phone: newData.phone,
                    headline: newData.headline,
                    location: newData.location,
                    linkedin_url: newData.linkedin,
                    github_url: newData.github,
                    portfolio_url: newData.portfolio,
                    availability_status: newData.availabilityStatus,
                    target_roles: newData.targetRoles,
                    have_license: newData.haveLicense,
                    license_code: newData.licenseCode,
                    have_car: newData.haveCar,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", currentUserId);

            if (error) throw error;

            // Update the UI state with the saved data
            setUser(newData);
            setIsEditing(false);
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
                        targetRoles={user.targetRoles}
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
                                        onDelete={async () => {
                                            if (currentUserId && project.id) {
                                                const { error } = await supabase.from("projects").delete().eq("id", project.id);
                                                if (error) {
                                                    alert("Failed to delete project.");
                                                    return;
                                                }
                                            }
                                            setProjectsList(projectsList.filter((_: any, i: number) => i !== idx));
                                        }}
                                        onEdit={() => {
                                            setEditingProject(project);
                                            setIsAddProjectOpen(true);
                                        }}
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
                                        onDelete={async () => {
                                            if (currentUserId && exp.id) {
                                                const { error } = await supabase.from("work_experiences").delete().eq("id", exp.id);
                                                if (error) {
                                                    alert("Failed to delete experience.");
                                                    return;
                                                }
                                            }
                                            setExperiences(experiences.filter((_: any, i: number) => i !== idx));
                                        }}
                                        onEdit={() => {
                                            setEditingExperience(exp);
                                            setIsAddExperienceOpen(true);
                                        }}
                                        isOwner={true}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* 1. Technical Skills Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Technical Skills</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        setAddSkillMode("technical");
                                        setIsAddSkillOpen(true);
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Technical Skill
                                </button>
                            </div>

                            {skills.filter(s => !s.isSoftSkill && s.category !== "Soft Skills").length === 0 ? (
                                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <Layers className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">No technical skills added yet.</p>
                                </div>
                            ) : (
                                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="space-y-6">
                                        {(() => {
                                            const technicalGrouped = skills.filter(s => !s.isSoftSkill && s.category !== "Soft Skills").reduce((acc: Record<string, any[]>, skill: any) => {
                                                const cat = skill.category || "Other Skills";
                                                if (!acc[cat]) acc[cat] = [];
                                                acc[cat].push(skill);
                                                return acc;
                                            }, {} as Record<string, any[]>);

                                            return Object.entries(technicalGrouped).map(([category, categorySkills], catIdx) => (
                                                <div key={catIdx} className={catIdx > 0 ? "pt-6 border-t border-slate-50" : ""}>
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                        {category}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {categorySkills.map((skill, idx) => {
                                                            const originalIdx = skills.indexOf(skill);
                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className="group relative flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all font-medium"
                                                                >
                                                                    <span className="text-sm text-slate-700">{skill.name}</span>
                                                                    {(skill.minYears ?? 0) > 0 && (
                                                                        <span className="text-[10px] text-blue-600 font-black bg-blue-100/50 px-1.5 rounded tracking-tighter">
                                                                            {skill.minYears}Y
                                                                        </span>
                                                                    )}
                                                                    <div>
                                                                        <ItemActionMenu
                                                                            onEdit={() => {
                                                                                setEditingSkill(skill);
                                                                                setAddSkillMode("technical");
                                                                                setIsAddSkillOpen(true);
                                                                            }}
                                                                            onDelete={async () => {
                                                                                if (currentUserId && skill.id) {
                                                                                    await supabase.from("skills").delete().eq("id", skill.id);
                                                                                } else if (currentUserId) {
                                                                                    await supabase.from("skills").delete().eq("user_id", currentUserId).eq("name", skill.name);
                                                                                }
                                                                                const updated = skills.filter((_, i) => i !== originalIdx);
                                                                                setSkills(updated);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Soft Skills Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Soft Skills</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        setAddSkillMode("soft");
                                        setIsAddSkillOpen(true);
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Soft Skill
                                </button>
                            </div>

                            {skills.filter(s => s.isSoftSkill || s.category === "Soft Skills").length === 0 ? (
                                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">No soft skills added yet.</p>
                                </div>
                            ) : (
                                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all">
                                    <div className="space-y-3">
                                        {skills.filter(s => s.isSoftSkill || s.category === "Soft Skills")
                                            .slice(0, isSoftSkillsExpanded ? undefined : 3)
                                            .map((skill, idx) => {
                                                const originalIdx = skills.indexOf(skill);
                                                return (
                                                    <div key={idx} className="group relative flex items-center gap-3 -ml-2 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                                        <p className="text-sm text-slate-700 leading-relaxed font-medium flex-1">
                                                            {skill.name}
                                                        </p>
                                                        <div>
                                                            <ItemActionMenu
                                                                onEdit={() => {
                                                                    setEditingSkill(skill);
                                                                    setAddSkillMode("soft");
                                                                    setIsAddSkillOpen(true);
                                                                }}
                                                                onDelete={async () => {
                                                                    if (currentUserId && skill.id) {
                                                                        await supabase.from("skills").delete().eq("id", skill.id);
                                                                    } else if (currentUserId) {
                                                                        await supabase.from("skills").delete().eq("user_id", currentUserId).eq("name", skill.name);
                                                                    }
                                                                    const updated = skills.filter((_, i) => i !== originalIdx);
                                                                    setSkills(updated);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                    {skills.filter(s => s.isSoftSkill || s.category === "Soft Skills").length > 3 && (
                                        <div className="mt-4 pt-4 border-t border-slate-50">
                                            <button
                                                onClick={() => setIsSoftSkillsExpanded(!isSoftSkillsExpanded)}
                                                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                                            >
                                                {isSoftSkillsExpanded ? "Show Less" : `Show ${skills.filter(s => s.isSoftSkill || s.category === "Soft Skills").length - 3} More`}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
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
                                        <div key={idx} className="group relative flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-200 transition-all">
                                            <div>
                                                <p className="font-semibold text-slate-800 text-sm">{lang.language}</p>
                                                <p className="text-[10px] text-slate-500">{lang.proficiency}</p>
                                            </div>
                                            <div>
                                                <ItemActionMenu
                                                    onEdit={() => {
                                                        setEditingLanguage({ ...lang, idx });
                                                        setNewLanguage({ language: lang.language, proficiency: lang.proficiency });
                                                        setIsAddLanguageOpen(true);
                                                    }}
                                                    onDelete={async () => {
                                                        if (currentUserId && lang.id) {
                                                            await supabase.from("languages").delete().eq("id", lang.id);
                                                        }
                                                        const updated = languages.filter((_, i) => i !== idx);
                                                        setLanguages(updated);
                                                        localStorage.setItem("user_languages_list", JSON.stringify(updated));
                                                    }}
                                                />
                                            </div>
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
                                        viewerRole="owner"
                                        onDelete={async () => {
                                            if (currentUserId && edu.id) {
                                                const { error } = await supabase.from("qualifications").delete().eq("id", edu.id);
                                                if (error) {
                                                    alert("Failed to delete education.");
                                                    return;
                                                }
                                            }
                                            const updated = educationList.filter((_: any, i: number) => i !== idx);
                                            setEducationList(updated);
                                            // Save combined credentials to localStorage
                                            const allCredentials = [...updated.map((e: any) => ({ ...e, type: 'education' })), ...certificationsList.map((c: any) => ({ ...c, type: 'certification' }))];
                                            localStorage.setItem("user_credentials_list", JSON.stringify(allCredentials));
                                        }}
                                        onEdit={() => {
                                            setEditingCredential(edu);
                                            setIsAddCredentialOpen({ open: true, type: "education" });
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
                                    onDelete={async () => {
                                        if (currentUserId && matricData.id) {
                                            const { error } = await supabase.from("qualifications").delete().eq("id", matricData.id);
                                            if (error) {
                                                alert("Failed to delete matric data.");
                                                return;
                                            }
                                        }
                                        setMatricData(null);
                                        localStorage.removeItem("user_matric_data");
                                    }}
                                    onEdit={() => {
                                        setEditingMatric(matricData);
                                        setIsAddMatricOpen(true);
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
                                        document_url={cert.document_url}
                                        viewerRole="owner"
                                        onDelete={async () => {
                                            if (currentUserId && cert.id) {
                                                const { error } = await supabase.from("qualifications").delete().eq("id", cert.id);
                                                if (error) {
                                                    alert("Failed to delete certification.");
                                                    return;
                                                }
                                            }
                                            const updated = certificationsList.filter((_: any, i: number) => i !== idx);
                                            setCertificationsList(updated);
                                            // Save combined credentials to localStorage
                                            const allCredentials = [...educationList.map((e: any) => ({ ...e, type: 'education' })), ...updated.map((c: any) => ({ ...c, type: 'certification' }))];
                                            localStorage.setItem("user_credentials_list", JSON.stringify(allCredentials));
                                        }}
                                        onEdit={() => {
                                            setEditingCredential(cert);
                                            setIsAddCredentialOpen({ open: true, type: "certification" });
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
                                        onDelete={async () => {
                                            if (currentUserId && ref.id) {
                                                const { error } = await supabase.from("references").delete().eq("id", ref.id);
                                                if (error) {
                                                    alert("Failed to delete reference.");
                                                    return;
                                                }
                                            }
                                            const updated = references.filter((_, i) => i !== idx);
                                            setReferences(updated);
                                            localStorage.setItem("user_references_list", JSON.stringify(updated));
                                        }}
                                        onEdit={() => {
                                            setEditingReference(ref);
                                            setIsAddReferenceOpen(true);
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
                    onSave={handleSaveProfile}
                    initialData={user}
                />
                <AddSkillModal
                    isOpen={isAddSkillOpen}
                    initialMode={addSkillMode}
                    onClose={() => {
                        setIsAddSkillOpen(false);
                        setEditingSkill(null);
                    }}
                    initialData={editingSkill || undefined}
                    onAdd={async (newSkills: any[]) => {
                        if (!currentUserId) return;
                        try {
                            if (editingSkill && newSkills.length > 0) {
                                // Update existing
                                const s = newSkills[0];
                                const { error } = await supabase
                                    .from("skills")
                                    .update({
                                        name: s.name,
                                        min_experience_years: s.minYears || 0,
                                        category: s.category || (s.isSoftSkill ? "Soft Skills" : "Other Skills"),
                                        is_soft_skill: s.isSoftSkill || false
                                    })
                                    .eq("id", editingSkill.id);

                                if (error) throw error;

                                setSkills(skills.map(skill => skill.id === editingSkill.id ? { ...s, id: editingSkill.id } : skill));
                                alert("Skill updated!");
                            } else {
                                // Insert new
                                const insertData = newSkills.map(s => ({
                                    user_id: currentUserId,
                                    name: s.name,
                                    min_experience_years: s.minYears || 0,
                                    category: s.category || "Other Skills",
                                    is_soft_skill: s.isSoftSkill || false
                                }));

                                const { data, error } = await supabase
                                    .from("skills")
                                    .insert(insertData)
                                    .select();

                                if (error) throw error;

                                const formattedNewSkills = data.map(s => ({
                                    id: s.id,
                                    name: s.name,
                                    minYears: s.min_experience_years || 0,
                                    category: s.category || (s.is_soft_skill ? "Soft Skills" : "Other Skills"),
                                    isSoftSkill: s.is_soft_skill || false
                                }));

                                setSkills([...skills, ...formattedNewSkills]);
                                alert(`${newSkills.length > 1 ? newSkills.length + " skills" : "Skill"} added successfully!`);
                            }
                            setIsAddSkillOpen(false);
                            setEditingSkill(null);
                        } catch (error: any) {
                            console.error("Error saving skills:", error);
                            alert(`Failed to save skills. ${error.message}`);
                        }
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
                            alert("Summary updated!");
                            setIsEditSummaryOpen(false);
                        } catch (error) {
                            console.error("Error saving summary:", error);
                            alert("Failed to save summary.");
                        }
                    }}
                />
                {/* Simple Inline Language Modal (For speed) */}
                {isAddLanguageOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-sm p-6 shadow-xl animate-in fade-in zoom-in">
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
                                        onClick={async () => {
                                            if (newLanguage.language && currentUserId) {
                                                try {
                                                    const langData = {
                                                        user_id: currentUserId,
                                                        language: newLanguage.language,
                                                        proficiency: newLanguage.proficiency,
                                                    };

                                                    if (editingLanguage) {
                                                        const { error } = await supabase
                                                            .from("languages")
                                                            .update(langData)
                                                            .eq("id", editingLanguage.id);
                                                        if (error) throw error;

                                                        const updated = languages.map((l, i) => i === editingLanguage.idx ? { ...l, ...langData } : l);
                                                        setLanguages(updated);
                                                        alert("Language updated!");
                                                    } else {
                                                        const { data, error } = await supabase
                                                            .from("languages")
                                                            .insert(langData)
                                                            .select();
                                                        if (error) throw error;

                                                        const updated = [...languages, { ...langData, id: data[0].id }];
                                                        setLanguages(updated);
                                                        alert("Language added!");
                                                    }

                                                    setNewLanguage({ language: "", proficiency: "Fluent" });
                                                    setIsAddLanguageOpen(false);
                                                    setEditingLanguage(null);
                                                } catch (error) {
                                                    console.error("Error adding/updating language:", error);
                                                    alert("Failed to save language.");
                                                }
                                            }
                                        }}
                                        className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
                                    >
                                        {editingLanguage ? "Update" : "Add"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <AddCredentialModal
                    isOpen={isAddCredentialOpen.open}
                    type={isAddCredentialOpen.type}
                    onClose={() => {
                        setIsAddCredentialOpen({ ...isAddCredentialOpen, open: false });
                        setEditingCredential(null);
                    }}
                    initialData={editingCredential}
                    onAdd={async (newCredential: any) => {
                        if (!currentUserId) return;

                        // Map UI type to Database Type
                        let dbType: 'high_school' | 'tertiary' | 'certification' = 'certification';
                        if (isAddCredentialOpen.type === 'education') {
                            dbType = newCredential.title.toLowerCase().includes('matric') ? 'high_school' : 'tertiary';
                        }

                        try {
                            const qualificationData = {
                                user_id: currentUserId,
                                type: dbType,
                                title: newCredential.title,
                                institution: newCredential.issuer,
                                qualification_level: newCredential.qualification_level,
                                year: parseInt(newCredential.year) || null,
                                start_date: newCredential.start_date || null,
                                end_date: newCredential.end_date || null,
                                document_url: newCredential.document_url || null,
                                is_verified: newCredential.isVerified || false
                            };

                            if (newCredential.id) {
                                const { error } = await supabase
                                    .from("qualifications")
                                    .update(qualificationData)
                                    .eq("id", newCredential.id);
                                if (error) throw error;

                                if (dbType === 'high_school') {
                                    setMatricData({ ...newCredential, id: newCredential.id, schoolName: newCredential.issuer, completionYear: parseInt(newCredential.year) });
                                } else if (isAddCredentialOpen.type === "education") {
                                    setEducationList(educationList.map(e => e.id === newCredential.id ? newCredential : e));
                                } else {
                                    setCertificationsList(certificationsList.map(c => c.id === newCredential.id ? newCredential : c));
                                }
                                alert("Qualification updated!");
                            } else {
                                const { data, error } = await supabase
                                    .from("qualifications")
                                    .insert(qualificationData)
                                    .select();

                                if (error) throw error;

                                const addedCredential = { ...newCredential, id: data[0].id };

                                if (dbType === 'high_school') {
                                    setMatricData({
                                        id: data[0].id,
                                        schoolName: newCredential.issuer,
                                        completionYear: parseInt(newCredential.year) || new Date().getFullYear(),
                                    });
                                } else if (isAddCredentialOpen.type === "education") {
                                    setEducationList([...educationList, addedCredential]);
                                } else {
                                    setCertificationsList([...certificationsList, addedCredential]);
                                }
                                alert("Qualification added!");
                            }
                        } catch (error: any) {
                            console.error("Error saving qualification:", error);
                            alert(`Failed to save qualification. ${error.message}`);
                        }

                        setIsAddCredentialOpen({ ...isAddCredentialOpen, open: false });
                        setEditingCredential(null);
                    }}
                />

                <AddProjectModal
                    isOpen={isAddProjectOpen}
                    onClose={() => setIsAddProjectOpen(false)}
                    onAdd={async (newProject: any) => {
                        if (!currentUserId) return;
                        try {
                            const projectData = {
                                user_id: currentUserId,
                                title: newProject.title,
                                description: newProject.description,
                                technologies: newProject.technologies,
                                link: newProject.github_url || newProject.link_url,
                                image_url: newProject.image_url || null,
                            };

                            if (newProject.id) {
                                const { error } = await supabase
                                    .from("projects")
                                    .update(projectData)
                                    .eq("id", newProject.id);
                                if (error) throw error;
                                setProjectsList(projectsList.map(p => p.id === newProject.id ? newProject : p));
                                alert("Project updated!");
                            } else {
                                const { data, error } = await supabase
                                    .from("projects")
                                    .insert(projectData)
                                    .select();
                                if (error) throw error;
                                setProjectsList([...projectsList, { ...newProject, id: data[0].id }]);
                                alert("Project added!");
                            }
                            setIsAddProjectOpen(false);
                            setEditingProject(null);
                        } catch (error) {
                            console.error("Error adding project:", error);
                            alert("Failed to add project.");
                        }
                    }}
                    initialData={editingProject}
                />

                <AddReferenceModal
                    isOpen={isAddReferenceOpen}
                    onClose={() => {
                        setIsAddReferenceOpen(false);
                        setEditingReference(null);
                    }}
                    initialData={editingReference}
                    onAdd={async (newRef: any) => {
                        if (!currentUserId) return;
                        try {
                            const refData = {
                                user_id: currentUserId,
                                name: newRef.name,
                                relationship: newRef.relationship,
                                company: newRef.company,
                                phone: newRef.phone,
                                email: newRef.email
                            };

                            if (newRef.id) {
                                const { error } = await supabase
                                    .from("references")
                                    .update(refData)
                                    .eq("id", newRef.id);
                                if (error) throw error;
                                setReferences(references.map(r => r.id === newRef.id ? newRef : r));
                                alert("Reference updated!");
                            } else {
                                const { data, error } = await supabase
                                    .from("references")
                                    .insert(refData)
                                    .select();
                                if (error) throw error;
                                setReferences([...references, { ...newRef, id: data[0].id }]);
                                alert("Reference added!");
                            }
                            setIsAddReferenceOpen(false);
                            setEditingReference(null);
                        } catch (error) {
                            console.error("Error saving reference:", error);
                            alert("Failed to save reference.");
                        }
                    }}
                />

                <AddSecondaryEducationModal
                    isOpen={isAddMatricOpen}
                    onClose={() => {
                        setIsAddMatricOpen(false);
                        setEditingMatric(null);
                    }}
                    initialData={editingMatric}
                    onAdd={async (data) => {
                        if (!currentUserId) return;
                        try {
                            const matricDataPayload = {
                                user_id: currentUserId,
                                type: 'high_school',
                                title: "Matric",
                                institution: data.schoolName || data.school,
                                year: data.completionYear || parseInt(data.year) || null,
                            };

                            if (data.id) {
                                const { error } = await supabase
                                    .from("qualifications")
                                    .update(matricDataPayload)
                                    .eq("id", data.id);
                                if (error) throw error;
                                setMatricData(data);
                                alert("Matric data updated!");
                            } else {
                                const { data: dbData, error } = await supabase
                                    .from("qualifications")
                                    .insert(matricDataPayload)
                                    .select();
                                if (error) throw error;
                                setMatricData({ ...data, id: dbData[0].id });
                                alert("Matric data saved!");
                            }
                            setIsAddMatricOpen(false);
                            setEditingMatric(null);
                        } catch (error) {
                            console.error("Error saving matric data:", error);
                            alert("Failed to save matric data.");
                        }
                    }}
                />

                <AddExperienceModal
                    isOpen={isAddExperienceOpen}
                    initialData={editingExperience}
                    onClose={() => {
                        setIsAddExperienceOpen(false);
                        setEditingExperience(null);
                    }}
                    onAdd={async (newExp: any) => {
                        if (!currentUserId) return;
                        try {
                            const experienceData = {
                                user_id: currentUserId,
                                company: newExp.company,
                                position: newExp.role,
                                description: newExp.description,
                                start_date: newExp.start_date,
                                end_date: newExp.end_date,
                                is_current: newExp.is_current,
                            };

                            if (newExp.id) {
                                // Update existing
                                const { error } = await supabase
                                    .from("work_experiences")
                                    .update(experienceData)
                                    .eq("id", newExp.id);
                                if (error) throw error;

                                setExperiences(experiences.map(e => e.id === newExp.id ? newExp : e));
                                alert("Experience updated!");
                            } else {
                                // Insert new
                                const { data, error } = await supabase
                                    .from("work_experiences")
                                    .insert(experienceData)
                                    .select();
                                if (error) throw error;

                                setExperiences([...experiences, { ...newExp, id: data[0].id }]);
                                alert("Experience added!");
                            }

                            setIsAddExperienceOpen(false);
                            setEditingExperience(null);
                        } catch (error: any) {
                            console.error("Error saving experience:", JSON.stringify(error, null, 2));
                            alert(`Failed to save experience: ${error.message || 'Check console for details'}`);
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
        </main >
    );
}
