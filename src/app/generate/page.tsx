"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link2, Sparkles, Download, FileText, AlertCircle, CheckCircle2, XCircle, Loader2, Mail, Phone } from "lucide-react";

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
    const [cvText, setCvText] = useState("");
    const [userDetails, setUserDetails] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedCv, setOptimizedCv] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Load Master CV and User details on mount
    useEffect(() => {
        const savedCv = localStorage.getItem("master_cv_text");
        if (savedCv) setCvText(savedCv);

        const savedUser = localStorage.getItem("user_details");
        if (savedUser) setUserDetails(JSON.parse(savedUser));
    }, []);


    const handleOptimize = async (requirements: string[]) => {
        if (!cvText) {
            alert("Please save a Master CV in your Profile first.");
            return;
        }

        setIsOptimizing(true);
        try {
            const res = await fetch('/api/optimize-cv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobRequirements: requirements,
                    cvText,
                    userDetails
                }),
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setOptimizedCv(data);
        } catch (err: any) {
            console.error("Optimization failed:", err);
            setError("Failed to generate tailored CV: " + err.message);
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleAnalyze = async (requirements: string[]) => {
        if (!cvText) {
            console.warn("No Master CV found for analysis.");
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
                    cvText
                }),
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setAnalysis(data);

            // Wait a small bit then auto-optimize for smooth UX
            setTimeout(() => handleOptimize(requirements), 500);
        } catch (err: any) {
            console.error("Analysis failed:", err);
            setError("Analysis snagged: " + (err.message || "Unknown error"));
        } finally {
            setIsAnalyzing(false);
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

    // Trigger analysis automatically when both requirements and CV are ready
    useEffect(() => {
        if (scrapedRequirements.length > 0 && cvText && !analysis && !isAnalyzing) {
            handleAnalyze(scrapedRequirements);
        }
    }, [scrapedRequirements, cvText, analysis, isAnalyzing]);

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
                                                    <p className="text-sm text-slate-700 italic border-l-4 border-blue-200 pl-3 py-1 bg-white/50 rounded">
                                                        "{analysis.summary}"
                                                    </p>
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
                                                {!cvText ? (
                                                    <p className="text-sm text-red-500 font-medium">Please save a Master CV in your Profile first!</p>
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

                                {/* Generate Button */}
                                <button
                                    onClick={() => handleOptimize(scrapedRequirements)}
                                    disabled={isOptimizing || scrapedRequirements.length === 0}
                                    className="w-full py-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isOptimizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                    {isOptimizing ? "Generation in progress..." : "Generate Optimized CV"}
                                </button>
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
                        {isOptimizing ? (
                            <div className="text-center space-y-4">
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                                    <Sparkles className="w-8 h-8 text-blue-500 absolute inset-0 m-auto animate-pulse" />
                                </div>
                                <p className="text-sm font-bold text-slate-600 tracking-tight">AI is crafting your tailored CV...</p>
                                <p className="text-[10px] text-slate-400">Rewriting bullet points for maximum impact.</p>
                            </div>
                        ) : optimizedCv ? (
                            <div className="w-full max-w-[210mm] bg-white text-slate-900 shadow-2xl rounded-sm overflow-hidden border border-slate-200 p-10 space-y-6">
                                {/* Real CV Header */}
                                <div className="border-b-2 border-slate-800 pb-6">
                                    <h1 className="text-4xl font-bold text-slate-900">{optimizedCv.personalInfo?.name || userDetails?.name}</h1>
                                    <p className="text-slate-500 font-medium text-lg mt-1">{optimizedCv.personalInfo?.title || "Candidate"}</p>
                                    <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-3 font-medium">
                                        <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{optimizedCv.personalInfo?.email || userDetails?.email}</span>
                                        <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{optimizedCv.personalInfo?.phone || userDetails?.phone}</span>
                                        {optimizedCv.personalInfo?.location && <span>• {optimizedCv.personalInfo.location}</span>}
                                    </div>
                                </div>

                                {/* Tailored Summary */}
                                <div className="space-y-2">
                                    <h2 className="uppercase tracking-widest text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit">Professional Summary</h2>
                                    <p className="text-sm leading-relaxed text-slate-700">
                                        {optimizedCv.summary}
                                    </p>
                                </div>

                                {/* Experience Sections */}
                                <div className="space-y-4">
                                    <h2 className="uppercase tracking-widest text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit">Professional Experience</h2>
                                    {optimizedCv.experience?.map((exp: any, i: number) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex justify-between items-baseline">
                                                <h3 className="font-bold text-slate-900 text-sm">{exp.role}</h3>
                                                <span className="text-[10px] font-bold text-slate-400">{exp.dates}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 italic font-medium">{exp.company}</p>
                                            <ul className="list-disc pl-4 text-xs text-slate-700 space-y-1.5 mt-2 marker:text-blue-400">
                                                {exp.bulletPoints?.map((bullet: string, j: number) => (
                                                    <li key={j} className="leading-normal">{bullet}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>

                                {/* Skills Grid */}
                                <div className="space-y-2 pt-2">
                                    <h2 className="uppercase tracking-widest text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit">Core Competencies</h2>
                                    <div className="flex flex-wrap gap-1.5">
                                        {optimizedCv.skills?.map((skill: string) => (
                                            <span key={skill} className="text-[10px] font-bold px-2 py-1 bg-slate-50 text-slate-600 rounded border border-slate-200">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Education */}
                                {optimizedCv.education?.length > 0 && (
                                    <div className="space-y-2 pt-2">
                                        <h2 className="uppercase tracking-widest text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit">Education</h2>
                                        {optimizedCv.education.map((edu: any, i: number) => (
                                            <div key={i} className="flex justify-between text-xs">
                                                <span className="font-bold">{edu.degree} @ {edu.school}</span>
                                                <span className="text-slate-400">{edu.year}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center p-12 text-slate-400">
                                <FileText className="w-16 h-16 mx-auto mb-4 opacity-10" />
                                <p className="text-sm font-medium">Your optimized CV preview will appear here.</p>
                                <p className="text-[10px] mt-1">AI needs to analyze job requirements first.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Download Section */}
                {optimizedCv && (
                    <div className="mt-12 flex justify-center">
                        <button
                            onClick={() => window.print()}
                            className="px-8 py-3 rounded-lg bg-slate-900 hover:bg-black text-white font-bold transition-all flex items-center gap-2 shadow-xl hover:-translate-y-1"
                        >
                            <Download className="w-5 h-5" />
                            Download Tailored CV (PDF)
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
