"use client";

import { useRouter } from "next/navigation";
import { Loader2, Bookmark, Briefcase, AlertCircle, ArrowLeft } from "lucide-react";
import JobCard from "@/components/JobCard";
import { useSavedJobs } from "@/hooks/useSavedJobs";

export default function SavedJobsPage() {
    const router = useRouter();
    const { savedJobs, loading } = useSavedJobs();

    return (
        <div className="p-8 max-w-5xl mx-auto min-h-screen">
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Saved Jobs</h1>
                    <p className="text-sm text-slate-500">
                        Manage the opportunities you've bookmarked.
                    </p>
                </div>
                <button
                    onClick={() => router.push('/search')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors"
                >
                    <Briefcase className="w-4 h-4" />
                    Back to Search
                </button>
            </div>

            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">Loading your saved jobs...</p>
                    </div>
                ) : savedJobs.length > 0 ? (
                    <div className="grid gap-4">
                        <div className="flex justify-between items-center mb-2 px-1">
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                                Bookmarked ({savedJobs.length})
                            </h2>
                        </div>
                        {savedJobs.map((item) => (
                            <JobCard key={item.id} job={item.job_data} router={router} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bookmark className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1">No saved jobs yet</h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                            Start exploring and bookmark the jobs you're interested in applying for later.
                        </p>
                        <button
                            onClick={() => router.push('/search')}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                        >
                            Find Jobs
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
