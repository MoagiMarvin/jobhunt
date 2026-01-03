"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Download, Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Reuse Types (In a real app, these would be in a shared types file)
interface CVData {
    industry: string;
    mode: "tech" | "corporate" | "operational";
    basics: {
        name: string;
        email: string;
        phone: string;
        location: string;
        jobTitle: string;
        summary: string;
        linkedin: string;
        github: string;
        portfolio: string;
        driverLicense: string;
        ownVehicle: boolean;
    };
    experiences: any[];
    educations: any[];
    projects: any[];
    certifications: any[];
    languages: any[];
    skills: any[];
}

export default function CVPreviewPage() {
    const router = useRouter();
    const [cv, setCV] = useState<CVData | null>(null);

    useEffect(() => {
        // Load Master CV from Storage
        const stored = localStorage.getItem("jobhunt_master_cv");
        if (stored) {
            setCV(JSON.parse(stored));
        } else {
            // No data found, redirect back to builder
            router.push("/profile/create");
        }
    }, [router]);

    const handlePrint = () => {
        window.print();
    };

    if (!cv) return <div className="p-10 text-center text-slate-500">Loading your Master CV...</div>;

    return (
        <div className="min-h-screen bg-slate-500/10 py-10 print:bg-white print:p-0">

            {/* Control Bar (Hidden in Print) */}
            <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden px-4 sm:px-0">
                <Link href="/profile/create" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Edit Data
                </Link>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-blue-700 transition-all hover:scale-105"
                >
                    <Download className="w-4 h-4" /> Download PDF
                </button>
            </div>

            {/* A4 PAPER CONTAINER */}
            <div className={`
                max-w-[210mm] mx-auto bg-white shadow-2xl overflow-hidden
                print:shadow-none print:max-w-none print:mx-0
                min-h-[297mm]
            `}>
                {/* CV CONTENT START */}
                <div className="p-[40px] text-slate-900">

                    {/* Header */}
                    <header className="border-b-2 border-slate-900 pb-6 mb-6">
                        <h1 className="text-4xl font-serif font-bold tracking-tight uppercase mb-2">{cv.basics.name}</h1>
                        <p className="text-xl text-slate-600 font-medium mb-4">{cv.basics.jobTitle}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-700 font-medium">
                            {cv.basics.email && <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {cv.basics.email}</div>}
                            {cv.basics.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {cv.basics.phone}</div>}
                            {cv.basics.location && <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {cv.basics.location}</div>}

                            {/* Dynamic Industry Links */}
                            {cv.basics.linkedin && <div className="flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5" /> LinkedIn</div>}
                            {cv.mode === "tech" && cv.basics.github && <div className="flex items-center gap-1.5"><Github className="w-3.5 h-3.5" /> GitHub</div>}
                            {cv.basics.portfolio && <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Portfolio</div>}
                        </div>
                    </header>

                    {/* 2-Column Layout Logic */}
                    <div className="grid grid-cols-12 gap-8">

                        {/* LEFT (MAIN) COLUMN - 8/12 */}
                        <div className="col-span-8 space-y-8">

                            {/* Summary */}
                            {cv.basics.summary && (
                                <section>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1">Professional Profile</h3>
                                    <p className="text-sm leading-relaxed text-slate-800 text-justify">{cv.basics.summary}</p>
                                </section>
                            )}

                            {/* Experience */}
                            {cv.experiences.length > 0 && (
                                <section>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-200 pb-1">Work History</h3>
                                    <div className="space-y-6">
                                        {cv.experiences.map((exp: any) => (
                                            <div key={exp.id}>
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h4 className="font-bold text-slate-900">{exp.title}</h4>
                                                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                                                        {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                                                    </span>
                                                </div>
                                                <div className="text-sm font-semibold text-blue-800 mb-2">{exp.company}</div>
                                                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{exp.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Tech Projects (Only for Tech Mode) */}
                            {cv.mode === "tech" && cv.projects.length > 0 && (
                                <section>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-200 pb-1">Key Projects</h3>
                                    <div className="space-y-4">
                                        {cv.projects.map((proj: any) => (
                                            <div key={proj.id}>
                                                <div className="flex justify-between items-baseline">
                                                    <h4 className="font-bold text-slate-900 text-sm">{proj.title}</h4>
                                                    <span className="text-xs text-slate-500 italic">{proj.role}</span>
                                                </div>
                                                <p className="text-sm text-slate-700 mt-1">{proj.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                        </div>

                        {/* RIGHT (SIDEBAR) COLUMN - 4/12 */}
                        <div className="col-span-4 space-y-8 bg-slate-50 p-4 -my-4 h-full print:bg-transparent print:p-0 print:m-0">

                            {/* Skills */}
                            {cv.skills.length > 0 && (
                                <section>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1">Core Competencies</h3>

                                    {/* Grouped Skills */}
                                    {(["Technical", "Professional", "Soft"] as const).map(cat => {
                                        const catSkills = cv.skills.filter((s: any) => s.category === cat);
                                        if (catSkills.length === 0) return null;
                                        return (
                                            <div key={cat} className="mb-4 last:mb-0">
                                                <h4 className="text-[10px] uppercase font-bold text-blue-600 mb-1">{cat}</h4>
                                                <div className="flex flex-wrap gap-x-2 gap-y-1">
                                                    {catSkills.map((s: any) => (
                                                        <span key={s.id} className="text-xs font-medium text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 print:border-none print:p-0 print:bg-transparent print:after:content-[','] print:last:after:content-['']">
                                                            {s.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </section>
                            )}

                            {/* Education */}
                            {cv.educations.length > 0 && (
                                <section>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1">Education</h3>
                                    <div className="space-y-4">
                                        {cv.educations.map((edu: any) => (
                                            <div key={edu.id}>
                                                <div className="font-bold text-sm text-slate-900">{edu.degree}</div>
                                                <div className="text-xs text-slate-600">{edu.school}</div>
                                                <div className="text-xs text-slate-400">{edu.year}</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Certifications (Critical for Trades/Ops) */}
                            {cv.certifications.length > 0 && (
                                <section>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1">Certifications</h3>
                                    <div className="space-y-3">
                                        {cv.certifications.map((cert: any) => (
                                            <div key={cert.id}>
                                                <div className="font-bold text-sm text-slate-900 leading-tight">{cert.name}</div>
                                                <div className="text-xs text-slate-500">{cert.issuer} • {cert.date}</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Licenses (If Operational + Drivers) */}
                            {(cv.basics.driverLicense || cv.basics.ownVehicle) && (
                                <section>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1">Transport</h3>
                                    <ul className="text-sm text-slate-800 space-y-1">
                                        {cv.basics.driverLicense && <li><strong>License:</strong> {cv.basics.driverLicense}</li>}
                                        {cv.basics.ownVehicle && <li><strong>Vehicle:</strong> Own Transport Available</li>}
                                    </ul>
                                </section>
                            )}

                            {/* Languages */}
                            {cv.languages.length > 0 && (
                                <section>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1">Languages</h3>
                                    <ul className="text-sm text-slate-800 space-y-1">
                                        {cv.languages.map((lang: any) => (
                                            <li key={lang.id} className="flex justify-between">
                                                <span>{lang.language}</span>
                                                <span className="text-slate-500 text-xs">{lang.proficiency}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                        </div>
                    </div>

                </div>
                {/* CV CONTENT END */}

            </div>
            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
}
