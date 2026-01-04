"use client";

import { useState } from "react";
import { Link2, Sparkles, Download, FileText, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export default function GeneratePage() {
    const [jobLink, setJobLink] = useState("");
    const [manualJD, setManualJD] = useState("");
    const [activeTab, setActiveTab] = useState<"link" | "manual">("link");
    const [isScraped, setIsScraped] = useState(false);

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

    const handleManualProcess = () => {
        if (!manualJD.trim()) {
            alert("Please paste the job description first.");
            return;
        }
        // Logic to extract requirements from manual text would go here
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
                                            onClick={handleScrape}
                                            className="px-6 py-3 rounded-lg bg-accent hover:bg-blue-600 text-white font-semibold transition-all shadow-md"
                                        >
                                            Scrape
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
                                            className="w-full py-3 rounded-lg bg-accent hover:bg-blue-600 text-white font-bold transition-all shadow-md"
                                        >
                                            Analyze Text
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Scraped Requirements */}
                        {isScraped && (
                            <>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold flex items-center gap-2 text-primary">
                                            <FileText className="w-4 h-4 text-accent" />
                                            Extracted Requirements
                                        </label>
                                        <span className="text-xs text-slate-500 font-medium">Editable</span>
                                    </div>
                                    <div className="p-4 rounded-lg bg-white border-2 border-blue-100 space-y-2 max-h-64 overflow-y-auto">
                                        {scrapedRequirements.map((req, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm">
                                                <span className="text-accent mt-0.5">•</span>
                                                <input
                                                    type="text"
                                                    defaultValue={req}
                                                    className="flex-1 bg-transparent border-none outline-none text-slate-700 focus:text-accent transition-colors"
                                                />
                                            </div>
                                        ))}
                                        <button className="text-xs text-slate-500 hover:text-accent transition-colors mt-2 font-medium">
                                            + Add requirement
                                        </button>
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
