"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Briefcase, Mic, ExternalLink, ArrowLeft, AlertCircle, Building2, MapPin, Mail, Copy } from 'lucide-react';

function JobViewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get params from URL
    const jobUrl = searchParams.get('url');
    const jobTitle = searchParams.get('title') || 'Job Position';
    const jobCompany = searchParams.get('company') || 'Company';
    const jobLocation = searchParams.get('location') || 'South Africa';
    const jobSource = searchParams.get('source') || 'External';
    const jobLogo = searchParams.get('logo');

    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [directUrl, setDirectUrl] = useState<string | null>(null);
    const [recruiterEmails, setRecruiterEmails] = useState<string[]>([]);

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
                if (data.directApplyUrl) setDirectUrl(data.directApplyUrl);
                if (data.emails && Array.isArray(data.emails)) setRecruiterEmails(data.emails);
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
        <div className="p-4 sm:p-8 max-w-6xl mx-auto">
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/generate?link=${encodeURIComponent(jobUrl || '')}`)}
                        className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Briefcase className="w-3.5 h-3.5" />
                        Tailor My CV
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title Card */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                        <div className="flex gap-5 items-start relative z-10 mb-4">
                            {jobLogo && (
                                <div className="w-16 h-16 shrink-0 rounded-xl bg-white border border-slate-100 p-2 shadow-sm">
                                    <img src={jobLogo} alt={jobCompany} className="w-full h-full object-contain" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">{jobTitle}</h1>
                                <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-2">
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
                                    href={jobUrl || undefined}
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
                                    onClick={() => router.push(`/generate?link=${encodeURIComponent(jobUrl || '')}`)}
                                    className="w-full bg-white text-slate-900 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Briefcase className="w-4 h-4" />
                                    Tailor My CV
                                </button>

                                <button
                                    onClick={() => router.push(`/interview/practice?title=${encodeURIComponent(jobTitle || '')}&link=${encodeURIComponent(jobUrl || '')}`)}
                                    className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all flex items-center justify-center gap-2 border border-slate-700"
                                >
                                    <Mic className="w-4 h-4" />
                                    Practice Interview
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Recruiter Contact - Auto Email */}
                {recruiterEmails.length > 0 && (
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />

                        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                            <Mail className="w-5 h-5" />
                            Email Recruiter
                        </h3>
                        <p className="text-blue-100 text-xs mb-4">
                            We found a direct contact! Beat the ATS by emailing them directly.
                        </p>

                        <div className="space-y-3">
                            {recruiterEmails.map((email, idx) => (
                                <a
                                    key={idx}
                                    href={`mailto:${email}?subject=${encodeURIComponent(`Application for ${jobTitle} - ${jobCompany}`)}&body=${encodeURIComponent(`Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${jobTitle} position at ${jobCompany}.\n\nWith my background in software development and my passion for building scalable solutions, I believe I would be a great fit for your team.\n\nI have attached my CV for your review.\n\nBest regards,\n[Your Name]`)}`}
                                    className="block w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-xl font-bold text-sm transition-all text-center backdrop-blur-sm"
                                >
                                    Email {email}
                                </a>
                            ))}
                            <p className="text-[10px] text-blue-200 text-center opacity-80">
                                Opens your default email app with a cover letter draft.
                            </p>
                        </div>
                    </div>
                )}

                {/* Apply External */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-2">Ready to Apply?</h3>
                    <p className="text-slate-500 text-xs mb-4">Once your CV is tailored, go to the official site.</p>

                    {directUrl && (
                        <div className="mb-3 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-xs font-medium flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Direct Link Found
                        </div>
                    )}

                    <a
                        href={directUrl || jobUrl || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${directUrl ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'}`}
                    >
                        {directUrl ? "Apply on Company Site" : `Apply on ${jobSource}`}
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>

    );
}

export default function JobViewPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
            <JobViewContent />
        </Suspense>
    );
}
