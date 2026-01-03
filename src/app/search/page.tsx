"use client";

import { useState } from "react";
import { Search, MapPin, Briefcase, ExternalLink, Loader2, AlertCircle, Copy, Info } from "lucide-react";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [manualJD, setManualJD] = useState("");

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setHasSearched(true);
        setJobs([]);

        try {
            const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.jobs) {
                setJobs(data.jobs);
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleManualAnalysis = () => {
        if (!manualJD.trim()) {
            alert("Please paste a job description first.");
            return;
        }
        localStorage.setItem("current_target_jd", manualJD);
        alert("Job Description captured! We are now ready to optimize your Master CV for this specific role.");
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-20">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="space-y-2 mb-8">
                    <h1 className="text-3xl font-bold text-primary">Job Search & Analysis</h1>
                    <p className="text-slate-600 max-w-2xl">
                        Search boards for jobs OR paste a description manually to optimize your CV "no matter what".
                    </p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-10">
                    <div className="relative flex gap-2">
                        <div className="relative flex-1">
                            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search job title (e.g. Electrician, Accountant)..."
                                className="w-full bg-white border-2 border-slate-200 rounded-lg pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Auto-Scrape Boards"}
                        </button>
                    </div>
                </form>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-20 bg-white/50 rounded-2xl border border-blue-100 mb-10">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">Scanning PNet & LinkedIn for you...</p>
                        <p className="text-xs text-slate-400 mt-2">Bypassing anti-bot checks where possible.</p>
                    </div>
                )}

                {/* Scraping Results */}
                <div className="space-y-4 mb-12">
                    {!loading && jobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>

                {/* Status Messages */}
                {!loading && hasSearched && jobs.length === 0 && (
                    <div className="mb-12">
                        <div className="text-center py-10 bg-white rounded-xl border border-red-100">
                            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                            <h3 className="font-bold text-slate-800">Scraping Blocked or No Results</h3>
                            <p className="text-sm text-slate-500">PNet/LinkedIn might be hiding data. Use the manual paste below.</p>
                        </div>
                    </div>
                )}

                {/* Manual Fallback (The "No Matter What" Method) */}
                {!loading && (
                    <div className="pt-8 border-t-2 border-slate-200">
                        <div className="bg-white p-10 rounded-2xl border-2 border-dashed border-blue-200 hover:border-blue-400 transition-all shadow-xl group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-600 rounded-xl shadow-lg ring-4 ring-blue-50">
                                        <Copy className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 leading-tight">THE "NO MATTER WHAT" METHOD</h2>
                                        <p className="text-slate-500">Paste the job description or link below to bypass all blocks.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-full border border-blue-100">
                                    <Info className="w-3 h-3" />
                                    100% RELIABLE FOR AI OPTIMIZATION
                                </div>
                            </div>

                            <div className="space-y-4">
                                <textarea
                                    value={manualJD}
                                    onChange={(e) => setManualJD(e.target.value)}
                                    className="w-full h-56 bg-white border-2 border-slate-100 rounded-xl p-6 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 font-sans leading-relaxed text-slate-700 shadow-inner"
                                    placeholder="Open the job in your browser, copy the text (Requirements, Responsibilities, etc.), and paste it here..."
                                ></textarea>

                                <button
                                    onClick={handleManualAnalysis}
                                    className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-5 rounded-xl font-black text-lg tracking-wide hover:shadow-2xl hover:scale-[1.01] transition-all active:scale-95 flex items-center justify-center gap-3 border-b-4 border-slate-700"
                                >
                                    <Briefcase className="w-6 h-6" />
                                    GENERATE MY OPTIMIZED MASTER CV
                                </button>
                                <p className="text-center text-xs text-slate-400">
                                    This will compare the JD with your **Master CV** to highlight the right skills.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

function JobCard({ job }: { job: any }) {
    const handleUseForCV = () => {
        alert(`Connecting to: ${job.title}\nSince this is from a board, we recommend viewing the job first to copy the full text into the "Manual Paste" box if you see asterisks!`);
    };

    return (
        <div className="p-6 bg-white border-2 border-blue-50 rounded-xl hover:border-blue-400 hover:shadow-2xl transition-all group relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex-1">
                    <h3 className="text-xl font-extrabold text-primary group-hover:text-blue-600 transition-colors mb-1 leading-tight">
                        {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-900 font-bold">
                        <span className="text-blue-600 uppercase tracking-tighter text-[10px] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Company</span>
                        {job.company}
                    </div>
                </div>
                <div className="flex gap-2">
                    <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest border ${job.source === 'PNet' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-600 text-white border-blue-700 shadow-sm'}`}>
                        {job.source}
                    </span>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 mb-6">
                <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {job.location}
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    {job.date}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-6 py-3 rounded-lg bg-slate-50 text-slate-900 border border-slate-200 hover:bg-slate-100 text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                    <ExternalLink className="w-4 h-4" />
                    View Original Listing
                </a>
                <button
                    onClick={handleUseForCV}
                    className="flex-1 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:translate-y-0.5"
                >
                    Optimize CV For This Job
                </button>
            </div>

            {/* Visual indicator for "Blind Ads" / Asterisks */}
            {job.title.includes('*') && (
                <div className="absolute top-0 right-0 p-1">
                    <div className="bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 transform rotate-45 translate-x-3 -translate-y-1 shadow-sm">
                        MASKED DATA
                    </div>
                </div>
            )}
        </div>
    );
}
