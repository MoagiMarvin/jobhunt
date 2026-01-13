"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Sparkles, User, Mail, Phone, LogOut, Edit2, Save, X, Loader2, GraduationCap, FolderKanban, Plus, Building2, Languages, Award, Briefcase } from "lucide-react";
import Link from "next/link";
import ProfileHeader from "@/components/talent/ProfileHeader";
import ProjectCard from "@/components/talent/ProjectCard";
import CredentialCard from "@/components/talent/CredentialCard";
import ExperienceCard from "@/components/talent/ExperienceCard";
import EditProfileModal from "@/components/talent/EditProfileModal";
import AddSkillModal from "@/components/talent/AddSkillModal";
import AddCredentialModal from "@/components/talent/AddCredentialModal";
import AddProjectModal from "@/components/talent/AddProjectModal";
import EditSummaryModal from "@/components/talent/EditSummaryModal";
import DownloadResumeButton from "@/components/pdf/DownloadResumeButton";

export default function ProfilePage() {

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
        haveCar: true,
        summary: "Passionate Computer Science graduate with a strong foundation in full-stack development. Experienced in building scalable web applications using React, Node.js, and cloud technologies. Eager to contribute to innovative projects and continue learning in a fast-paced environment."
    });

    const [skills, setSkills] = useState<string[]>([
        "React", "TypeScript", "Python", "Public Speaking", "Agile Methodology"
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

    const [isEditing, setIsEditing] = useState(false);
    const [isEditSummaryOpen, setIsEditSummaryOpen] = useState(false);
    const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
    const [isAddLanguageOpen, setIsAddLanguageOpen] = useState(false); // New Language Modal State
    const [newLanguage, setNewLanguage] = useState({ language: "", proficiency: "Fluent" });
    const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
    const [isAddCredentialOpen, setIsAddCredentialOpen] = useState<{ open: boolean, type: "education" | "certification" }>({ open: false, type: "education" });

    const [editedUser, setEditedUser] = useState(user);

    const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);

    // Load everything from unified keys
    useEffect(() => {
        const savedBasic = localStorage.getItem("user_basic_info");
        if (savedBasic) {
            const parsed = JSON.parse(savedBasic);
            setUser(prev => ({ ...prev, ...parsed }));
            setEditedUser(prev => ({ ...prev, ...parsed }));
        }

        const savedSkills = localStorage.getItem("user_skills_list");
        if (savedSkills) setSkills(JSON.parse(savedSkills));

        const savedProjects = localStorage.getItem("user_projects_list");
        if (savedProjects) setProjectsList(JSON.parse(savedProjects));

        const savedExperience = localStorage.getItem("user_experience_list");
        if (savedExperience) setExperiences(JSON.parse(savedExperience));

        const savedCredentials = localStorage.getItem("user_credentials_list");
        if (savedCredentials) {
            const parsed = JSON.parse(savedCredentials);
            setEducationList(parsed.filter((c: any) => c.type === "education"));
            setCertificationsList(parsed.filter((c: any) => c.type === "certification"));
        }

        const savedLanguages = localStorage.getItem("user_languages_list");
        if (savedLanguages) setLanguages(JSON.parse(savedLanguages));
    }, []);

    const handleSave = () => {
        setUser(editedUser);
        setIsEditing(false);
        // Persist to unified keys
        localStorage.setItem("user_basic_info", JSON.stringify(editedUser));
        alert("Profile saved successfully!");
    };

    const handleCancel = () => {
        setEditedUser(user);
        setIsEditing(false);
    };

    const handleLogout = () => {
        // Mock logout - in real app this would clear tokens and redirect
        console.log("Logging out...");
        alert("Logged out successfully (Mock)");
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
                        haveCar={user.haveCar}
                        onEdit={() => setIsEditing(true)}
                        downloadAction={<DownloadResumeButton data={{ user, experiences, educationList, skills, projectsList, certificationsList, languages }} />}
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
                <div className="mb-8 bg-blue-50/50 rounded-2xl border border-blue-100 p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-primary">Targeting Roles</h2>
                            <p className="text-[10px] text-slate-500 font-medium">What I'm looking for next</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {(user.targetRoles || []).map((role: string, idx: number) => (
                            <div
                                key={idx}
                                className="px-4 py-2 bg-white rounded-xl border border-blue-100 text-blue-600 text-sm font-bold shadow-sm hover:shadow-md transition-all cursor-default text-center min-w-[120px]"
                            >
                                {role}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Logout Button */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={handleLogout}
                        className="px-6 py-3 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 border-2 border-slate-100 hover:border-red-100 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>

                {/* Talent Profile */}
                <div>
                    <div className="space-y-8">
                        {/* Projects Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FolderKanban className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-xl font-bold text-primary">Projects</h2>
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
                                    <h2 className="text-xl font-bold text-primary">Experience</h2>
                                </div>
                                <button
                                    onClick={() => alert("Add Experience feature coming soon with database integration.")}
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
                                    <h2 className="text-xl font-bold text-primary">Skills</h2>
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
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill: any, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 group/skill">
                                            <span className="text-sm font-semibold text-slate-700">{typeof skill === 'string' ? skill : skill.name}</span>
                                            <button
                                                onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                                                className="text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    {skills.length === 0 && (
                                        <p className="text-sm text-slate-400 italic">No skills added yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Languages Section (New) */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Languages className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-xl font-bold text-primary">Languages</h2>
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
                                                onClick={() => setLanguages(languages.filter((_, i) => i !== idx))}
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
                                    <h2 className="text-xl font-bold text-primary">Education</h2>
                                </div>
                                <button
                                    onClick={() => setIsAddCredentialOpen({ open: true, type: "education" })}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all border border-blue-700 shadow-sm"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Education
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
                                        onDelete={() => setEducationList(educationList.filter((_: any, i: number) => i !== idx))}
                                        isOwner={true}
                                    />
                                ))}
                            </div>
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
                                        onDelete={() => setCertificationsList(certificationsList.filter((_: any, i: number) => i !== idx))}
                                        isOwner={true}
                                    />
                                ))}
                            </div>
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
                    localStorage.setItem("user_details", JSON.stringify(newData));
                    alert("Profile updated successfully!");
                }}
                initialData={user}
            />
            <AddSkillModal
                isOpen={isAddSkillOpen}
                onClose={() => setIsAddSkillOpen(false)}
                onAdd={(newSkillName) => {
                    setSkills([...skills, newSkillName]);
                    setIsAddSkillOpen(false);
                }}
            />
            <EditSummaryModal
                isOpen={isEditSummaryOpen}
                initialSummary={user.summary}
                onClose={() => setIsEditSummaryOpen(false)}
                onSave={(newSummary) => {
                    const updatedUser = { ...user, summary: newSummary };
                    setUser(updatedUser);
                    localStorage.setItem("user_basic_info", JSON.stringify(updatedUser)); // Persist immediately
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
                                            setLanguages([...languages, newLanguage]);
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
                        setEducationList([...educationList, newCredential]);
                    } else {
                        setCertificationsList([...certificationsList, newCredential]);
                    }
                    setIsAddCredentialOpen({ ...isAddCredentialOpen, open: false });
                }}
            />

            <AddProjectModal
                isOpen={isAddProjectOpen}
                onClose={() => setIsAddProjectOpen(false)}
                onAdd={(newProject: any) => {
                    setProjectsList([...projectsList, newProject]);
                    setIsAddProjectOpen(false);
                }}
            />
            </div>
        </main>
    );
}
