"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link2, Sparkles, Download, FileText, AlertCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";

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

    const [jobLink, setJobLink] = useState("");
    const [manualJD, setManualJD] = useState("");
    const [activeTab, setActiveTab] = useState<"link" | "manual">("link");
    const [isScraped, setIsScraped] = useState(false);
    const [isScraping, setIsScraping] = useState(false);
    const [scrapedRequirements, setScrapedRequirements] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Auto-fill and scrape if link is present in URL
    useEffect(() => {
        if (linkParam) {
            setJobLink(linkParam);
            setActiveTab("link");
            handleScrape(linkParam);
        }
    }, [linkParam]);

    const handleScrape = async (targetUrl?: string) => {
        const urlToScrape = targetUrl || jobLink;
        if (!urlToScrape || !urlToScrape.startsWith('http')) {
            alert("Please enter a valid job link.");
            return;
        }

        setIsScraping(true);
        setIsScraped(false);
        setError(null);

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
        // Simplified manual process
        setScrapedRequirements(manualJD.split('\n').filter(l => l.trim().length > 20).slice(0, 10));
        setIsScraped(true);
    };

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
                                <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold flex items-center gap-2 text-primary">
                                            <Sparkles className="w-5 h-5 text-accent" />
                                            ATS Match Analysis
                                        </h3>
                                        <span className="text-2xl font-bold text-green-600">87%</span>
                                    </div>

                                    <div className="h-3 bg-white rounded-full overflow-hidden border border-slate-200">
                                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 w-[87%] transition-all duration-500"></div>
                                    </div>

                                    {/* Breakdown */}
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-start gap-2 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-green-700">12 Matching Skills</p>
                                                <p className="text-xs text-slate-600">Python, JavaScript, React, Node.js, AWS, Problem-solving...</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-green-700">3 Relevant Experiences</p>
                                                <p className="text-xs text-slate-600">Senior Developer, Full-stack Engineer, Jr Developer</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 text-sm">
                                            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-yellow-700">2 Missing Keywords</p>
                                                <p className="text-xs text-slate-600">Docker, Kubernetes</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 text-sm">
                                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-red-700">1 Requirement Not Met</p>
                                                <p className="text-xs text-slate-600">Bachelor's degree (you have Associate's)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <button className="w-full py-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    Generate Optimized CV
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
                    <div className="bg-white rounded-xl p-8 flex items-center justify-center sticky top-24 h-fit border-2 border-blue-100 shadow-lg">
                        <div className="w-full max-w-[210mm] aspect-[1/1.414] bg-white text-slate-900 shadow-xl rounded-sm overflow-hidden scale-75 origin-top border border-slate-200">
                            {/* Mock CV Preview */}
                            <div className="p-10 space-y-6">
                                <div className="border-b-2 border-slate-800 pb-6">
                                    <h1 className="text-4xl font-bold text-slate-900">John Doe</h1>
                                    <p className="text-slate-500 font-medium text-lg mt-1">Software Engineer</p>
                                    <div className="flex gap-4 text-xs text-slate-400 mt-3">
                                        <span>john@example.com</span>
                                        <span>•</span>
                                        <span>github.com/johndoe</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h2 className="uppercase tracking-wider text-xs font-bold text-slate-500">Summary</h2>
                                    <p className="text-sm leading-relaxed text-slate-700">
                                        Software Engineer with <strong className="bg-yellow-100 px-1">5+ years</strong> specializing in <strong className="bg-yellow-100 px-1">Python</strong> and <strong className="bg-yellow-100 px-1">JavaScript</strong>. Expert in <strong className="bg-yellow-100 px-1">React</strong> and <strong className="bg-yellow-100 px-1">Node.js</strong> with proven track record.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="uppercase tracking-wider text-xs font-bold text-slate-500">Experience</h2>
                                    <div>
                                        <div className="flex justify-between">
                                            <h3 className="font-bold text-slate-900">Senior Developer</h3>
                                            <span className="text-xs text-slate-500">2023 - Present</span>
                                        </div>
                                        <p className="text-xs text-slate-500 italic">TechCorp Inc.</p>
                                        <ul className="list-disc pl-4 text-xs text-slate-700 space-y-1 mt-2 marker:text-slate-400">
                                            <li>Led development using <strong className="bg-blue-50 px-1">Node.js</strong> and <strong className="bg-blue-50 px-1">React</strong></li>
                                            <li>Deployed on <strong className="bg-blue-50 px-1">AWS</strong> infrastructure</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h2 className="uppercase tracking-wider text-xs font-bold text-slate-500">Skills</h2>
                                    <div className="flex flex-wrap gap-1">
                                        {["Python", "JavaScript", "React", "Node.js", "AWS"].map((skill) => (
                                            <span key={skill} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Download Section */}
                {isScraped && (
                    <div className="mt-8 flex justify-center">
                        <button className="px-8 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-primary transition-all flex items-center gap-2 border border-slate-200 shadow-md">
                            <Download className="w-4 h-4" />
                            Download CV (PDF)
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
