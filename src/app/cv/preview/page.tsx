"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Download, ShieldCheck, Sparkles, Layout, Save, Eye, Edit3, X, Briefcase, GraduationCap, Award, Languages, ChevronDown, ChevronUp, Trash2, Plus, RefreshCcw, UserCheck, BookOpen, Palette } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ResumeDocument } from "@/components/pdf/ResumeDocument";

// Dynamically import PDF components to avoid SSR issues
const PDFViewer = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
    { ssr: false, loading: () => <div className="h-full flex items-center justify-center bg-slate-100 animate-pulse">Loading Preview...</div> }
);

const PDFDownloadLink = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
    { ssr: false }
);

export default function CVPreviewPage() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
    const [openSection, setOpenSection] = useState<string | null>("basics");

    useEffect(() => {
        setIsMounted(true);
        loadMasterData();
    }, [router]);

    const loadMasterData = () => {
        const savedUser = localStorage.getItem("user_basic_info");
        const user = savedUser ? JSON.parse(savedUser) : {
            name: "Moagi Marvin",
            headline: "Computer Science Graduate | Full-Stack Developer",
            email: "moagi@example.com",
            phone: "+27 61 234 5678",
            location: "Johannesburg, South Africa",
            summary: "Passionate Computer Science graduate with a strong foundation in full-stack development. Experienced in building scalable web applications using React, Node.js, and cloud technologies.",
            haveLicense: true,
            licenseCode: "Code 8 / B",
            haveCar: true
        };

        const experiences = JSON.parse(localStorage.getItem("user_experience_list") || JSON.stringify([
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
                description: "Mentored 3 junior developers and improved documentation for a popular UI library."
            }
        ]));

        const savedCredentials = JSON.parse(localStorage.getItem("user_credentials_list") || JSON.stringify([
            {
                title: "BSc Computer Science",
                issuer: "University of Johannesburg",
                date: "2021 - 2024",
                type: "education"
            },
            {
                title: "Google Cloud Professional Developer",
                issuer: "Google Cloud",
                date: "January 2024",
                type: "certification"
            }
        ]));

        const educationList = savedCredentials.filter((c: any) => c.type === "education");
        const certificationsList = savedCredentials.filter((c: any) => c.type === "certification");

        const skills = JSON.parse(localStorage.getItem("user_skills_list") || JSON.stringify([
            "React", "TypeScript", "Node.js", "Supabase", "TailwindCSS"
        ]));

        const projectsList = JSON.parse(localStorage.getItem("user_projects_list") || JSON.stringify([
            {
                title: "AI CV Optimizer",
                description: "Built with Next.js and Gemini AI to help students optimize their career paths.",
                technologies: ["Next.js", "Gemini AI", "Tailwind"]
            }
        ]));

        const languages = JSON.parse(localStorage.getItem("user_languages_list") || JSON.stringify([
            { language: "English", proficiency: "Native" },
            { language: "Zulu", proficiency: "Fluent" }
        ]));

        const references = JSON.parse(localStorage.getItem("user_references_list") || JSON.stringify([
            {
                name: "Sarah Jenkins",
                relationship: "Senior Developer / Manager",
                company: "Tech StartUp SA",
                email: "sarah@techstartup.co.za",
                phone: "+27 11 987 6543"
            }
        ]));

        const matricData = JSON.parse(localStorage.getItem("user_matric_data") || JSON.stringify({
            schoolName: "Johannesburg North High",
            completionYear: "2020",
            distinctionsCount: "4"
        }));

        setData({
            user,
            experiences,
            educationList,
            certificationsList,
            skills,
            projectsList,
            languages,
            references,
            matricData,
            template: 'modern'
        });
    };

    if (!data || !isMounted) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4 text-slate-400">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="font-medium">Preparing your professional preview...</p>
            </div>
        </div>
    );

    const handleUpdateUser = (field: string, value: any) => {
        setData({ ...data, user: { ...data.user, [field]: value } });
    };

    const handleUpdateExperience = (index: number, field: string, value: any) => {
        const newExps = [...data.experiences];
        newExps[index] = { ...newExps[index], [field]: value };
        setData({ ...data, experiences: newExps });
    };

    const handleUpdateEducation = (index: number, field: string, value: any) => {
        const newEdu = [...data.educationList];
        newEdu[index] = { ...newEdu[index], [field]: value };
        setData({ ...data, educationList: newEdu });
    };

    const handleUpdateCertification = (index: number, field: string, value: any) => {
        const newCerts = [...data.certificationsList];
        newCerts[index] = { ...newCerts[index], [field]: value };
        setData({ ...data, certificationsList: newCerts });
    };

    const handleUpdateProject = (index: number, field: string, value: any) => {
        const newProjects = [...data.projectsList];
        newProjects[index] = { ...newProjects[index], [field]: value };
        setData({ ...data, projectsList: newProjects });
    };

    const handleUpdateReference = (index: number, field: string, value: any) => {
        const newRefs = [...data.references];
        newRefs[index] = { ...newRefs[index], [field]: value };
        setData({ ...data, references: newRefs });
    };

    const handleUpdateMatric = (field: string, value: any) => {
        setData({ ...data, matricData: { ...data.matricData, [field]: value } });
    };

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            {/* Header */}
            <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/profile" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-white font-bold text-sm">Resume Live Editor</h1>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Tweak & Download</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadMasterData}
                        className="flex lg:hidden items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-all text-xs font-bold mr-2"
                        title="Reset to Master Data"
                    >
                        <RefreshCcw className="w-3.5 h-3.5" />
                    </button>

                    <div className="hidden lg:flex bg-slate-800 p-1 rounded-lg mr-4">
                        <button
                            onClick={loadMasterData}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-slate-400 hover:text-white transition-all text-[10px] font-bold uppercase"
                        >
                            <RefreshCcw className="w-3 h-3" />
                            Reset Changes
                        </button>
                    </div>

                    {/* Responsive Toggle */}
                    <div className="flex xl:hidden bg-slate-800 p-1 rounded-lg mr-2">
                        <button
                            onClick={() => setActiveTab("edit")}
                            className={`p-1.5 rounded-md transition-all ${activeTab === 'edit' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'}`}
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setActiveTab("preview")}
                            className={`p-1.5 rounded-md transition-all ${activeTab === 'preview' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'}`}
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>

                    <PDFDownloadLink
                        document={<ResumeDocument data={data} />}
                        fileName={`${data.user.name.replace(/\s+/g, '_')}_Final_Resume.pdf`}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold text-sm shadow-xl"
                    >
                        {({ loading }: any) => (
                            <>
                                <Download className="w-4 h-4" />
                                {loading ? 'Generating...' : 'Download PDF'}
                            </>
                        )}
                    </PDFDownloadLink>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Editor Sidebar */}
                <aside className={`w-full xl:w-[450px] bg-slate-50 border-r border-slate-200 overflow-y-auto ${activeTab === 'preview' ? 'hidden xl:block' : 'block'}`}>
                    <div className="p-6 space-y-4">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-blue-600" />
                                Tailor Content
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">Changes made here are temporary and used only for this PDF generation.</p>
                        </div>

                        {/* Accordion Sections */}

                        {/* 0. Template Selection */}
                        <div className="bg-white rounded-xl border border-blue-100 overflow-hidden shadow-sm ring-1 ring-blue-50">
                            <button
                                onClick={() => toggleSection('template')}
                                className="w-full flex items-center justify-between p-4 bg-blue-50/30 hover:bg-blue-50 transition-colors font-bold text-sm text-blue-700"
                            >
                                <span className="flex items-center gap-3">
                                    <Palette className="w-4 h-4 text-blue-600" />
                                    Choose Style
                                </span>
                                {openSection === 'template' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            {openSection === 'template' && (
                                <div className="p-4 border-t border-slate-100 flex gap-2 animate-in slide-in-from-top-2 duration-200">
                                    {['modern', 'minimalist', 'executive'].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setData({ ...data, template: t })}
                                            className={`flex-1 py-3 px-1 rounded-xl border-2 transition-all font-bold text-[9px] uppercase tracking-wider ${data.template === t ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 1. Basics */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <button
                                onClick={() => toggleSection('basics')}
                                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors font-bold text-sm text-slate-700"
                            >
                                <span className="flex items-center gap-3">
                                    <Edit3 className="w-4 h-4 text-blue-600" />
                                    Basics & Intro
                                </span>
                                {openSection === 'basics' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            {openSection === 'basics' && (
                                <div className="p-4 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Target Job Title</label>
                                        <input
                                            type="text"
                                            value={data.user.headline}
                                            onChange={(e) => handleUpdateUser("headline", e.target.value)}
                                            className="editor-input"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Professional Summary</label>
                                        <textarea
                                            value={data.user.summary}
                                            onChange={(e) => handleUpdateUser("summary", e.target.value)}
                                            className="editor-textarea h-40"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Location</label>
                                            <input type="text" value={data.user.location} onChange={(e) => handleUpdateUser("location", e.target.value)} className="editor-input" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Phone</label>
                                            <input type="text" value={data.user.phone} onChange={(e) => handleUpdateUser("phone", e.target.value)} className="editor-input" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Experience */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <button
                                onClick={() => toggleSection('experience')}
                                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors font-bold text-sm text-slate-700"
                            >
                                <span className="flex items-center gap-3">
                                    <Briefcase className="w-4 h-4 text-blue-600" />
                                    Work Experience ({data.experiences.length})
                                </span>
                                {openSection === 'experience' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            {openSection === 'experience' && (
                                <div className="p-4 border-t border-slate-100 space-y-6 animate-in slide-in-from-top-2 duration-200">
                                    {data.experiences.map((exp: any, idx: number) => (
                                        <div key={idx} className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Position #{idx + 1}</h4>
                                                <button onClick={() => {
                                                    const newExps = data.experiences.filter((_: any, i: number) => i !== idx);
                                                    setData({ ...data, experiences: newExps });
                                                }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Role</label>
                                                    <input placeholder="Job Title" value={exp.role} onChange={(e) => handleUpdateExperience(idx, "role", e.target.value)} className="editor-input font-bold" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Company</label>
                                                    <input placeholder="Company" value={exp.company} onChange={(e) => handleUpdateExperience(idx, "company", e.target.value)} className="editor-input" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Duration</label>
                                                <input placeholder="Jan 2020 - Present" value={exp.duration} onChange={(e) => handleUpdateExperience(idx, "duration", e.target.value)} className="editor-input text-xs" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Achievements</label>
                                                <textarea placeholder="Key Achievements..." value={exp.description} onChange={(e) => handleUpdateExperience(idx, "description", e.target.value)} className="editor-textarea h-24 text-xs" />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => setData({ ...data, experiences: [...data.experiences, { role: "", company: "", duration: "", description: "" }] })} className="w-full py-2 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all font-bold text-xs">
                                        <Plus className="w-4 h-4" /> Add Experience
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 3. Education & Matric */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <button
                                onClick={() => toggleSection('education')}
                                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors font-bold text-sm text-slate-700"
                            >
                                <span className="flex items-center gap-3">
                                    <GraduationCap className="w-4 h-4 text-blue-600" />
                                    Education & Matric
                                </span>
                                {openSection === 'education' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            {openSection === 'education' && (
                                <div className="p-4 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                    {/* Matric Section */}
                                    {data.matricData ? (
                                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 mb-4 relative group">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Matric / High School</h4>
                                                <button
                                                    onClick={() => setData({ ...data, matricData: null })}
                                                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">School Name</label>
                                                    <input placeholder="e.g. Pretoria Boys High" value={data.matricData.schoolName} onChange={(e) => handleUpdateMatric("schoolName", e.target.value)} className="editor-input" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Year</label>
                                                        <input placeholder="2020" value={data.matricData.completionYear} onChange={(e) => handleUpdateMatric("completionYear", e.target.value)} className="editor-input" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Distinctions</label>
                                                        <input placeholder="0" value={data.matricData.distinctions_count || data.matricData.distinctionsCount || "0"} onChange={(e) => handleUpdateMatric("distinctions_count", e.target.value)} className="editor-input" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <button onClick={() => setData({ ...data, matricData: { schoolName: "", completionYear: "", distinctionsCount: "0" } })} className="w-full py-2 flex items-center justify-center gap-2 border-2 border-dashed border-blue-100 text-blue-400 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all font-bold text-[10px] uppercase mb-4">
                                            <Plus className="w-3 h-3" /> Add Matric Results
                                        </button>
                                    )}

                                    <div className="space-y-1 self-start">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Higher Education</label>
                                    </div>

                                    {data.educationList.map((edu: any, idx: number) => (
                                        <div key={idx} className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Education #{idx + 1}</h4>
                                                <button onClick={() => {
                                                    const newList = data.educationList.filter((_: any, i: number) => i !== idx);
                                                    setData({ ...data, educationList: newList });
                                                }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Degree / Qualification</label>
                                                    <input placeholder="e.g. BSc Computer Science" value={edu.title} onChange={(e) => handleUpdateEducation(idx, "title", e.target.value)} className="editor-input font-bold" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Institution</label>
                                                    <input placeholder="e.g. University of Witwatersrand" value={edu.issuer} onChange={(e) => handleUpdateEducation(idx, "issuer", e.target.value)} className="editor-input" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Duration / Year</label>
                                                    <input placeholder="e.g. 2021 - 2024" value={edu.date} onChange={(e) => handleUpdateEducation(idx, "date", e.target.value)} className="editor-input text-xs" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => setData({ ...data, educationList: [...data.educationList, { title: "", issuer: "", date: "", type: "education" }] })} className="w-full py-2 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all font-bold text-xs mt-2">
                                        <Plus className="w-4 h-4" /> Add Qualification
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 4. Skills */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <button
                                onClick={() => toggleSection('skills')}
                                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors font-bold text-sm text-slate-700"
                            >
                                <span className="flex items-center gap-3">
                                    <Languages className="w-4 h-4 text-blue-600" />
                                    Skills & Badges
                                </span>
                                {openSection === 'skills' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            {openSection === 'skills' && (
                                <div className="p-4 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                    <div className="flex flex-col space-y-3">
                                        {[...data.skills].reverse().map((skill: any, idx: number) => {
                                            const originalIdx = data.skills.length - 1 - idx;
                                            return (
                                                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 group relative">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                                    <input
                                                        value={typeof skill === 'string' ? skill : (skill.name || "")}
                                                        onChange={(e) => {
                                                            const newSkills = [...data.skills];
                                                            if (typeof skill === 'string') newSkills[originalIdx] = e.target.value;
                                                            else newSkills[originalIdx] = { ...skill, name: e.target.value };
                                                            setData({ ...data, skills: newSkills });
                                                        }}
                                                        className="bg-transparent outline-none flex-1 text-[11px] font-bold text-slate-700 leading-relaxed"
                                                        placeholder="Describe your skill..."
                                                    />
                                                    <button onClick={() => {
                                                        const newSkills = data.skills.filter((_: any, i: number) => i !== originalIdx);
                                                        setData({ ...data, skills: newSkills });
                                                    }} className="text-slate-300 hover:text-red-500 transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <button onClick={() => setData({ ...data, skills: [...data.skills, "New Skill"] })} className="w-full py-2 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all font-bold text-xs">
                                        <Plus className="w-4 h-4" /> Add Skill
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 4.5 Projects */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <button
                                onClick={() => toggleSection('projects')}
                                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors font-bold text-sm text-slate-700"
                            >
                                <span className="flex items-center gap-3">
                                    <Sparkles className="w-4 h-4 text-blue-600" />
                                    Projects ({data.projectsList?.length || 0})
                                </span>
                                {openSection === 'projects' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            {openSection === 'projects' && (
                                <div className="p-4 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                    {data.projectsList?.map((project: any, idx: number) => (
                                        <div key={idx} className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                                            <div className="flex justify-between items-start">
                                                <input placeholder="Project Title" value={project.title} onChange={(e) => handleUpdateProject(idx, "title", e.target.value)} className="bg-transparent font-bold text-xs text-slate-800 outline-none w-full" />
                                                <button onClick={() => {
                                                    const newList = data.projectsList.filter((_: any, i: number) => i !== idx);
                                                    setData({ ...data, projectsList: newList });
                                                }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <textarea placeholder="Description" value={project.description} onChange={(e) => handleUpdateProject(idx, "description", e.target.value)} className="editor-textarea h-20 text-xs" />
                                        </div>
                                    ))}
                                    <button onClick={() => setData({ ...data, projectsList: [...(data.projectsList || []), { title: "", description: "" }] })} className="w-full py-2 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all font-bold text-xs">
                                        <Plus className="w-4 h-4" /> Add Project
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 4.6 Certifications */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <button
                                onClick={() => toggleSection('certifications')}
                                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors font-bold text-sm text-slate-700"
                            >
                                <span className="flex items-center gap-3">
                                    <Award className="w-4 h-4 text-blue-600" />
                                    Certifications ({data.certificationsList?.length || 0})
                                </span>
                                {openSection === 'certifications' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            {openSection === 'certifications' && (
                                <div className="p-4 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                    {data.certificationsList?.map((cert: any, idx: number) => (
                                        <div key={idx} className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200 group">
                                            <div className="flex justify-between items-center mb-1">
                                                <input value={cert.title} onChange={(e) => handleUpdateCertification(idx, "title", e.target.value)} className="bg-transparent font-bold text-xs text-slate-800 outline-none w-full" />
                                                <button onClick={() => {
                                                    const newList = data.certificationsList.filter((_: any, i: number) => i !== idx);
                                                    setData({ ...data, certificationsList: newList });
                                                }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input value={cert.issuer} onChange={(e) => handleUpdateCertification(idx, "issuer", e.target.value)} className="bg-transparent text-[10px] text-slate-500 outline-none w-full" />
                                                <input value={cert.date} onChange={(e) => handleUpdateCertification(idx, "date", e.target.value)} className="bg-transparent text-[10px] text-slate-500 outline-none w-full text-right" placeholder="Date" />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => setData({ ...data, certificationsList: [...(data.certificationsList || []), { title: "", issuer: "", date: "" }] })} className="w-full py-2 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all font-bold text-xs">
                                        <Plus className="w-4 h-4" /> Add Certification
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 4.7 Languages */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <button
                                onClick={() => toggleSection('languages')}
                                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors font-bold text-sm text-slate-700"
                            >
                                <span className="flex items-center gap-3">
                                    <Languages className="w-4 h-4 text-blue-600" />
                                    Languages ({data.languages?.length || 0})
                                </span>
                                {openSection === 'languages' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            {openSection === 'languages' && (
                                <div className="p-4 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                    <div className="space-y-3">
                                        {data.languages?.map((lang: any, idx: number) => (
                                            <div key={idx} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 group relative">
                                                <button onClick={() => {
                                                    const newLangs = data.languages.filter((_: any, i: number) => i !== idx);
                                                    setData({ ...data, languages: newLangs });
                                                }} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        placeholder="Language"
                                                        value={typeof lang === 'string' ? lang : (lang.language || lang.name)}
                                                        onChange={(e) => {
                                                            const newLangs = [...data.languages];
                                                            if (typeof lang === 'string') newLangs[idx] = e.target.value;
                                                            else newLangs[idx] = { ...lang, language: e.target.value };
                                                            setData({ ...data, languages: newLangs });
                                                        }}
                                                        className="editor-input text-xs"
                                                    />
                                                    <input
                                                        placeholder="Proficiency"
                                                        value={typeof lang === 'string' ? "" : (lang.proficiency || lang.level)}
                                                        onChange={(e) => {
                                                            const newLangs = [...data.languages];
                                                            if (typeof lang === 'string') newLangs[idx] = { language: lang, proficiency: e.target.value };
                                                            else newLangs[idx] = { ...lang, proficiency: e.target.value };
                                                            setData({ ...data, languages: newLangs });
                                                        }}
                                                        className="editor-input text-xs"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => setData({ ...data, languages: [...(data.languages || []), { language: "New Language", proficiency: "Fluent" }] })} className="w-full py-2 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all font-bold text-xs mt-3">
                                        <Plus className="w-4 h-4" /> Add Language
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 5. References */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <button
                                onClick={() => toggleSection('references')}
                                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors font-bold text-sm text-slate-700"
                            >
                                <span className="flex items-center gap-3">
                                    <UserCheck className="w-4 h-4 text-blue-600" />
                                    References ({data.references?.length || 0})
                                </span>
                                {openSection === 'references' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            {openSection === 'references' && (
                                <div className="p-4 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                    {data.references?.map((ref: any, idx: number) => (
                                        <div key={idx} className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                                            <div className="flex justify-between items-start">
                                                <input placeholder="Name" value={ref.name} onChange={(e) => handleUpdateReference(idx, "name", e.target.value)} className="bg-transparent font-bold text-xs text-slate-800 outline-none w-full" />
                                                <button onClick={() => {
                                                    const newRefs = data.references.filter((_: any, i: number) => i !== idx);
                                                    setData({ ...data, references: newRefs });
                                                }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <input placeholder="Relationship" value={ref.relationship} onChange={(e) => handleUpdateReference(idx, "relationship", e.target.value)} className="editor-input text-[10px] py-1 mb-1" />
                                            <input placeholder="Company" value={ref.company} onChange={(e) => handleUpdateReference(idx, "company", e.target.value)} className="editor-input text-[10px] py-1" />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input placeholder="Email" value={ref.email} onChange={(e) => handleUpdateReference(idx, "email", e.target.value)} className="editor-input text-[10px] py-1" />
                                                <input placeholder="Phone" value={ref.phone} onChange={(e) => handleUpdateReference(idx, "phone", e.target.value)} className="editor-input text-[10px] py-1" />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => setData({ ...data, references: [...(data.references || []), { name: "", relationship: "", company: "", email: "", phone: "" }] })} className="w-full py-2 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all font-bold text-xs">
                                        <Plus className="w-4 h-4" /> Add Reference
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                </aside>

                {/* Preview Area */}
                <section className={`flex-1 bg-slate-800 p-8 flex flex-col ${activeTab === 'edit' ? 'hidden xl:flex' : 'flex'}`}>
                    <div className="flex-1 rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-white relative">
                        {/* Status HUD */}
                        <div className="absolute top-4 right-4 z-10 hidden md:flex bg-slate-900/80 backdrop-blur-md p-2 rounded-xl text-white text-[10px] items-center gap-4 shadow-xl">
                            <div className="flex items-center gap-2 px-2 border-r border-slate-700">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                Live Sync Active
                            </div>
                            <div className="flex items-center gap-2 px-2 border-r border-slate-700">
                                <Palette className="w-3 h-3 text-blue-400" />
                                <span className="capitalize">{data.template} style</span>
                            </div>
                            <p className="text-slate-400 font-medium">ATS Score: <span className="text-green-400 font-bold">Optimized</span></p>
                        </div>

                        <PDFViewer
                            width="100%"
                            height="100%"
                            className="border-none"
                            showToolbar={false}
                        >
                            <ResumeDocument data={data} />
                        </PDFViewer>
                    </div>
                </section>
            </main>

            {/* Custom Inputs Styling */}
            <style jsx>{`
                .editor-input {
                    width: 100%;
                    padding: 0.6rem 0.75rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    outline: none;
                    transition: all 0.2s;
                    font-size: 0.8125rem;
                    font-weight: 500;
                    color: #1e293b;
                }
                .editor-input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.05);
                }
                .editor-textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    outline: none;
                    transition: all 0.2s;
                    font-size: 0.8125rem;
                    line-height: 1.6;
                    font-weight: 500;
                    color: #1e293b;
                    resize: none;
                }
                .editor-textarea:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.05);
                }
            `}</style>
        </div>
    );
}
