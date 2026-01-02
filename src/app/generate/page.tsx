"use client";

import { useState } from "react";
import { Link2, Sparkles, Download, FileText, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export default function GeneratePage() {
    const [jobLink, setJobLink] = useState("");
    const [isScraped, setIsScraped] = useState(false);

    // Mock scraped data (will be replaced with real scraper)
    const scrapedRequirements = [
        "5+ years of software development experience",
        "Strong proficiency in Python and JavaScript",
        "Experience with React and Node.js",
        "Knowledge of Docker and Kubernetes",
        "Bachelor's degree in Computer Science or related field",
        "Excellent problem-solving skills",
        "Experience with cloud platforms (AWS/GCP/Azure)",
    ];

    const handleScrape = () => {
        setIsScraped(true);
    };

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left: Input & Analysis */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold">Generate Tailored CV</h1>
                            <p className="text-muted-foreground">
                                Paste a job link. We'll extract requirements, match them against your profile, and generate an optimized CV.
                            </p>
                        </div>

                        {/* Job Link Input */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Link2 className="w-4 h-4" />
                                Job Posting URL
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={jobLink}
                                    onChange={(e) => setJobLink(e.target.value)}
                                    placeholder="https://example.com/jobs/software-engineer"
                                    className="flex-1 bg-secondary/50 border border-input rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-muted-foreground/50"
                                />
                                <button
                                    onClick={handleScrape}
                                    className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all"
                                >
                                    Scrape
                                </button>
                            </div>
                        </div>

                        {/* Scraped Requirements */}
                        {isScraped && (
                            <>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-indigo-400" />
                                            Extracted Requirements
                                        </label>
                                        <span className="text-xs text-muted-foreground">Editable</span>
                                    </div>
                                    <div className="p-4 rounded-lg bg-card/30 border border-border space-y-2 max-h-64 overflow-y-auto">
                                        {scrapedRequirements.map((req, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm">
                                                <span className="text-indigo-400 mt-0.5">•</span>
                                                <input
                                                    type="text"
                                                    defaultValue={req}
                                                    className="flex-1 bg-transparent border-none outline-none text-foreground focus:text-indigo-300 transition-colors"
                                                />
                                            </div>
                                        ))}
                                        <button className="text-xs text-muted-foreground hover:text-indigo-400 transition-colors mt-2">
                                            + Add requirement
                                        </button>
                                    </div>
                                </div>

                                {/* ATS Match Analysis */}
                                <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-indigo-400" />
                                            ATS Match Analysis
                                        </h3>
                                        <span className="text-2xl font-bold text-green-400">87%</span>
                                    </div>

                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 w-[87%] transition-all duration-500"></div>
                                    </div>

                                    {/* Breakdown */}
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-start gap-2 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-green-400">12 Matching Skills</p>
                                                <p className="text-xs text-muted-foreground">Python, JavaScript, React, Node.js, AWS, Problem-solving...</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-green-400">3 Relevant Experiences</p>
                                                <p className="text-xs text-muted-foreground">Senior Developer, Full-stack Engineer, Jr Developer</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 text-sm">
                                            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-yellow-400">2 Missing Keywords</p>
                                                <p className="text-xs text-muted-foreground">Docker, Kubernetes</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 text-sm">
                                            <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-red-400">1 Requirement Not Met</p>
                                                <p className="text-xs text-muted-foreground">Bachelor's degree (you have Associate's)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <button className="w-full py-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    Generate Optimized CV
                                </button>
                            </>
                        )}

                        {/* Empty State */}
                        {!isScraped && (
                            <div className="p-12 rounded-xl border-2 border-dashed border-border text-center">
                                <Link2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">Paste a job link and click "Scrape" to begin</p>
                            </div>
                        )}
                    </div>

                    {/* Right: CV Preview */}
                    <div className="bg-secondary/30 rounded-xl p-8 flex items-center justify-center sticky top-24 h-fit">
                        <div className="w-full max-w-[210mm] aspect-[1/1.414] bg-white text-slate-900 shadow-2xl rounded-sm overflow-hidden scale-75 origin-top">
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
                                        Software Engineer with <strong className="bg-yellow-100 px-1">5+ years</strong> specializing in <strong className="bg-yellow-100 px-1">Python</strong> and <strong className="bg-yellow-100 px-1">JavaScript</strong>. Expert in <strong className="bg-yellow-100 px-1">React</strong> and <strong className="bg-yellow-100 px-1">Node.js</strong> with proven track record in building scalable applications.
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
                                            <li>Led development of microservices using <strong className="bg-indigo-50 px-1">Node.js</strong> and <strong className="bg-indigo-50 px-1">React</strong></li>
                                            <li>Deployed applications on <strong className="bg-indigo-50 px-1">AWS</strong> cloud infrastructure</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h2 className="uppercase tracking-wider text-xs font-bold text-slate-500">Skills</h2>
                                    <div className="flex flex-wrap gap-1">
                                        {["Python", "JavaScript", "React", "Node.js", "AWS", "Problem-solving"].map((skill) => (
                                            <span key={skill} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
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
                        <button className="px-8 py-3 rounded-lg bg-secondary hover:bg-secondary/80 font-medium transition-all flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Download CV (PDF)
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
