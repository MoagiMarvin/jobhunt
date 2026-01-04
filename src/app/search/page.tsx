"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Briefcase, ExternalLink, Loader2, AlertCircle, Copy, Check } from "lucide-react";

export default function SearchPage() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

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

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Job Search & AI Optimizer</h1>
                    <p className="text-slate-600">
                        Find jobs online across PNet and LinkedIn to optimize your CV.
                    </p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="flex bg-white rounded-xl shadow-sm border-2 border-slate-200 focus-within:border-blue-500 transition-all overflow-hidden">
                        <div className="flex-1 relative">
                            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search job title (e.g. Electrician, Software Engineer)..."
                                className="w-full pl-12 pr-4 py-4 text-sm outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-8 font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Find Jobs"}
                        </button>
                    </div>
                </form>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-20 bg-white/50 rounded-2xl border border-blue-100 mb-10">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">Scanning PNet & LinkedIn...</p>
                    </div>
                )}

                {/* Results Container */}
                <div className="space-y-4 mb-12">
                    {!loading && jobs.map((job) => (
                        <JobCard key={job.id} job={job} router={router} />
                    ))}
                </div>

                {/* No Results Message */}
                {!loading && hasSearched && jobs.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-red-100">
                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-900">Scraping Restricted</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto">
                            The site might be blocking my robot. Try a different keyword or use the manual optimizer in the Generate page.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}

function JobCard({ job, router }: { job: any; router: any }) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(job.link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleUseForCV = () => {
        // Redirect to generate and pass the link
        router.push(`/generate?link=${encodeURIComponent(job.link)}`);
    };

    return (
        <div className="p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-300 hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                        {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${job.source === 'PNet' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                            {job.source}
                        </span>
                        <span>{job.company}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={handleCopyLink}
                    className="flex-1 px-4 py-2.5 rounded-lg border-2 border-slate-100 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Link Copied!" : "Copy Job Link"}
                </button>
                <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-slate-100 text-slate-900 hover:bg-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                    <ExternalLink className="w-4 h-4" />
                    Open Original
                </a>
                <button
                    onClick={handleUseForCV}
                    className="flex-[2] px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                    <Briefcase className="w-4 h-4" />
                    Optimize CV For This Job
                </button>
            </div>

            {/* Masked Indicator */}
            {job.title.includes('*') && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold rounded-full border border-amber-100">
                    <AlertCircle className="w-3 h-3" />
                    MASKED DATA
                </div>
            )}
        </div>
    );
}
