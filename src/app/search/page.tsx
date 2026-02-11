"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Briefcase, ExternalLink, Loader2, AlertCircle, Copy, Check, Mic } from "lucide-react";
import JobCard from "@/components/JobCard";

export default function SearchPage() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingSources, setLoadingSources] = useState<string[]>([]);

    // Filter states
    const [locationFilter, setLocationFilter] = useState('all');
    const [experienceFilter, setExperienceFilter] = useState('all');
    const [hasSearched, setHasSearched] = useState(false);
    const [category, setCategory] = useState("all");

    // Load state from session storage on mount
    useEffect(() => {
        const savedQuery = sessionStorage.getItem('job_search_query');
        const savedJobs = sessionStorage.getItem('job_search_results');
        const savedCategory = sessionStorage.getItem('job_search_category');

        if (savedQuery) setQuery(savedQuery);
        if (savedCategory) setCategory(savedCategory);
        if (savedJobs) {
            setJobs(JSON.parse(savedJobs));
            setHasSearched(true);
        }
    }, []);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setHasSearched(true);
        setJobs([]);

        // Save current query to session immediately
        sessionStorage.setItem('job_search_query', query);
        sessionStorage.setItem('job_search_category', category); // Persist category too

        // Sources we scan
        const primarySources = ['pnet', 'vodacom', 'mtn', 'standardbank', 'fnb', 'goldman', 'emerge'];
        const backSources = ['linkedin', 'careers24', 'indeed'];
        const allSources = [...primarySources, ...backSources];
        setLoadingSources(allSources);

        try {
            // 1. Fetch PRIMARY Sources (Direct Tech)
            primarySources.forEach(async (src) => {
                try {
                    const res = await fetch(`/api/search?query=${encodeURIComponent(query)}&source=${src}`);
                    const data = await res.json();
                    if (data.jobs && data.jobs.length > 0) {
                        setJobs(prev => {
                            const newJobs = [...prev, ...data.jobs];
                            // Update session storage incrementally
                            sessionStorage.setItem('job_search_results', JSON.stringify(newJobs));
                            return newJobs;
                        });
                    }
                } finally {
                    setLoadingSources(prev => prev.filter(s => s !== src));
                    // Check if this was the last primary source
                }
            });

            // Stop main loading after primary sources start
            setTimeout(() => setLoading(false), 2000);

            // 2. Fetch others in BACKGROUND
            const backgroundSources = backSources;

            backgroundSources.forEach(async (src) => {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 30000); // Increased to 30s for slow scrapers

                try {
                    const res = await fetch(`/api/search?query=${encodeURIComponent(query)}&source=${src}`, {
                        signal: controller.signal
                    });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);

                    const data = await res.json();
                    if (data.jobs && data.jobs.length > 0) {
                        setJobs(prev => {
                            const newJobs = [...prev, ...data.jobs];
                            sessionStorage.setItem('job_search_results', JSON.stringify(newJobs));
                            return newJobs;
                        });
                    }
                } catch (err: any) {
                    if (err.name === 'AbortError') {
                        console.warn(`[Search] Source ${src} timed out after 15s.`);
                    } else {
                        console.error(`[Search] Background source ${src} failed:`, err);
                    }
                } finally {
                    clearTimeout(timer);
                    setLoadingSources(prev => prev.filter(s => s !== src));
                }
            });

        } catch (error) {
            console.error("[Search] Critical search failure:", error);
            setLoading(false);
            setLoadingSources([]);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-10">
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Job Search Explorer</h1>
                <p className="text-sm text-slate-500">
                    Scanning multiple engines to find your next opportunity.
                </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-10">
                <div className="flex bg-white rounded-2xl shadow-sm border border-slate-200 focus-within:border-blue-500 transition-all overflow-hidden p-1.5">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Role or company..."
                            className="w-full pl-12 pr-4 py-3.5 text-sm outline-none bg-transparent"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#0a66c2] text-white px-8 rounded-xl font-bold hover:bg-[#004182] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                    </button>
                </div>
            </form>

            {/* Loading Status Bar */}
            {hasSearched && loadingSources.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-2 items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Engines:</span>
                    {['pnet', 'linkedin', 'careers24', 'indeed', 'vodacom', 'mtn', 'standardbank', 'fnb', 'goldman', 'emerge'].map(source => (
                        <div
                            key={source}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${loadingSources.includes(source)
                                ? 'bg-blue-50 text-blue-500 border-blue-200 animate-pulse'
                                : 'bg-green-50 text-green-600 border-green-200 opacity-60'
                                }`}
                        >
                            {source === 'standardbank' ? 'STANDARD BANK' : source.toUpperCase()}
                        </div>
                    ))}
                </div>
            )}

            {/* Results Section */}
            <div className="space-y-6">
                {/* Main Spinner (Only for first load) */}
                {loading && jobs.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">Igniting scrapers...</p>
                    </div>
                )}

                {/* Results List */}
                {!loading && jobs.length > 0 && (
                    <div className="grid gap-4">
                        <div className="flex justify-between items-center mb-2 px-1">
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                                Discoveries ({jobs.length})
                            </h2>
                        </div>
                        {jobs.map((job) => (
                            <JobCard key={job.id} job={job} router={router} />
                        ))}
                    </div>
                )}

                {/* No Results Message */}
                {!loading && hasSearched && jobs.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-red-50 shadow-sm">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1">No Jobs Found</h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">
                            Try a different keyword or check your internet connection.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

