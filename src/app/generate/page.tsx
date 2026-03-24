"use client";

import React, { useState, useEffect } from "react";
import {
    FileText,
    Sparkles,
    Link2,
    Loader2,
    ArrowLeft,
    RefreshCcw,
    Eye,
    ChevronRight,
    CheckCircle2,
    Layout,
    Copy,
    Download,
    Edit3,
    Save,
    FileDown,
    Undo
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { pdf } from "@react-pdf/renderer";
import MinimalistCVPreview from "@/components/cv/MinimalistCVPreview";
import DownloadResumeButton from "@/components/pdf/DownloadResumeButton";
import CoverLetterDocument from "@/components/pdf/CoverLetterDocument";
import { cn } from "@/lib/utils";

const GenerateStudio = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const linkParam = searchParams.get("link");

    // UI States
    const [step, setStep] = useState<"configure" | "preview">("configure");
    const [activeTab, setActiveTab] = useState<"link" | "manual">("link");
    const [viewMode, setViewMode] = useState<"master" | "optimized">("master");

    // Data States
    const [jobLink, setJobLink] = useState(linkParam || "");
    const [manualJD, setManualJD] = useState("");
    const [isScraping, setIsScraping] = useState(false);
    const [isScraped, setIsScraped] = useState(false);
    const [scrapedRequirements, setScrapedRequirements] = useState<string[]>([]);

    const [analysis, setAnalysis] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [profileData, setProfileData] = useState<any>(null);
    const [optimizedData, setOptimizedData] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    
    // Cover Letter State
    const [coverLetter, setCoverLetter] = useState<string | null>(null);
    const [isGeneratingCL, setIsGeneratingCL] = useState(false);
    const [isEditingCL, setIsEditingCL] = useState(false);
    const [editedCL, setEditedCL] = useState<string>("");
    const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

    // Load profile data from individual keys
    useEffect(() => {
        const basicInfo = localStorage.getItem("user_basic_info");
        if (basicInfo) {
            const fullProfile = {
                user: JSON.parse(basicInfo),
                skills: JSON.parse(localStorage.getItem("user_skills_list") || "[]"),
                experiences: JSON.parse(localStorage.getItem("user_experience_list") || "[]"),
                projectsList: JSON.parse(localStorage.getItem("user_projects_list") || "[]"),
                languages: JSON.parse(localStorage.getItem("user_languages_list") || "[]"),
                references: JSON.parse(localStorage.getItem("user_references_list") || "[]"),
                matricData: JSON.parse(localStorage.getItem("user_matric_data") || "null"),
                educationList: JSON.parse(localStorage.getItem("user_credentials_list") || "[]"),
            };
            setProfileData(fullProfile);
        }

        // Load Persisted Session
        const savedSession = localStorage.getItem("cv_gen_session");
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                if (session.step) setStep(session.step);
                if (session.activeTab) setActiveTab(session.activeTab);
                if (session.viewMode) setViewMode(session.viewMode);
                if (session.jobLink) setJobLink(session.jobLink);
                if (session.manualJD) setManualJD(session.manualJD);

                if (session.scrapedRequirements && session.scrapedRequirements.length > 0) {
                    setScrapedRequirements(session.scrapedRequirements);
                    setIsScraped(true);
                } else if (session.isScraped) {
                    setIsScraped(true);
                }

                if (session.analysis) setAnalysis(session.analysis);
                if (session.optimizedData) setOptimizedData(session.optimizedData);
            } catch (e) {
                console.error("Failed to restore session:", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Persist Session
    useEffect(() => {
        if (!isLoaded) return; // Wait until loaded to start persisting

        const session = {
            step,
            activeTab,
            viewMode,
            jobLink,
            manualJD,
            isScraped,
            scrapedRequirements,
            analysis,
            optimizedData
        };
        localStorage.setItem("cv_gen_session", JSON.stringify(session));
    }, [isLoaded, step, activeTab, viewMode, jobLink, manualJD, isScraped, scrapedRequirements, analysis, optimizedData]);

    const handleAnalyze = async (requirements: string[]) => {
        if (!profileData) {
            console.log("Analysis skipped: No profile data found.");
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            const res = await fetch("/api/analyze-ats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profileData, // Fixed: API expects profileData
                    jobRequirements: requirements
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setAnalysis(data);
        } catch (err: any) {
            console.error("Analysis failed:", err);
            setError("Failed to analyze job: " + err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleOptimize = async () => {
        if (!profileData || !scrapedRequirements.length) return;

        setIsOptimizing(true);
        setError(null);

        try {
            const res = await fetch("/api/optimize-cv", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profileData,
                    jobRequirements: scrapedRequirements
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Client-side safety net: merge preserved sections from the master profile
            // This ensures education, languages, references, and matricData are NEVER lost,
            // even if the AI forgets to include them despite server-side checks.
            const mergedData = {
                ...data,
                // Preserve these sections from profileData if AI returned empty/missing
                educationList: (data.educationList && data.educationList.length > 0)
                    ? data.educationList
                    : (profileData?.educationList || []),
                matricData: data.matricData || profileData?.matricData || null,
                languages: (data.languages && data.languages.length > 0)
                    ? data.languages
                    : (profileData?.languages || []),
                references: (data.references && data.references.length > 0)
                    ? data.references
                    : (profileData?.references || []),
                projectsList: (data.projectsList && data.projectsList.length > 0)
                    ? data.projectsList
                    : (profileData?.projectsList || []),
            };

            setOptimizedData(mergedData);
            setViewMode("optimized");
            setStep("preview"); // Move to preview step automatically
        } catch (err: any) {
            console.error("Optimization failed:", err);
            setError("Failed to generate AI CV: " + err.message);
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleGenerateCoverLetter = async () => {
        if (!profileData || !scrapedRequirements.length) return;
        
        setIsGeneratingCL(true);
        setError(null);
        
        try {
            const res = await fetch("/api/generate-cover-letter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profileData,
                    jobDescription: scrapedRequirements.join("\n")
                })
            });
            
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            
            setCoverLetter(data.coverLetter);
            setEditedCL(data.coverLetter); // Sync edited version initially
        } catch (err: any) {
            console.error("Cover letter generation failed:", err);
            setError("Failed to generate Cover Letter: " + err.message);
        } finally {
            setIsGeneratingCL(false);
        }
    };

    const handleDownloadCL_PDF = async () => {
        if (!editedCL || !profileData) return;
        setIsDownloadingPDF(true);
        try {
            const blob = await pdf(
                <CoverLetterDocument 
                    content={editedCL} 
                    personalInfo={{
                        name: profileData.personalInfo?.fullName || "Candidate Name",
                        email: profileData.personalInfo?.email || "",
                        phone: profileData.personalInfo?.phone || "",
                        location: "South Africa"
                    }} 
                />
            ).toBlob();
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Cover_Letter_${profileData.personalInfo?.fullName?.replace(/\s+/g, '_') || 'Result'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsDownloadingPDF(false);
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
        setOptimizedData(null); // Clear previous tailored CV
        setJobLink(urlToScrape); // Update the link state to the new one

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

        // Clear previous state
        setAnalysis(null);
        setError(null);
        setOptimizedData(null);

        const lines = manualJD.split('\n').filter(l => l.trim().length > 10).slice(0, 15);
        setScrapedRequirements(lines);
        setIsScraped(true);
    };

    // Trigger analysis automatically
    useEffect(() => {
        if (scrapedRequirements.length > 0 && profileData && !analysis && !isAnalyzing) {
            handleAnalyze(scrapedRequirements);
        }
    }, [scrapedRequirements, profileData, isAnalyzing]); // Removed analysis from deps to avoid loop if persisted

    // Handle incoming link - Only scrape if it's a NEW link
    useEffect(() => {
        if (!isLoaded) return; // Wait for restoration first

        if (linkParam) {
            // If the incoming link is DIFFERENT from the current session
            if (linkParam !== jobLink) {
                console.log("New job link detected, resetting session...");
                setScrapedRequirements([]);
                setAnalysis(null);
                setOptimizedData(null);
                setJobLink(linkParam);
                setIsScraped(false);
                setStep("configure"); // Back to config step
                handleScrape(linkParam);
            } else if (!isScraped && !isScraping && scrapedRequirements.length === 0) {
                // If it's the same link but somehow lost state or first load without session
                handleScrape(linkParam);
            }
        }
    }, [linkParam, isLoaded]); // Simplified dependencies to focus on link change

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Nav Header */}
            <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-50 px-4 md:px-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => step === 'preview' ? setStep('configure') : router.back()}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-slate-900 font-bold text-sm tracking-tight">AI CV Tailor</h1>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{step === 'configure' ? 'Step 1: Context' : 'Step 2: Preview'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {step === 'preview' && (
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode("master")}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                                    viewMode === 'master' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                                )}
                            >
                                Master
                            </button>
                            <button
                                onClick={() => setViewMode("optimized")}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                                    viewMode === 'optimized' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                                )}
                            >
                                AI Optimized
                            </button>
                        </div>
                    )}

                    {step === 'preview' && (
                        <DownloadResumeButton data={viewMode === "optimized" ? (optimizedData || profileData) : profileData} />
                    )}

                    {step === 'configure' && optimizedData && (
                        <button
                            onClick={() => setStep('preview')}
                            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center gap-2"
                        >
                            View Preview
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
                {step === 'configure' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Input Selection */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Layout className="w-5 h-5 text-blue-600" />
                                    Job Context
                                </h2>

                                <div className="flex bg-slate-50 p-1 rounded-xl mb-6">
                                    <button
                                        onClick={() => setActiveTab("link")}
                                        className={cn(
                                            "flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                                            activeTab === 'link' ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-500"
                                        )}
                                    >
                                        <Link2 className="w-4 h-4" />
                                        Paste Job Link
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("manual")}
                                        className={cn(
                                            "flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                                            activeTab === 'manual' ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-500"
                                        )}
                                    >
                                        <FileText className="w-4 h-4" />
                                        Paste Text
                                    </button>
                                </div>

                                {activeTab === "link" ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={jobLink}
                                            onChange={(e) => setJobLink(e.target.value)}
                                            placeholder="Paste URL (e.g. LinkedIn, Indeed...)"
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all"
                                        />
                                        <button
                                            onClick={() => handleScrape()}
                                            disabled={isScraping}
                                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
                                        >
                                            {isScraping ? <Loader2 className="w-4 h-4 animate-spin" /> : "Extract"}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <textarea
                                            value={manualJD}
                                            onChange={(e) => setManualJD(e.target.value)}
                                            placeholder="Paste the full job description here..."
                                            className="w-full h-40 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
                                        />
                                        <button
                                            onClick={handleManualProcess}
                                            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-xs hover:bg-black transition-all"
                                        >
                                            Process Description
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Extracted Intelligence */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm min-h-[300px]">
                                <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                                    Extracted Requirements
                                    {scrapedRequirements.length > 0 && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{scrapedRequirements.length} Tags Found</span>}
                                </h3>

                                {isScraped ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {scrapedRequirements.map((req, i) => {
                                            const isSection = req.startsWith("SECTION: ");
                                            if (isSection) return null; // Clean view

                                            // Determine match status
                                            const isMatched = analysis?.matches?.some((m: string) =>
                                                m.toLowerCase().includes(req.toLowerCase().substring(0, 20)) ||
                                                req.toLowerCase().includes(m.toLowerCase().substring(0, 20))
                                            );
                                            const isMissing = analysis?.missing?.some((m: string) =>
                                                m.toLowerCase().includes(req.toLowerCase().substring(0, 20)) ||
                                                req.toLowerCase().includes(m.toLowerCase().substring(0, 20))
                                            );

                                            return (
                                                <div key={i} className={cn(
                                                    "flex items-start gap-3 p-3 rounded-xl border transition-colors group",
                                                    isMatched ? "bg-emerald-50/50 border-emerald-100 hover:border-emerald-200" :
                                                        isMissing ? "bg-amber-50/50 border-amber-100 hover:border-amber-200" :
                                                            "bg-slate-50 border-slate-100 hover:border-blue-200"
                                                )}>
                                                    {isMatched ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                    ) : isMissing ? (
                                                        <div className="w-4 h-4 rounded-full border-2 border-amber-300 mt-0.5 shrink-0" />
                                                    ) : (
                                                        <div className="w-4 h-4 rounded-full border-2 border-slate-200 mt-0.5 shrink-0" />
                                                    )}
                                                    <p className={cn(
                                                        "text-xs leading-relaxed font-medium",
                                                        isMatched ? "text-emerald-900" : isMissing ? "text-amber-900" : "text-slate-700"
                                                    )}>{req}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                                        <Sparkles className="w-8 h-8 mb-3 opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest italic opacity-50">Awaiting Job Data</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/*
                       - [ ] State Persistence: Save progress automatically
    - [/] Implement localStorage save/load logic
    - [ ] Add reset functionality to "Clear & Reset"
- [x] Logic & Features: Maintain core functionality
                        */}
                        {/* Right: Score & Primary Action */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-2">AI Match Score</h3>

                                <div className="relative inline-flex items-center justify-center mb-6">
                                    <svg className={cn("w-32 h-32 transform -rotate-90", isAnalyzing && "animate-pulse")}>
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="58"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-slate-100"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="58"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={364}
                                            strokeDashoffset={isAnalyzing ? 90 : 364 - (364 * (analysis?.semanticScore ?? analysis?.score ?? 0)) / 100}
                                            strokeLinecap="round"
                                            className={cn("text-blue-600 transition-all duration-1000", isAnalyzing && "animate-[spin_3s_linear_infinite]")}
                                        />
                                    </svg>
                                    <span className={cn("absolute text-3xl font-black text-slate-900 transition-opacity", isAnalyzing ? "opacity-30" : "opacity-100")}>
                                        {isAnalyzing ? <Loader2 className="w-8 h-8 animate-spin text-blue-500" /> : `${analysis?.semanticScore ?? analysis?.score ?? "0"}%`}
                                    </span>
                                </div>

                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-6 min-h-[1.5rem] flex items-center justify-center">
                                    {isAnalyzing ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                            AI Calculating Score...
                                        </span>
                                    ) : (
                                        (analysis?.semanticScore ?? analysis?.score) > 80 ? "🔥 Excellent Match" : (analysis?.semanticScore ?? analysis?.score) > 50 ? "⚡ Good Base" : "Keep Tailoring"
                                    )}
                                </p>

                                {analysis && !isAnalyzing && (
                                    <div className="space-y-4 pt-4 border-t border-slate-50 text-left">
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Key Matches</h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {analysis.matches?.slice(0, 4).map((m: string, i: number) => (
                                                    <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-md border border-emerald-100">
                                                        {m}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {analysis.missing?.length > 0 && (
                                            <div>
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Noticeable Gaps</h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {analysis.missing?.slice(0, 3).map((m: string, i: number) => (
                                                        <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-md border border-amber-100">
                                                            {m}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    onClick={handleOptimize}
                                    disabled={isOptimizing || !isScraped}
                                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                                >
                                    {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    {isOptimizing ? "Optimizing..." : "Tailor Experience"}
                                </button>

                                <button
                                    onClick={() => {
                                        setScrapedRequirements([]);
                                        setAnalysis(null);
                                        setIsScraped(false);
                                        setOptimizedData(null);
                                        localStorage.removeItem("cv_gen_session");
                                    }}
                                    className="w-full mt-3 py-3 text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <RefreshCcw className="w-3 h-3" />
                                    Clear & Reset
                                </button>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold leading-relaxed">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Step 2: Full Screen Preview */
                    <div className="max-w-[900px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex flex-col gap-4">
                            {/* Comparison Side HUD (Optional but clean) */}
                            {optimizedData && (
                                <div className="px-6 py-4 bg-blue-50 border border-blue-100 rounded-2xl mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                        <span className="text-xs font-bold text-blue-700">AI Tailored Version Active</span>
                                    </div>
                                    <button
                                        onClick={() => setStep('configure')}
                                        className="text-[10px] font-black uppercase text-blue-600 hover:underline"
                                    >
                                        Edit Job Data
                                    </button>
                                    <div className="flex items-center gap-3 border-l border-blue-200 pl-6 ml-6">
                                        {!coverLetter ? (
                                            <button
                                                onClick={handleGenerateCoverLetter}
                                                disabled={isGeneratingCL}
                                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                                            >
                                                {isGeneratingCL ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                                {isGeneratingCL ? "Writing..." : "Get Cover Letter"}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    const el = document.getElementById('cover-letter-section');
                                                    el?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                                            >
                                                <CheckCircle2 className="w-3 h-3" />
                                                View Letter
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="bg-white rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden min-h-[1100px] relative group">
                                <MinimalistCVPreview data={viewMode === "optimized" ? (optimizedData || profileData) : profileData} />

                                {/* Hover Indicator for "What Mode" */}
                                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Viewing {viewMode} version
                                </div>
                            </div>

                            {/* Cover Letter Section */}
                            <div id="cover-letter-section" className="mt-12 max-w-[800px] mx-auto w-full">
                                {!coverLetter ? (
                                    <div className="bg-slate-900 rounded-3xl p-8 text-center border border-slate-800 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-50 group-hover:opacity-80 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 text-blue-400">
                                                <FileText className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-xl font-black text-white mb-2">Need a Cover Letter?</h3>
                                            <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto font-medium">
                                                We can generate a professional, tailored cover letter for this job based on your profile.
                                            </p>
                                            <button
                                                onClick={handleGenerateCoverLetter}
                                                disabled={isGeneratingCL}
                                                className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                                            >
                                                {isGeneratingCL ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-blue-600" />}
                                                {isGeneratingCL ? "Writing Letter..." : "Generate AI Cover Letter"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl animate-in zoom-in-95 duration-500">
                                        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-900">Tailored Cover Letter</h3>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Generated • Ready to send</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(editedCL);
                                                        alert("Copied to clipboard!");
                                                    }}
                                                    className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-600 transition-all"
                                                    title="Copy all text"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => setIsEditingCL(!isEditingCL)}
                                                    className={cn(
                                                        "p-2.5 rounded-xl transition-all border border-transparent",
                                                        isEditingCL ? "bg-blue-50 text-blue-600 border-blue-100" : "hover:bg-slate-50 hover:border-slate-200 text-slate-400 hover:text-slate-600"
                                                    )}
                                                    title={isEditingCL ? "Cancel Editing" : "Edit Letter"}
                                                >
                                                    {isEditingCL ? <Undo className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                                                </button>
                                                <button 
                                                    onClick={handleDownloadCL_PDF}
                                                    disabled={isDownloadingPDF}
                                                    className="p-2.5 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100 text-blue-400 hover:text-blue-600 transition-all disabled:opacity-50"
                                                    title="Download as PDF"
                                                >
                                                    {isDownloadingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                                                </button>
                                                <button 
                                                    onClick={() => setCoverLetter(null)}
                                                    className="p-2.5 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100 text-slate-300 hover:text-red-500 transition-all"
                                                    title="Regenerate"
                                                >
                                                    <RefreshCcw className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="prose prose-slate max-w-none">
                                            {isEditingCL ? (
                                                <div className="relative animate-in fade-in duration-300">
                                                    <textarea 
                                                        value={editedCL}
                                                        onChange={(e) => setEditedCL(e.target.value)}
                                                        className="w-full min-h-[500px] p-8 rounded-2xl border-2 border-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none font-sans text-slate-700 leading-relaxed text-[13px] transition-all resize-y shadow-inner bg-blue-50/10"
                                                        placeholder="Edit your cover letter here..."
                                                    />
                                                    <div className="absolute top-4 right-4 flex gap-2">
                                                        <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                                            Editing Mode
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed text-[13px] bg-slate-50/50 p-8 rounded-2xl border border-slate-100 italic select-all animate-in fade-in duration-300">
                                                    {editedCL}
                                                </pre>
                                            )}
                                        </div>
                                        
                                        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                                            <p className="text-[11px] text-slate-400 font-medium">💡 Tip: Fill in the [Company Name] and [Date] before downloading your PDF.</p>
                                            {isEditingCL && (
                                                <button 
                                                    onClick={() => setIsEditingCL(false)}
                                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                                >
                                                    <Save className="w-3.5 h-3.5" />
                                                    Finish Editing
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="py-20 text-center">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-4">Happy with the result?</p>
                                <DownloadResumeButton data={viewMode === "optimized" ? (optimizedData || profileData) : profileData} />
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const GeneratePage = () => {
    return (
        <React.Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Waking up AI...</p>
                </div>
            </div>
        }>
            <GenerateStudio />
        </React.Suspense>
    );
};

export default GeneratePage;
