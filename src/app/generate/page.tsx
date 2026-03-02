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
    Layout
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import MinimalistCVPreview from "@/components/cv/MinimalistCVPreview";
import DownloadResumeButton from "@/components/pdf/DownloadResumeButton";
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
    }, []);

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

            setOptimizedData(data);
            setViewMode("optimized");
            setStep("preview"); // Move to preview step automatically
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

    // Trigger analysis automatically
    useEffect(() => {
        if (scrapedRequirements.length > 0 && profileData && !analysis && !isAnalyzing) {
            handleAnalyze(scrapedRequirements);
        }
    }, [scrapedRequirements, profileData, analysis, isAnalyzing]);

    // Handle incoming link
    useEffect(() => {
        if (linkParam && !isScraped && !isScraping) {
            handleScrape(linkParam);
        }
    }, [linkParam]);

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

                                            return (
                                                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-colors">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{req}</p>
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

                        {/* Right: Score & Primary Action */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-2">AI Match Score</h3>

                                <div className="relative inline-flex items-center justify-center mb-6">
                                    <svg className="w-32 h-32 transform -rotate-90">
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
                                            strokeDashoffset={364 - (364 * (analysis?.semanticScore ?? analysis?.score ?? 0)) / 100}
                                            strokeLinecap="round"
                                            className="text-blue-600 transition-all duration-1000"
                                        />
                                    </svg>
                                    <span className="absolute text-3xl font-black text-slate-900">{analysis?.semanticScore ?? analysis?.score ?? "0"}%</span>
                                </div>

                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-6">
                                    {(analysis?.semanticScore ?? analysis?.score) > 80 ? "🔥 Excellent Match" : (analysis?.semanticScore ?? analysis?.score) > 50 ? "⚡ Good Base" : "Keep Tailoring"}
                                </p>

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
                                </div>
                            )}

                            <div className="bg-white rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden min-h-[1100px] relative group">
                                <MinimalistCVPreview data={viewMode === "optimized" ? (optimizedData || profileData) : profileData} />

                                {/* Hover Indicator for "What Mode" */}
                                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Viewing {viewMode} version
                                </div>
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
