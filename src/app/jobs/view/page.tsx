"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Briefcase, Mic, ExternalLink, ArrowLeft, AlertCircle, Building2, MapPin } from 'lucide-react';

function JobViewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get params from URL
    const jobUrl = searchParams.get('url');
    const jobTitle = searchParams.get('title') || 'Job Position';
    const jobCompany = searchParams.get('company') || 'Company';
    const jobLocation = searchParams.get('location') || 'South Africa';
    const jobSource = searchParams.get('source') || 'External';

    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchContent = async () => {
            if (!jobUrl) return;

            try {
                const res = await fetch('/api/job/content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: jobUrl })
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.error || 'Failed to fetch');

                setContent(data.content);
            } catch (err) {
                console.error("Failed to load job:", err);
                setError("We couldn't load the full description here. Please view it on the original site.");
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [jobUrl]);

    if (!jobUrl) return <div className="p-10 text-center">Invalid Job Link</div>;

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            {/* Header / Nav */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Search
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.push(`/generate?link=${encodeURIComponent(jobUrl)}`)}
                            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition-all flex items-center gap-2"
                        >
                            <Briefcase className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Tailor CV</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title Card */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 relative z-10">{jobTitle}</h1>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 relative z-10">
                            <div className="flex items-center gap-1.5 font-medium text-slate-900">
                                <Building2 className="w-4 h-4 text-blue-500" />
                                {jobCompany}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                {jobLocation}
                            </div>
                            <div className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold uppercase">
                                {jobSource}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm min-h-[400px]">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Job Description</h2>

                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                                <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-500" />
                                <p>Fetching job details...</p>
                            </div>
                        ) : error ? (
                            <div className="py-10 text-center">
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl inline-flex items-center gap-2 mb-4">
                                    <AlertCircle className="w-5 h-5" />
                                    {error}
                                </div>
                                <br />
                                <a
                                    href={jobUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                                >
                                    View on {jobSource} <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        ) : (
                            <div
                                className="prose prose-slate max-w-none prose-sm sm:prose-base prose-headings:text-slate-900 prose-a:text-blue-600 hover:prose-a:underline"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        )}
                    </div>
                </div>

                {/* Sidebar Sticky */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-4">
                        {/* AI Tools Card */}
                        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl shadow-slate-200">
                            <h3 className="font-bold text-lg mb-1">AI Assistant</h3>
                            <p className="text-slate-400 text-xs mb-6">Don't apply blindly. Use our tools to increase your chances.</p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push(`/generate?link=${encodeURIComponent(jobUrl)}`)}
                                    className="w-full bg-white text-slate-900 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Briefcase className="w-4 h-4" />
                                    Tailor My CV
                                </button>

                                <button
                                    onClick={() => router.push(`/interview/practice?title=${encodeURIComponent(jobTitle)}&link=${encodeURIComponent(jobUrl)}`)}
                                    className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all flex items-center justify-center gap-2 border border-slate-700"
                                >
                                    <Mic className="w-4 h-4" />
                                    Practice Interview
                                </button>
                            </div>
                        </div>

                        {/* Apply External */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-2">Ready to Apply?</h3>
                            <p className="text-slate-500 text-xs mb-4">Once your CV is tailored, go to the official site.</p>
                            <a
                                href={jobUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                            >
                                Apply on {jobSource}
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}

export default function JobViewPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
            <JobViewContent />
        </Suspense>
    );
}
