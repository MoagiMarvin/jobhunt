"use client";

import { useState } from "react";
import { Search, MapPin, Briefcase, ExternalLink } from "lucide-react";

export default function SearchPage() {
    const [query, setQuery] = useState("");

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="space-y-2 mb-8">
                    <h1 className="text-3xl font-bold text-primary">Job Search</h1>
                    <p className="text-slate-600">
                        Search for jobs across multiple platforms. Click on any job to copy its link for CV generation.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative">
                        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search job title (e.g., Software Engineer, Nurse, Data Analyst)..."
                            className="w-full bg-white border-2 border-slate-200 rounded-lg pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <JobCard key={i} />
                    ))}
                </div>

                {/* Empty State */}
                {query === "" && (
                    <div className="text-center py-12 text-slate-500">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>Start typing to search for jobs</p>
                    </div>
                )}
            </div>
        </main>
    );
}

function JobCard() {
    return (
        <div className="p-6 bg-white border-2 border-blue-100 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-bold text-primary group-hover:text-accent transition-colors">
                        Senior Software Engineer
                    </h3>
                    <p className="text-sm text-slate-600">TechCorp Inc.</p>
                </div>
                <div className="flex gap-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold border border-green-200">
                        Full-time
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold border border-blue-200">
                        Remote
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    New York, NY
                </div>
                <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    5+ years
                </div>
            </div>

            <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                We're looking for an experienced software engineer to join our team. You'll work on cutting-edge projects using React, Node.js, and cloud technologies...
            </p>

            <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-semibold transition-all flex items-center gap-2 shadow-md">
                    <ExternalLink className="w-4 h-4" />
                    View Job
                </button>
                <button className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-primary text-sm font-semibold transition-all border border-slate-200">
                    Copy Link
                </button>
            </div>
        </div>
    );
}
