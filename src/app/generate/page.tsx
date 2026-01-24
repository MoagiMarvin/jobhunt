"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link2, Sparkles, Download, FileText, AlertCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import MinimalistCVPreview from "@/components/cv/MinimalistCVPreview";
import DownloadResumeButton from "@/components/pdf/DownloadResumeButton";

/** MOCK DATA FOR FALLBACK (Matches Profile Page) **/
const MOCK_PROFILE = {
    user: {
        name: "Moagi Marvin",
        email: "moagi@example.com",
        phone: "+27 61 234 5678",
        headline: "Computer Science Graduate | Full-Stack Developer",
        location: "Johannesburg, South Africa",
        summary: "Passionate Computer Science graduate with a strong foundation in full-stack development. Experienced in building scalable web applications using React, Node.js, and cloud technologies. Eager to contribute to innovative projects and continue learning in a fast-paced environment."
    },
    skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "Public Speaking", "Agile Methodology"],
    experiences: [
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
    ],
    educationList: [
        {
            title: "BSc Computer Science",
            issuer: "University of Johannesburg",
            date: "2021 - 2024",
            qualification_level: "Bachelor's Degree",
        }
    ],
    certificationsList: [
        {
            title: "Google Cloud Professional Developer",
            issuer: "Google Cloud",
            date: "January 2024",
        }
    ],
    projectsList: [
        {
            title: "AI CV Optimizer",
            description: "Built with Next.js and Gemini AI to help students optimize their career paths.",
            technologies: ["Next.js", "Gemini AI", "Tailwind"],
        }
    ],
    languages: [
        { language: "English", proficiency: "Native" },
        { language: "Zulu", proficiency: "Fluent" }
    ],
    references: [
        {
            name: "Sarah Jenkins",
            relationship: "Senior Developer / Manager",
            company: "Tech StartUp SA",
            phone: "+27 11 987 6543",
            email: "sarah@techstartup.co.za"
        }
    ]
};


export default function GeneratePage() {
    return (
        <Suspense fallback={<div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-blue-500" /></div>}>
            <GenerateContent />
        </Suspense>
    );
}

function GenerateContent() {
    const searchParams = useSearchParams();
    const linkParam = searchParams.get('link');

    const [jobLink, setJobLink] = useState(linkParam || "");
    const [manualJD, setManualJD] = useState("");
    const [activeTab, setActiveTab] = useState<"link" | "manual">("link");
    const [isScraped, setIsScraped] = useState(false);
    const [isScraping, setIsScraping] = useState(false);
    const [scrapedRequirements, setScrapedRequirements] = useState<string[]>([]);
    const [profileData, setProfileData] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedData, setOptimizedData] = useState<any>(null);
    const [viewMode, setViewMode] = useState<"master" | "optimized">("master");

    // Load Profile Data from multiple localStorage keys
    useEffect(() => {
        const basicInfo = localStorage.getItem("user_basic_info");
        const skills = localStorage.getItem("user_skills_list");
        const experience = localStorage.getItem("user_experience_list");
        const credentials = localStorage.getItem("user_credentials_list");
        const projects = localStorage.getItem("user_projects_list");
        const languages = localStorage.getItem("user_languages_list");
        const references = localStorage.getItem("user_references_list");
        const matric = localStorage.getItem("user_matric_data");

        const safeParse = (item: string | null, fallback: any) => {
            if (!item) return fallback;
            try {
                const parsed = JSON.parse(item);
                return (Array.isArray(parsed) && parsed.length === 0) ? fallback : parsed;
            } catch {
                return fallback;
            }
        };

        const basic = safeParse(basicInfo, MOCK_PROFILE.user);
        const creds = safeParse(credentials, []);

        const data = {
            user: basic,
            personalInfo: basic, // for back-compat
            skills: safeParse(skills, MOCK_PROFILE.skills),
            experiences: safeParse(experience, MOCK_PROFILE.experiences),
            educationList: creds.filter((c: any) => c.type === 'education').length > 0
                ? creds.filter((c: any) => c.type === 'education')
                : MOCK_PROFILE.educationList,
            certificationsList: creds.filter((c: any) => c.type === 'certification').length > 0
                ? creds.filter((c: any) => c.type === 'certification')
                : MOCK_PROFILE.certificationsList,
            projectsList: safeParse(projects, MOCK_PROFILE.projectsList),
            languages: safeParse(languages, MOCK_PROFILE.languages),
            references: safeParse(references, MOCK_PROFILE.references),
            matricData: safeParse(matric, null),
            // Legacy mapping for MinimalistCVPreview internals
            credentials: creds,
            experience: safeParse(experience, MOCK_PROFILE.experiences)
        };

        setProfileData(data);
    }, []);


    const handleAnalyze = async (requirements: string[]) => {
        if (!profileData) {
            console.warn("No Profile Data found for analysis.");
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        try {
            const res = await fetch('/api/analyze-ats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobRequirements: requirements,
                    profileData
                }),
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setAnalysis(data);
        } catch (err: any) {
            console.error("Analysis failed:", err);
            setError("Analysis snagged: " + (err.message || "Unknown error"));
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleOptimize = async () => {
        if (!profileData || !scrapedRequirements.length) return;

        setIsOptimizing(true);
        setError(null);
        try {
            const res = await fetch('/api/optimize-cv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profileData,
                    jobRequirements: scrapedRequirements
                }),
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Ensure we keep the master references as requested
            const tailoredData = {
                ...data,
                references: profileData.references || []
            };

            setOptimizedData(tailoredData);
            setViewMode("optimized");
        } catch (err: any) {
            console.error("Optimization failed:", err);
            setError("Failed to generate AI CV: " + err.message);
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleScrape = async (targetUrl?: string) => {
        const urlToScrape = targetUrl || jobLink;
        if (!urlToScrape || !urlToScrape.startsWith('http')) {
            alert("Please enter a valid job link.");
            return;
        }

        setIsScraping(true);
        setIsScraped(false);
        setError(null);
        setAnalysis(null);

        try {
            const res = await fetch(`/api/scrape-job?url=${encodeURIComponent(urlToScrape)}`);
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            setScrapedRequirements(data.requirements || []);
            setIsScraped(true);
        } catch (err: any) {
            console.error("Scraping failed:", err);
            setError(err.message || "Failed to extract requirements.");
        } finally {
            setIsScraping(false);
        }
    };

    const handleManualProcess = () => {
        if (!manualJD.trim()) {
            alert("Please paste the job description first.");
            return;
        }
        const lines = manualJD.split('\n').filter(l => l.trim().length > 10).slice(0, 15);
        setScrapedRequirements(lines);
        setIsScraped(true);
    };

    // Trigger analysis automatically when both requirements and profile are ready
    useEffect(() => {
        if (scrapedRequirements.length > 0 && profileData && !analysis && !isAnalyzing) {
            handleAnalyze(scrapedRequirements);
        }
    }, [scrapedRequirements, profileData, analysis, isAnalyzing]);

    // Handle incoming link automatically
    useEffect(() => {
        if (linkParam && !isScraped && !isScraping) {
            handleScrape(linkParam);
        }
    }, [linkParam]);

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left: Input & Analysis */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-primary">Generate Tailored CV</h1>
                            <p className="text-slate-600">
                                Provide the job details. We'll extract requirements, match them against your profile, and generate an optimized CV.
                            </p>
                        </div>

                        {/* Input Tabs */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="flex border-b border-slate-100">
                                <button
                                    onClick={() => setActiveTab("link")}
                                    className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'link' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <Link2 className="w-4 h-4" />
                                    Job Link
                                </button>
                                <button
                                    onClick={() => setActiveTab("manual")}
                                    className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'manual' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <FileText className="w-4 h-4" />
                                    Manual Paste
                                </button>
                            </div>

                            <div className="p-4">
                                {activeTab === "link" ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={jobLink}
                                            onChange={(e) => setJobLink(e.target.value)}
                                            placeholder="https://example.com/jobs/software-engineer"
                                            className="flex-1 bg-white border-2 border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                        />
                                        <button
                                            onClick={() => handleScrape()}
                                            disabled={isScraping}
                                            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isScraping ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                            {isScraping ? "Scraping..." : "Scrape"}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <textarea
                                            value={manualJD}
                                            onChange={(e) => setManualJD(e.target.value)}
                                            placeholder="Paste the Job Description (Responsibilities & Requirements) here..."
                                            className="w-full h-40 bg-white border-2 border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-sans"
                                        />
                                        <button
                                            onClick={handleManualProcess}
                                            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md"
                                        >
                                            Analyze Text
                                        </button>
                                    </div>
                                )}

                                {error && (
                                    <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p>{error}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Scraped Requirements */}
                        {(isScraped || isScraping) && (
                            <>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold flex items-center gap-2 text-slate-900">
                                            <FileText className="w-4 h-4 text-blue-600" />
                                            Extracted Requirements
                                        </label>
                                        <span className="text-xs text-slate-500 font-medium">Editable</span>
                                    </div>
                                    <div className="p-4 rounded-lg bg-white border-2 border-blue-100 space-y-2 max-h-64 overflow-y-auto">
                                        {isScraping ? (
                                            <div className="py-10 text-center">
                                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                                                <p className="text-xs text-slate-500 font-medium">Analyzing job ad...</p>
                                            </div>
                                        ) : (
                                            <>
                                                {scrapedRequirements.length > 0 ? (
                                                    scrapedRequirements.map((req, i) => {
                                                        const isSection = req.startsWith("SECTION: ");
                                                        if (isSection) {
                                                            const sectionText = req.replace("SECTION: ", "");
                                                            const isRequired = sectionText.includes("[REQUIRED]");
                                                            const isDuties = sectionText.includes("[DUTIES]");
                                                            const isPreferred = sectionText.includes("[PREFERRED]");

                                                            const cleanTitle = sectionText
                                                                .replace("[REQUIRED] ", "")
                                                                .replace("[DUTIES] ", "")
                                                                .replace("[PREFERRED] ", "");

                                                            return (
                                                                <div key={i} className={`pt-6 pb-2 mb-2 border-b-2 border-slate-50 flex items-center justify-between ${i === 0 ? 'pt-0' : ''}`}>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-1.5 h-5 rounded-full ${isRequired ? 'bg-red-500' : isDuties ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                                                        <span className={`text-[11px] font-black uppercase tracking-widest ${isRequired ? 'text-red-600' : isDuties ? 'text-blue-600' : 'text-emerald-600'}`}>
                                                                            {cleanTitle}
                                                                        </span>
                                                                    </div>
                                                                    <div className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-sm border ${isRequired ? 'bg-red-50 text-red-600 border-red-100' : isDuties ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                                        {isRequired ? "CRITICAL" : isDuties ? "ROLE" : "BONUS"}
                                                                    </div>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div key={i} className="flex items-start gap-4 text-sm group/item pl-4 py-1.5 hover:bg-slate-50/50 rounded-md transition-all -ml-1">
                                                                <span className="text-blue-500 mt-1 opacity-20 group-hover/item:opacity-100 transition-opacity font-bold">»</span>
                                                                <input
                                                                    type="text"
                                                                    defaultValue={req}
                                                                    className="flex-1 bg-transparent border-none outline-none text-slate-700 font-medium focus:text-blue-600 transition-colors"
                                                                />
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <p className="text-sm text-slate-500 text-center py-4 italic">No requirements or duties found. Try manual paste.</p>
                                                )}
                                                {!isScraping && scrapedRequirements.length > 0 && (
                                                    <button className="w-full py-3 mt-4 border-2 border-dashed border-slate-100 rounded-lg text-xs font-bold text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2">
                                                        <span>+ Add Requirement</span>
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* ATS Match Analysis */}
                                <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold flex items-center gap-2 text-primary">
                                            <Sparkles className="w-5 h-5 text-accent" />
                                            Dual-ATS Scorecard
                                        </h3>
                                        {isAnalyzing && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                                    </div>

                                    {/* Generate AI CV Button */}
                                    <div className="bg-white/80 p-4 rounded-xl border border-blue-200 shadow-sm flex flex-col items-center gap-3">
                                        <div className="text-center space-y-1">
                                            <p className="text-xs font-bold text-slate-700">Ready to beat the ATS?</p>
                                            <p className="text-[10px] text-slate-500 max-w-[200px]">AI will tailor your achievements and keywords to match this specific job ad.</p>
                                        </div>
                                        <button
                                            onClick={handleOptimize}
                                            disabled={isOptimizing || isAnalyzing}
                                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm shadow-lg hover:shadow-blue-200/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 overflow-hidden relative group"
                                        >
                                            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                            {isOptimizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                            {isOptimizing ? "CREATING YOUR CV..." : "GENERATE AI CV"}
                                        </button>
                                        {optimizedData && (
                                            <div className="flex gap-2 w-full mt-1">
                                                <button
                                                    onClick={() => setViewMode("master")}
                                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${viewMode === 'master' ? 'bg-slate-200 text-slate-700' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                                >
                                                    View Master
                                                </button>
                                                <button
                                                    onClick={() => setViewMode("optimized")}
                                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${viewMode === 'optimized' ? 'bg-blue-100 text-blue-700' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                                >
                                                    View AI CV
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Two Gauges Side-by-Side */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Legacy Score */}
                                        <div className="bg-white/60 p-4 rounded-xl border border-blue-100 flex flex-col items-center text-center relative group">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter mb-2">Legacy (Keywords)</span>
                                            <span className={`text-3xl font-black ${analysis?.legacyScore >= 70 ? 'text-green-600' : 'text-slate-600'}`}>
                                                {analysis ? `${analysis.legacyScore}%` : "--%"}
                                            </span>
                                            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                                                <div
                                                    className="h-full bg-slate-400 transition-all duration-1000"
                                                    style={{ width: `${analysis?.legacyScore || 0}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-[8px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Base Match</p>
                                        </div>

                                        {/* AI Score */}
                                        <div className="bg-white p-4 rounded-xl border-2 border-blue-200 flex flex-col items-center text-center shadow-md relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-1 bg-blue-600 text-[8px] font-black text-white uppercase tracking-widest rounded-bl-lg">Turbo</div>
                                            <span className="text-[10px] font-black uppercase text-blue-600 tracking-tighter mb-2">AI (Context) Match</span>
                                            <span className={`text-3xl font-black transition-all ${analysis?.semanticScore >= 70 ? 'text-blue-600' : 'text-purple-600'}`}>
                                                {analysis?.semanticScore !== null && analysis?.semanticScore !== undefined ? `${analysis.semanticScore}%` : (isAnalyzing ? "--%" : "OFF")}
                                            </span>
                                            <div className="w-full h-1.5 bg-blue-50 rounded-full mt-3 overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                                                    style={{ width: `${analysis?.semanticScore || 0}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-[8px] text-blue-500 mt-2 font-black uppercase tracking-widest">Semantic Match</p>
                                        </div>
                                    </div>

                                    {/* Real Analysis Breakdown */}
                                    <div className="space-y-4 pt-2">
                                        {isAnalyzing ? (
                                            <div className="py-4 text-center">
                                                <p className="text-sm text-slate-500 animate-pulse">Brain is calculating your match score...</p>
                                            </div>
                                        ) : analysis ? (
                                            <>
                                                {analysis.summary && (
                                                    <div className="text-sm text-slate-700 border-l-4 border-blue-200 pl-3 py-2 bg-white/50 rounded space-y-1">
                                                        {analysis.summary.split('. ').map((item: string, i: number) => (
                                                            <div key={i} className="flex items-start gap-1.5">
                                                                <span className="mt-0.5">{item.includes('✅') ? null : "💡"}</span>
                                                                <p className={item.includes('✅') ? "text-blue-700 font-medium" : ""}>
                                                                    {item.trim()}{item.endsWith('.') ? '' : '.'}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="grid gap-3">
                                                    {analysis.matches?.length > 0 && (
                                                        <div className="flex items-start gap-2 text-sm">
                                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="font-bold text-green-700">Top Matches</p>
                                                                <p className="text-xs text-slate-600">{analysis.matches.join(", ")}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {analysis.missing?.length > 0 && (
                                                        <div className="flex items-start gap-2 text-sm">
                                                            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="font-bold text-yellow-700">Missing Keywords</p>
                                                                <p className="text-xs text-slate-600">{analysis.missing.join(", ")}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {analysis.alerts?.length > 0 && (
                                                        <div className="flex items-start gap-2 text-sm">
                                                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="font-bold text-red-700">Critical Gaps</p>
                                                                <p className="text-xs text-slate-600">{analysis.alerts.join(", ")}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="py-4 text-center space-y-3">
                                                {!profileData ? (
                                                    <p className="text-sm text-red-500 font-medium">Please complete your Profile at /profile first!</p>
                                                ) : error ? (
                                                    <div className="space-y-2">
                                                        <p className="text-sm text-amber-600 font-medium">{error}</p>
                                                        <button
                                                            onClick={() => handleAnalyze(scrapedRequirements)}
                                                            className="text-xs font-bold text-blue-600 hover:underline"
                                                        >
                                                            Try Analyzing Again
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-500">Extract requirements to see your match score.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Empty State */}
                        {!isScraped && (
                            <div className="p-12 rounded-xl border-2 border-dashed border-blue-200 bg-white text-center">
                                <Link2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                <p className="text-slate-500">Paste a job link and click "Scrape" to begin</p>
                            </div>
                        )}
                    </div>

                    {/* Right: CV Preview */}
                    <div className="bg-white rounded-xl p-8 flex items-center justify-center sticky top-24 h-fit border-2 border-primary/10 shadow-xl overflow-hidden min-h-[600px]">
                        <div className="absolute top-4 right-4 z-10 flex gap-2">
                            {optimizedData && (
                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest shadow-sm ${viewMode === 'optimized' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {viewMode === 'optimized' ? 'AI Tailored' : 'Master CV'}
                                </span>
                            )}
                        </div>
                        {profileData ? (
                            <MinimalistCVPreview data={viewMode === "optimized" ? optimizedData : profileData} />
                        ) : (

                            <div className="text-center p-12 text-slate-400">
                                <FileText className="w-16 h-16 mx-auto mb-4 opacity-10" />
                                <p className="text-sm font-medium">Complete your profile at /profile to see your CV preview.</p>
                                <p className="text-[10px] mt-1">Your full profile CV will be displayed here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Download Section */}
                {(profileData || optimizedData) && (
                    <div className="mt-12 flex justify-center">
                        <DownloadResumeButton data={viewMode === "optimized" ? optimizedData : profileData} />
                    </div>
                )}
            </div>
        </main>
    );
}
