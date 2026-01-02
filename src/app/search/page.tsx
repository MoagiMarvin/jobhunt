"use client";

import { useState } from "react";
import { Search, MapPin, Briefcase, ExternalLink } from "lucide-react";

export default function SearchPage() {
    const [query, setQuery] = useState("");

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="space-y-2 mb-8">
                    <h1 className="text-3xl font-bold">Job Search</h1>
                    <p className="text-muted-foreground">
                        Search for jobs across multiple platforms. Click on any job to copy its link for CV generation.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative">
                        <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search job title (e.g., Software Engineer, Nurse, Data Analyst)..."
                            className="w-full bg-secondary/50 border border-input rounded-lg pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-muted-foreground/50"
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
                    <div className="text-center py-12 text-muted-foreground">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Start typing to search for jobs</p>
                    </div>
                )}
            </div>
        </main>
    );
}

function JobCard() {
    return (
        <div className="p-6 bg-card/30 border border-border rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-semibold group-hover:text-indigo-400 transition-colors">
                        Senior Software Engineer
                    </h3>
                    <p className="text-sm text-muted-foreground">TechCorp Inc.</p>
                </div>
                <div className="flex gap-2">
                    <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">
                        Full-time
                    </span>
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">
                        Remote
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    New York, NY
                </div>
                <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    5+ years
                </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                We're looking for an experienced software engineer to join our team. You'll work on cutting-edge projects using React, Node.js, and cloud technologies...
            </p>

            <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium transition-all flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View Job
                </button>
                <button className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium transition-all">
                    Copy Link
                </button>
            </div>
        </div>
    );
}
