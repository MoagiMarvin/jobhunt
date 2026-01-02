"use client";

import { useState } from "react";
import { ArrowLeft, Save, Plus, Trash2, Linkedin, Github, Globe, Briefcase, GraduationCap, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function CreateCVPage() {
    const router = useRouter();

    // Form State
    const [basics, setBasics] = useState({
        name: "Moagi Marvin", // Default mock
        email: "moagi@example.com", // Default mock
        phone: "+27 61 234 5678", // Default mock
        jobTitle: "",
        summary: "",
        linkedin: "",
        github: "",
        portfolio: ""
    });

    const [experiences, setExperiences] = useState<Experience[]>([
        { id: 1, title: "", company: "", startDate: "", endDate: "", current: false, description: "" }
    ]);

    const [educations, setEducations] = useState<Education[]>([
        { id: 1, degree: "", school: "", year: "" }
    ]);

    const [skills, setSkills] = useState<string[]>([]);
    const [currentSkill, setCurrentSkill] = useState("");

    // Handlers
    const addExperience = () => {
        setExperiences([...experiences, {
            id: Date.now(), title: "", company: "", startDate: "", endDate: "", current: false, description: ""
        }]);
    };

    const removeExperience = (id: number) => {
        setExperiences(experiences.filter(exp => exp.id !== id));
    };

    const updateExperience = (id: number, field: keyof Experience, value: any) => {
        setExperiences(experiences.map(exp =>
            exp.id === id ? { ...exp, [field]: value } : exp
        ));
    };

    const addEducation = () => {
        setEducations([...educations, { id: Date.now(), degree: "", school: "", year: "" }]);
    };

    const removeEducation = (id: number) => {
        setEducations(educations.filter(edu => edu.id !== id));
    };

    const updateEducation = (id: number, field: keyof Education, value: any) => {
        setEducations(educations.map(edu =>
            edu.id === id ? { ...edu, [field]: value } : edu
        ));
    };

    const addSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && currentSkill.trim()) {
            if (!skills.includes(currentSkill.trim())) {
                setSkills([...skills, currentSkill.trim()]);
            }
            setCurrentSkill("");
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };

    const handleSave = () => {
        // Here we would construct the CV string or object and save it
        console.log({ basics, experiences, educations, skills });
        alert("CV Saved successfully! (Mock)");
        router.push("/profile");
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-20">
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/profile" className="p-2 hover:bg-white rounded-full transition-colors text-slate-500">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-primary">Build Your CV</h1>
                            <p className="text-slate-600">Fill in your details to create a master profile.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold shadow-md transition-all flex items-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        Save Profile
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Professional Summary & Basics */}
                    <div className="bg-white rounded-xl p-8 border-2 border-blue-100 shadow-sm">
                        <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">1</div>
                            Professional Basics
                        </h2>

                        <div className="grid gap-6">
                            {/* Personal Info Grid */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={basics.name}
                                        onChange={(e) => setBasics({ ...basics, name: e.target.value })}
                                        className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title</label>
                                    <input
                                        type="text"
                                        value={basics.jobTitle}
                                        onChange={(e) => setBasics({ ...basics, jobTitle: e.target.value })}
                                        placeholder="e.g. Senior Software Engineer"
                                        className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={basics.email}
                                        onChange={(e) => setBasics({ ...basics, email: e.target.value })}
                                        className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={basics.phone}
                                        onChange={(e) => setBasics({ ...basics, phone: e.target.value })}
                                        placeholder="+27..."
                                        className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>


                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Professional Summary</label>
                                <textarea
                                    value={basics.summary}
                                    onChange={(e) => setBasics({ ...basics, summary: e.target.value })}
                                    placeholder="Briefly describe your experience, key achievements, and career goals..."
                                    className="w-full h-32 p-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none transition-colors resize-none"
                                />
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Linkedin className="w-4 h-4 text-blue-700" /> LinkedIn
                                    </label>
                                    <input
                                        type="url"
                                        value={basics.linkedin}
                                        onChange={(e) => setBasics({ ...basics, linkedin: e.target.value })}
                                        placeholder="linkedin.com/in/..."
                                        className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none transition-colors text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Github className="w-4 h-4 text-slate-800" /> GitHub
                                    </label>
                                    <input
                                        type="url"
                                        value={basics.github}
                                        onChange={(e) => setBasics({ ...basics, github: e.target.value })}
                                        placeholder="github.com/..."
                                        className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none transition-colors text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-green-600" /> Portfolio
                                    </label>
                                    <input
                                        type="url"
                                        value={basics.portfolio}
                                        onChange={(e) => setBasics({ ...basics, portfolio: e.target.value })}
                                        placeholder="mysite.com"
                                        className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none transition-colors text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Experience */}
                    <div className="bg-white rounded-xl p-8 border-2 border-blue-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">2</div>
                                Work Experience
                            </h2>
                            <button onClick={addExperience} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                <Plus className="w-4 h-4" /> Add Logic
                            </button>
                        </div>

                        <div className="space-y-6">
                            {experiences.map((exp, index) => (
                                <div key={exp.id} className="p-6 bg-slate-50 rounded-xl border border-slate-200 relative group">
                                    <button
                                        onClick={() => removeExperience(exp.id)}
                                        className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>

                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Job Title</label>
                                            <input
                                                type="text"
                                                value={exp.title}
                                                onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                                                className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 outline-none bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company</label>
                                            <input
                                                type="text"
                                                value={exp.company}
                                                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                                className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 outline-none bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                                            <input
                                                type="month"
                                                value={exp.startDate}
                                                onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                                className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 outline-none bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
                                            <input
                                                type="month"
                                                disabled={exp.current}
                                                value={exp.endDate}
                                                onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                                className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 outline-none bg-white disabled:bg-slate-100 disabled:text-slate-400"
                                            />
                                            <div className="mt-2 flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={exp.current}
                                                    onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                                    className="rounded text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-slate-600">I currently work here</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description / Achievements</label>
                                        <textarea
                                            value={exp.description}
                                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                            placeholder="• Led a team of 5 developers..."
                                            className="w-full h-24 p-2 border border-slate-300 rounded focus:border-blue-500 outline-none bg-white resize-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Education */}
                    <div className="bg-white rounded-xl p-8 border-2 border-blue-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">3</div>
                                Education
                            </h2>
                            <button onClick={addEducation} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                <Plus className="w-4 h-4" /> Add Education
                            </button>
                        </div>

                        <div className="space-y-4">
                            {educations.map((edu, index) => (
                                <div key={edu.id} className="flex gap-4 items-start p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <GraduationCap className="w-5 h-5 text-slate-400 mt-2 flex-shrink-0" />
                                    <div className="grid md:grid-cols-3 gap-4 flex-1">
                                        <input
                                            type="text"
                                            placeholder="Degree / Certificate"
                                            value={edu.degree}
                                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 outline-none bg-white"
                                        />
                                        <input
                                            type="text"
                                            placeholder="University / School"
                                            value={edu.school}
                                            onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 outline-none bg-white"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Year"
                                            value={edu.year}
                                            onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 outline-none bg-white"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeEducation(edu.id)}
                                        className="text-slate-400 hover:text-red-500 self-center"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-white rounded-xl p-8 border-2 border-blue-100 shadow-sm">
                        <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">4</div>
                            Skills
                        </h2>

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={currentSkill}
                                onChange={(e) => setCurrentSkill(e.target.value)}
                                onKeyDown={addSkill}
                                placeholder="Type a skill and press Enter (e.g. React, Python, Leadership)..."
                                className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none transition-colors"
                            />

                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill) => (
                                    <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100 flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                                        {skill}
                                        <button onClick={() => removeSkill(skill)} className="hover:text-blue-900">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
