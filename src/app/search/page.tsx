"use client";

import { useState } from "react";
import { Search, MapPin, Briefcase, ExternalLink, Loader2, AlertCircle } from "lucide-react";

export default function SearchPage() {
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
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="space-y-2 mb-8">
                    <h1 className="text-3xl font-bold text-primary">Job Search</h1>
                    <p className="text-slate-600">
                        Search for jobs across PNet and LinkedIn. Real-time scanning.
                    </p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-8">
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
                            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
                        </button>
                    </div>
                </form>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-20">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                        <p className="text-slate-500">Scanning job boards (PNet & LinkedIn)...</p>
                    </div>
                )}

                {/* Results */}
                <div className="space-y-4">
                    {!loading && jobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>

                {/* Empty State / No Results */}
                {!loading && hasSearched && jobs.length === 0 && (
                    <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>No jobs found. Try a different keyword.</p>
                    </div>
                )}

                {/* Initial State */}
                {!loading && !hasSearched && (
                    <div className="text-center py-12 text-slate-400">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Enter a job title to start scraping.</p>
                    </div>
                )}
            </div>
        </main>
    );
}

function JobCard({ job }: { job: any }) {
    return (
        <div className="p-6 bg-white border-2 border-blue-50 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-bold text-primary group-hover:text-blue-600 transition-colors">
                        {job.title}
                    </h3>
                    <p className="text-sm text-slate-600 font-semibold">{job.company}</p>
                </div>
                <div className="flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded font-bold border ${job.source === 'PNet' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {job.source}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                </div>
                <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {job.date}
                </div>
            </div>

            <div className="flex gap-2">
                <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
                >
                    <ExternalLink className="w-4 h-4" />
                    View on {job.source}
                </a>
            </div>
        </div>
    );
}
