"use client";

import { useState } from "react";
import { ArrowLeft, Save, Plus, Trash2, Linkedin, Github, Globe, Briefcase, GraduationCap, X, Award, Languages, Layout, AlertCircle, CheckCircle2, Tags } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- Types ---
interface Experience {
    id: number;
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

interface Education {
    id: number;
    degree: string;
    school: string;
    year: string;
}

interface Project {
    id: number;
    title: string;
    role: string;
    date: string;
    description: string;
}

interface Certification {
    id: number;
    name: string;
    issuer: string;
    date: string;
}

interface Language {
    id: number;
    language: string;
    proficiency: string;
}

interface Skill {
    id: number;
    name: string;
    category: "Technical" | "Professional" | "Soft";
}

// 15 Industries List
const INDUSTRIES = {
    "Professional Services": [
        "HR/Human Resources",
        "Finance/Accounting",
        "Legal",
        "IT/Tech",
        "Engineering",
        "Healthcare"
    ],
    "Business & Commerce": [
        "Sales/Marketing",
        "Logistics/Supply Chain"
    ],
    "Creative & Media": [
        "Creative/Media/Design"
    ],
    "Trades & Technical": [
        "Trades/Artisans",
        "Drivers/Transport"
    ],
    "Services": [
        "Hospitality/Tourism",
        "Education/Teaching",
        "Social Services"
    ],
    "General": [
        "General/Entry-Level/Admin"
    ]
};

// Internal Logic Modes
type LayoutMode = "tech" | "corporate" | "operational";

export default function CreateCVPage() {
    const router = useRouter();

    // --- State: Industry / Mode ---
    const [industry, setIndustry] = useState<string>("Finance/Accounting");

    // Helper: Map Industry to Layout Mode
    const getLayoutMode = (ind: string): LayoutMode => {
        // Tech & Creative
        if (["IT/Tech", "Creative/Media/Design", "Engineering"].includes(ind)) return "tech";

        // Operational / Trades / Healthcare / Services (Needs Certs/Licenses)
        if (["Trades/Artisans", "Drivers/Transport", "Logistics/Supply Chain", "Hospitality/Tourism", "Healthcare", "Social Services", "Science/Research"].includes(ind)) return "operational";

        // Corporate / Standard
        return "corporate";
    };

    const currentMode = getLayoutMode(industry);

    // --- State: Form Data ---
    const [basics, setBasics] = useState({
        name: "Moagi Marvin", // Default mock
        email: "moagi@example.com", // Default mock
        phone: "+27 61 234 5678", // Default mock
        location: "",
        jobTitle: "",
        summary: "",
        linkedin: "",
        github: "",
        portfolio: "",
        driverLicense: "",
        ownVehicle: false
    });

    const [experiences, setExperiences] = useState<Experience[]>([
        { id: 1, title: "", company: "", startDate: "", endDate: "", current: false, description: "" }
    ]);

    const [educations, setEducations] = useState<Education[]>([
        { id: 1, degree: "", school: "", year: "" }
    ]);

    const [projects, setProjects] = useState<Project[]>([]);

    const [certifications, setCertifications] = useState<Certification[]>([]);

    const [languages, setLanguages] = useState<Language[]>([
        { id: 1, language: "English", proficiency: "Professional" }
    ]);

    // Skills State
    const [skills, setSkills] = useState<string[]>([]);
    const [currentSkill, setCurrentSkill] = useState("");

    // --- Handlers (Generic) ---
    const handleSave = () => {
        // 1. Save Basic Info
        const basicInfo = {
            ...basics,
            headline: basics.jobTitle, // Map job title to headline
            availabilityStatus: "Looking for Work",
        };
        localStorage.setItem("user_basic_info", JSON.stringify(basicInfo));

        // 2. Save Skills
        localStorage.setItem("user_skills_list", JSON.stringify(skills));

        // 3. Save Experience
        const mappedExperience = experiences.map(exp => ({
            role: exp.title,
            company: exp.company,
            duration: `${exp.startDate} - ${exp.current ? "Present" : exp.endDate}`,
            description: exp.description
        }));
        localStorage.setItem("user_experience_list", JSON.stringify(mappedExperience));

        // 4. Save Credentials (Education + Certifications)
        const mappedCredentials = [
            ...educations.map(edu => ({
                type: "education",
                title: edu.degree,
                issuer: edu.school,
                date: edu.year,
                isVerified: false
            })),
            ...certifications.map(cert => ({
                type: "certification",
                title: cert.name,
                issuer: cert.issuer,
                date: cert.date,
                isVerified: false
            }))
        ];
        localStorage.setItem("user_credentials_list", JSON.stringify(mappedCredentials));

        // 5. Save Projects
        const mappedProjects = projects.map(proj => ({
            title: proj.title,
            description: proj.description,
            technologies: [], // Can be extracted or left empty
            date: proj.date
        }));
        localStorage.setItem("user_projects_list", JSON.stringify(mappedProjects));

        // 6. Save Languages
        localStorage.setItem("user_languages_list", JSON.stringify(languages));

        // Notify and Redirect
        alert("Master Profile Saved! Your Talent Profile has been updated.");
        router.push("/profile");
    };

    // Experience
    const addExperience = () => setExperiences([...experiences, { id: Date.now(), title: "", company: "", startDate: "", endDate: "", current: false, description: "" }]);
    const removeExperience = (id: number) => setExperiences(experiences.filter(exp => exp.id !== id));
    const updateExperience = (id: number, field: keyof Experience, value: any) => setExperiences(experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));

    // Education
    const addEducation = () => setEducations([...educations, { id: Date.now(), degree: "", school: "", year: "" }]);
    const removeEducation = (id: number) => setEducations(educations.filter(edu => edu.id !== id));
    const updateEducation = (id: number, field: keyof Education, value: any) => setEducations(educations.map(edu => edu.id === id ? { ...edu, [field]: value } : edu));

    // Projects
    const addProject = () => setProjects([...projects, { id: Date.now(), title: "", role: "", date: "", description: "" }]);
    const removeProject = (id: number) => setProjects(projects.filter(proj => proj.id !== id));
    const updateProject = (id: number, field: keyof Project, value: any) => setProjects(projects.map(proj => proj.id === id ? { ...proj, [field]: value } : proj));

    // Certifications
    const addCertification = () => setCertifications([...certifications, { id: Date.now(), name: "", issuer: "", date: "" }]);
    const removeCertification = (id: number) => setCertifications(certifications.filter(cert => cert.id !== id));
    const updateCertification = (id: number, field: keyof Certification, value: any) => setCertifications(certifications.map(cert => cert.id === id ? { ...cert, [field]: value } : cert));

    // Languages
    const addLanguage = () => setLanguages([...languages, { id: Date.now(), language: "", proficiency: "" }]);
    const removeLanguage = (id: number) => setLanguages(languages.filter(lang => lang.id !== id));
    const updateLanguage = (id: number, field: keyof Language, value: any) => setLanguages(languages.map(lang => lang.id === id ? { ...lang, [field]: value } : lang));


    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            {/* Top Bar / Navigation */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/profile" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">Build Your CV</h1>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                Optimized for: <span className="font-semibold text-blue-600">{industry}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">

                {/* 15-INDUSTRY SELECTOR */}
                <div className="mb-8 bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-blue-500" />
                        Select your Industry for the best layout:
                    </h3>
                    <div className="relative">
                        <select
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            className="w-full p-4 rounded-lg border-2 border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all appearance-none cursor-pointer hover:border-slate-300"
                        >
                            {Object.entries(INDUSTRIES).map(([category, items]) => (
                                <optgroup key={category} label={category} className="font-bold text-slate-900">
                                    {items.map(item => (
                                        <option key={item} value={item} className="text-slate-700 font-normal">
                                            {item}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-500 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        We'll adapt the form to highlight what recruiters in <strong>{industry}</strong> look for.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* 1. Basics */}
                    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                            <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-600 text-xs">1</span>
                            Professional Basics
                        </h2>

                        <div className="grid gap-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div><label className="label">Full Name</label><input type="text" value={basics.name} onChange={(e) => setBasics({ ...basics, name: e.target.value })} className="input-field" /></div>
                                <div><label className="label">Job Title</label><input type="text" value={basics.jobTitle} onChange={(e) => setBasics({ ...basics, jobTitle: e.target.value })} placeholder="e.g. Financial Analyst" className="input-field" /></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div><label className="label">Email</label><input type="email" value={basics.email} onChange={(e) => setBasics({ ...basics, email: e.target.value })} className="input-field" /></div>
                                <div><label className="label">Phone</label><input type="tel" value={basics.phone} onChange={(e) => setBasics({ ...basics, phone: e.target.value })} className="input-field" /></div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div><label className="label">Location</label><input type="text" value={basics.location} onChange={(e) => setBasics({ ...basics, location: e.target.value })} placeholder="e.g. Pretoria, Gauteng" className="input-field" /></div>
                            </div>

                            {/* License & Transport */}
                            <div className="grid md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <div>
                                    <label className="label">Driver's License</label>
                                    <select
                                        value={basics.driverLicense}
                                        onChange={(e) => setBasics({ ...basics, driverLicense: e.target.value })}
                                        className="input-field text-slate-700"
                                    >
                                        <option value="">Select License...</option>
                                        <option value="None">None</option>
                                        <option value="Learners">Learner's License</option>
                                        <option value="Code 8 (B)">Code 08 (B) - Car</option>
                                        <option value="Code 10 (C1)">Code 10 (C1) - Heavy Vehicle</option>
                                        <option value="Code 14 (EC)">Code 14 (EC) - Extra Heavy</option>
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-100 rounded-lg w-full transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={basics.ownVehicle}
                                            onChange={(e) => setBasics({ ...basics, ownVehicle: e.target.checked })}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                        />
                                        <span className="text-sm font-semibold text-slate-700">I have my own vehicle</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="label">Professional Summary</label>
                                <textarea
                                    value={basics.summary}
                                    onChange={(e) => setBasics({ ...basics, summary: e.target.value })}
                                    placeholder="e.g. Results-driven professional with 5 years experience in Supply Chain. Proven track record of reducing costs by 15%..."
                                    className="input-field h-32 resize-none"
                                />
                            </div>

                            {/* DYNAMIC LINKS SECTION */}
                            <div className="grid md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg">
                                <div className="col-span-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Social & Portfolio Links</div>

                                <div>
                                    <label className="label flex items-center gap-2"><Linkedin className="w-3 h-3 text-blue-700" /> LinkedIn</label>
                                    <input type="url" value={basics.linkedin} onChange={(e) => setBasics({ ...basics, linkedin: e.target.value })} placeholder="linkedin.com/..." className="input-field text-sm" />
                                </div>

                                {currentMode === "tech" && (
                                    <>
                                        <div>
                                            <label className="label flex items-center gap-2"><Github className="w-3 h-3 text-slate-800" /> GitHub</label>
                                            <input type="url" value={basics.github} onChange={(e) => setBasics({ ...basics, github: e.target.value })} placeholder="github.com/..." className="input-field text-sm" />
                                        </div>
                                        <div>
                                            <label className="label flex items-center gap-2"><Globe className="w-3 h-3 text-green-600" /> Portfolio</label>
                                            <input type="url" value={basics.portfolio} onChange={(e) => setBasics({ ...basics, portfolio: e.target.value })} placeholder="mysite.com" className="input-field text-sm" />
                                        </div>
                                    </>
                                )}

                                {currentMode !== "tech" && (
                                    <div>
                                        <label className="label flex items-center gap-2"><Globe className="w-3 h-3 text-slate-600" /> Website / Portfolio</label>
                                        <input type="url" value={basics.portfolio} onChange={(e) => setBasics({ ...basics, portfolio: e.target.value })} placeholder="optional..." className="input-field text-sm" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. Skills (Simplified) */}
                    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-600 text-xs">2</span>
                                Skills & Competencies
                            </h2>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={currentSkill}
                                onChange={(e) => setCurrentSkill(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && currentSkill.trim()) {
                                        if (!skills.includes(currentSkill.trim())) {
                                            setSkills([...skills, currentSkill.trim()]);
                                        }
                                        setCurrentSkill("");
                                    }
                                }}
                                placeholder="Add a skill (e.g. Excel, React, Leadership)..."
                                className="input-field"
                            />
                            <button onClick={() => {
                                if (currentSkill.trim()) {
                                    if (!skills.includes(currentSkill.trim())) {
                                        setSkills([...skills, currentSkill.trim()]);
                                    }
                                    setCurrentSkill("");
                                }
                            }} className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><Plus className="w-4 h-4" /></button>
                        </div>

                        <div className="space-y-4">
                            {skills.length > 0 ? (
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-white text-slate-700 rounded-full text-sm font-medium border border-slate-200 flex items-center gap-2 shadow-sm">
                                                {skill}
                                                <button onClick={() => setSkills(skills.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-slate-400 text-sm">No skills added yet. Type above and press Enter or click +.</div>
                            )}
                        </div>
                    </div>

                    {/* 3. Experience */}
                    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
                        <div className="flex justify-between mb-6 border-b border-slate-100 pb-4">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-600 text-xs">3</span>
                                Work Experience
                            </h2>
                            <button onClick={addExperience} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
                        </div>
                        <div className="space-y-6">
                            {experiences.map((exp) => (
                                <div key={exp.id} className="p-5 bg-slate-50 rounded-lg border border-slate-200 relative group">
                                    <button onClick={() => removeExperience(exp.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                                        <div><label className="label-xs">Title</label><input type="text" value={exp.title} onChange={(e) => updateExperience(exp.id, 'title', e.target.value)} className="input-field" /></div>
                                        <div><label className="label-xs">Company</label><input type="text" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} className="input-field" /></div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                                        <div><label className="label-xs">Start</label><input type="month" value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} className="input-field" /></div>
                                        <div>
                                            <label className="label-xs">End</label>
                                            <input type="month" disabled={exp.current} value={exp.endDate} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} className="input-field disabled:bg-slate-100" />
                                            <div className="mt-1 flex items-center gap-2"><input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)} /><span className="text-xs text-slate-600">Current</span></div>
                                        </div>
                                    </div>
                                    <textarea
                                        value={exp.description}
                                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                        placeholder="e.g. • Increased revenue by 45% through new strategy&#10;• Led team of 8 to achieve 98% customer satisfaction&#10;• Streamlined operations saving 200+ hours monthly"
                                        className="input-field h-24 resize-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Education */}
                    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
                        <div className="flex justify-between mb-6 border-b border-slate-100 pb-4">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-600 text-xs">4</span>
                                Education
                            </h2>
                            <button onClick={addEducation} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
                        </div>
                        {educations.map((edu) => (
                            <div key={edu.id} className="flex gap-3 items-start p-3 mb-3 bg-slate-50 rounded-lg border border-slate-200">
                                <GraduationCap className="w-4 h-4 text-slate-400 mt-2.5 flex-shrink-0" />
                                <div className="grid md:grid-cols-3 gap-3 flex-1">
                                    <input type="text" placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} className="input-field" />
                                    <input type="text" placeholder="School" value={edu.school} onChange={(e) => updateEducation(edu.id, 'school', e.target.value)} className="input-field" />
                                    <input type="text" placeholder="Year" value={edu.year} onChange={(e) => updateEducation(edu.id, 'year', e.target.value)} className="input-field" />
                                </div>
                                <button onClick={() => removeEducation(edu.id)} className="text-slate-400 hover:text-red-500 self-center"><X className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>

                    {/* 5. Certifications (Highlighted for Operational/Trades) */}
                    <div className={`bg-white rounded-xl p-8 border shadow-sm transition-all ${currentMode === 'operational' ? 'border-green-200 ring-4 ring-green-50' : 'border-slate-200'}`}>
                        <div className="flex justify-between mb-6 border-b border-slate-100 pb-4">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                <span className={`flex items-center justify-center w-6 h-6 rounded text-xs ${currentMode === 'operational' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>5</span>
                                Certifications & Licenses
                            </h2>
                            <button onClick={addCertification} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
                        </div>
                        {currentMode === 'operational' && <p className="text-sm text-green-700 mb-4 bg-green-50 p-3 rounded-lg flex gap-2"><AlertCircle className="w-4 h-4" /> Crucial for {industry}: Include relevant Licenses, Safety Cards, and Registration Numbers.</p>}

                        {certifications.map((cert) => (
                            <div key={cert.id} className="flex gap-3 items-center p-3 mb-3 bg-slate-50 rounded-lg border border-slate-200">
                                <Award className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                                <div className="grid md:grid-cols-3 gap-3 flex-1">
                                    <input type="text" placeholder="Name (e.g. PDP)" value={cert.name} onChange={(e) => updateCertification(cert.id, 'name', e.target.value)} className="input-field" />
                                    <input type="text" placeholder="Issuer (e.g. dept of transport)" value={cert.issuer} onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)} className="input-field" />
                                    <input type="text" placeholder="Date" value={cert.date} onChange={(e) => updateCertification(cert.id, 'date', e.target.value)} className="input-field" />
                                </div>
                                <button onClick={() => removeCertification(cert.id)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                            </div>
                        ))}
                        {certifications.length === 0 && <div className="text-center py-4 text-slate-400 text-sm">No certifications added.</div>}
                    </div>

                    {/* 6. Projects (Important for Tech) */}
                    <div className={`bg-white rounded-xl p-8 border shadow-sm transition-all ${currentMode === 'tech' ? 'border-blue-200 ring-4 ring-blue-50' : 'border-slate-200'}`}>
                        <div className="flex justify-between mb-6 border-b border-slate-100 pb-4">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                <span className={`flex items-center justify-center w-6 h-6 rounded text-xs ${currentMode === 'tech' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>6</span>
                                Key Projects
                            </h2>
                            <button onClick={addProject} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
                        </div>
                        <div className="space-y-4">
                            {projects.map((proj) => (
                                <div key={proj.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative">
                                    <button onClick={() => removeProject(proj.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    <div className="grid md:grid-cols-2 gap-3 mb-2">
                                        <input type="text" value={proj.title} onChange={(e) => updateProject(proj.id, 'title', e.target.value)} placeholder="Project Name" className="input-field" />
                                        <input type="text" value={proj.role} onChange={(e) => updateProject(proj.id, 'role', e.target.value)} placeholder="My Role" className="input-field" />
                                    </div>
                                    <textarea value={proj.description} onChange={(e) => updateProject(proj.id, 'description', e.target.value)} placeholder="Outcome..." className="input-field h-16 resize-none" />
                                </div>
                            ))}
                            {projects.length === 0 && <div className="text-center py-4 text-slate-400 text-sm">No projects added.</div>}
                        </div>
                    </div>

                    {/* 7. Languages */}
                    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
                        <div className="flex justify-between mb-6 border-b border-slate-100 pb-4">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-600 text-xs">7</span>
                                Languages
                            </h2>
                            <button onClick={addLanguage} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                            {languages.map((lang) => (
                                <div key={lang.id} className="flex gap-2 items-center p-2 bg-slate-50 rounded border border-slate-200">
                                    <Languages className="w-4 h-4 text-slate-400" />
                                    <input type="text" placeholder="Language" value={lang.language} onChange={(e) => updateLanguage(lang.id, 'language', e.target.value)} className="input-field text-sm" />
                                    <select value={lang.proficiency} onChange={(e) => updateLanguage(lang.id, 'proficiency', e.target.value)} className="input-field text-sm">
                                        <option value="">Level</option>
                                        <option value="Native">Native</option>
                                        <option value="Fluent">Fluent</option>
                                        <option value="Basic">Basic</option>
                                    </select>
                                    <button onClick={() => removeLanguage(lang.id)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Helper Styles injected for cleanliness */}
            <style jsx>{`
                .label { display: block; font-size: 0.875rem; font-weight: 600; color: #334155; margin-bottom: 0.5rem; }
                .label-xs { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 0.25rem; }
                .input-field { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; outline: none; transition: all 0.2s; font-size: 0.875rem; }
                .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }
            `}</style>
        </main>
    );
}
