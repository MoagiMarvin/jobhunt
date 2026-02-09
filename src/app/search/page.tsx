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
        const primarySources = ['pnet', 'vodacom', 'mtn', 'standardbank', 'fnb'];
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
                const timer = setTimeout(() => controller.abort(), 15000); // 15s timeout for slower scrapers

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
                            className="bg-blue-600 text-white px-4 sm:px-8 font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-w-[60px]"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <Search className="w-5 h-5 sm:hidden" />
                                    <span className="hidden sm:inline">Find Jobs</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Loading Status Bar */}
                {/* Tech Categories */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {[
                        { id: "all", label: "Everything Tech", icon: Briefcase },
                        { id: "tester", label: "Software Testers", icon: Check },
                        { id: "technician", label: "IT Technicians", icon: MapPin },
                        { id: "consultant", label: "Tech Consultants", icon: Search },
                    ].map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setCategory(cat.id);
                                sessionStorage.setItem('job_search_category', cat.id);
                            }}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 border-2 ${category === cat.id
                                ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                                : "bg-white text-slate-600 border-slate-100 hover:border-blue-200"
                                }`}
                        >
                            <cat.icon className="w-3.5 h-3.5" />
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Loading Status Bar */}
                {hasSearched && loadingSources.length > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scanning:</span>
                        {['pnet', 'linkedin', 'careers24', 'indeed', 'vodacom', 'mtn', 'standardbank', 'fnb'].map(source => (
                            <div
                                key={source}
                                className={`px-2 py-1 rounded-lg text-[9px] font-bold transition-all border ${loadingSources.includes(source)
                                    ? 'bg-blue-50 text-blue-500 border-blue-200 animate-pulse'
                                    : 'bg-green-50 text-green-600 border-green-200 opacity-60'
                                    }`}
                            >
                                {source === 'standardbank' ? 'STANDARD BANK' : source.toUpperCase()}
                            </div>
                        ))}
                    </div>
                )}

                {/* Main Spinner (Only for first load) */}
                {loading && jobs.length === 0 && (
                    <div className="text-center py-20 bg-white/50 rounded-2xl border border-blue-100 mb-10">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">Starting Search Engines...</p>
                    </div>
                )}

                {/* Results Container */}
                <div className="grid gap-4 mb-12">
                    {/* Show saved results immediately if available */}
                    {(loading || hasSearched || jobs.length > 0) && jobs
                        .filter(job => {
                            if (category === "all") return true;
                            const title = job.title.toLowerCase();
                            return title.includes(category);
                        })
                        .map((job) => (
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

