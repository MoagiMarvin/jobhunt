"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Briefcase, ExternalLink, Loader2, AlertCircle, Copy, Check, X, FileText, Globe } from "lucide-react";

const INDUSTRIES = ['All', 'IT & Tech', 'Finance & Accounting', 'Medical & Health', 'Retail & Sales', 'Engineering & Industrial', 'Legal & Admin', 'Logistics & Transport'];
const LEVELS = ['All', 'Internship', 'Graduate', 'Learnership', 'Bursary', 'Entry Level', 'Full Time'];

export default function SearchPage() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [industry, setIndustry] = useState("All");
    const [level, setLevel] = useState("All");
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingSources, setLoadingSources] = useState<string[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setHasSearched(true);
        setJobs([]);

        // Sources we scan: PNet is immediate, others are background
        const allSources = ['pnet', 'discovery', 'linkedin', 'careers24', 'indeed'];
        setLoadingSources(allSources);

        try {
            // 1. Fetch PNet IMMEDIATELY (Primary Source)
            // Local Discovery Engine with Categorization
            const localUrl = `/api/search?query=${encodeURIComponent(query)}&source=local&industry=${industry}&level=${level}`;
            const pnetRes = await fetch(localUrl);
            const localData = await pnetRes.json();

            if (localData.jobs && localData.jobs.length > 0) {
                // Deduplicate initial local results just in case
                const uniqueLocal = localData.jobs.filter((job: any, index: number, self: any[]) =>
                    index === self.findIndex((t: any) => (t.id && t.id === job.id) || (t.link === job.link))
                );
                setJobs(uniqueLocal);
            }

            setLoading(false); // Stop main spinner as we have results
            setLoadingSources(prev => prev.filter(s => s !== 'pnet'));

            // 2. Fetch others in BACKGROUND
            const backgroundSources = ['pnet', 'discovery', 'linkedin', 'careers24', 'indeed'];

            backgroundSources.forEach(async (src) => {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 12000); // 12s safety timeout per board

                try {
                    const res = await fetch(`/api/search?query=${encodeURIComponent(query)}&source=${src}`, {
                        signal: controller.signal
                    });
                    const data = await res.json();

                    if (data.jobs && data.jobs.length > 0) {
                        setJobs(prev => {
                            // 1. Deduplicate the incoming jobs internally first
                            const incomingUnique = data.jobs.filter((job: any, index: number, self: any[]) =>
                                index === self.findIndex((t: any) => (t.id && t.id === job.id) || (t.link === job.link))
                            );

                            // 2. Filter out jobs already in the existing state
                            const newJobs = incomingUnique.filter((nj: any) =>
                                !prev.some((pj: any) => (pj.id && nj.id && pj.id === nj.id) || (pj.link === nj.link))
                            );

                            return [...prev, ...newJobs];
                        });
                    }
                } catch (err) {
                    console.error(`[Search] Background source ${src} failed or timed out:`, err);
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
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Discovery Engine</h1>
                    <p className="text-slate-600">
                        Scanning 20+ career portals for the latest Learnerships, Bursaries, and Graduate roles.
                    </p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-6">
                    <div className="flex bg-white rounded-xl shadow-sm border-2 border-slate-200 focus-within:border-blue-500 transition-all overflow-hidden mb-4">
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

                    {/* Filter Bar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Industry / Role</label>
                            <select
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                className="w-full bg-white border-2 border-slate-100 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-500 transition-all cursor-pointer"
                            >
                                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Career Level</label>
                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                className="w-full bg-white border-2 border-slate-100 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-blue-500 transition-all cursor-pointer"
                            >
                                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>
                </form>

                {/* Loading Status Bar */}
                {hasSearched && loadingSources.length > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scanning:</span>
                        {['pnet', 'discovery', 'linkedin', 'careers24', 'indeed'].map(source => (
                            <div
                                key={source}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${loadingSources.includes(source)
                                    ? 'bg-blue-50 text-blue-500 border-blue-200 animate-pulse'
                                    : 'bg-green-50 text-green-600 border-green-200 opacity-60'
                                    }`}
                            >
                                {source === 'discovery' ? 'DISCOVERY ENGINE' : source.toUpperCase()}
                                {loadingSources.includes(source) ? '...' : ' ✓'}
                            </div>
                        ))}
                    </div>
                )}

                {/* Main Spinner (Only for first load) */}
                {loading && (
                    <div className="text-center py-20 bg-white/50 rounded-2xl border border-blue-100 mb-10">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">Starting Search Engines...</p>
                    </div>
                )}

                {/* Results Container */}
                <div className="space-y-4 mb-12">
                    {!loading && jobs.map((job) => (
                        <JobCard key={job.id || job.link} job={job} router={router} />
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

function JobDetailsModal({ job, onClose, onOptimize }: { job: any, onClose: () => void, onOptimize: () => void }) {
    const [scrapedData, setScrapedData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (scrapedData || !job.link) return;

            setLoading(true);
            try {
                const res = await fetch(`/api/scrape-job?url=${encodeURIComponent(job.link)}`);
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                setScrapedData(data);
            } catch (err: any) {
                console.error("Failed to fetch job details:", err);
                setError("Could not extract details automatically. The site might be blocking us.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [job.link, scrapedData]);

    if (!job) return null;

    const displaySalary = job.salary || scrapedData?.salary;
    const requirements = scrapedData?.requirements || (job.description ? [job.description] : []);
    const duties = scrapedData?.duties || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase border ${job.source === 'PNet' ? 'bg-red-50 text-red-600 border-red-100' :
                                job.source === 'Careers24' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                {job.source}
                            </span>
                            {displaySalary && (
                                <span className="px-2 py-0.5 text-[9px] font-bold rounded uppercase border bg-green-50 text-green-600 border-green-100 flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />
                                    {displaySalary}
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight mb-2">{job.title}</h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                            <span className="font-bold text-blue-600">{job.company}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar bg-white">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                            <p className="text-sm font-medium">Extracting Requirements & Duties...</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Summary/Description */}
                            {scrapedData?.summary && (
                                <div>
                                    <h4 className="text-slate-900 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                                        <FileText className="w-4 h-4 text-blue-500" />
                                        Role Overview
                                    </h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">{scrapedData.summary}</p>
                                </div>
                            )}

                            {/* Duties */}
                            {duties.length > 0 && (
                                <div>
                                    <h4 className="text-slate-900 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                                        <Briefcase className="w-4 h-4 text-emerald-500" />
                                        Responsibilities & Duties
                                    </h4>
                                    <ul className="space-y-2">
                                        {duties.map((duty: string, idx: number) => (
                                            <li key={idx} className={`text-sm ${duty.startsWith('---') ? 'font-bold text-slate-800 mt-4' : 'text-slate-600 pl-4 border-l-2 border-emerald-100'}`}>
                                                {duty.startsWith('---') ? duty.replace(/---/g, '').trim() : duty}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Requirements */}
                            {requirements.length > 0 && (
                                <div>
                                    <h4 className="text-slate-900 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                                        <Check className="w-4 h-4 text-blue-500" />
                                        Requirements & Qualifications
                                    </h4>
                                    <ul className="space-y-2">
                                        {requirements.map((req: string, idx: number) => (
                                            <li key={idx} className={`text-sm ${req.startsWith('---') ? 'font-bold text-slate-800 mt-4' : 'text-slate-600 pl-4 border-l-2 border-blue-100'}`}>
                                                {req.startsWith('---') ? req.replace(/---/g, '').trim() : req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {error && (
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 items-start">
                                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-amber-900 mb-1">Extraction Notice</p>
                                        <p className="text-xs text-amber-700 leading-relaxed">{error}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50">
                    <a
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 hover:bg-slate-50 text-sm font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <Globe className="w-4 h-4" />
                        Apply on {job.source}
                    </a>
                    <button
                        onClick={onOptimize}
                        className="flex-[1.5] px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 text-sm font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <Briefcase className="w-4 h-4" />
                        Optimize CV for this Job
                    </button>
                </div>
            </div>
        </div>
    );
}

function JobCard({ job, router }: { job: any; router: any }) {
    const [copied, setCopied] = useState(false);
    const [showModal, setShowModal] = useState(false);

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
        <>
            <div className="p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-300 hover:shadow-xl transition-all group relative overflow-hidden cursor-pointer"
                onClick={() => setShowModal(true)}>
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                            {job.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${job.source === 'PNet' ? 'bg-red-50 text-red-600 border-red-100' :
                                job.source === 'Careers24' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    job.source.toLowerCase().includes('discovery') ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm' :
                                        'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                {job.source}
                            </span>
                            {job.salary && (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase border bg-green-50 text-green-600 border-green-100">
                                    {job.salary}
                                </span>
                            )}
                            {job.metadata?.industry && (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase border bg-slate-100 text-slate-600 border-slate-200">
                                    {job.metadata.industry}
                                </span>
                            )}
                            {job.metadata?.level && (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase border bg-blue-50 text-blue-600 border-blue-100">
                                    {job.metadata.level}
                                </span>
                            )}
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
                        onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <FileText className="w-4 h-4" />
                        View Requirements
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleCopyLink(); }}
                        className="flex-1 px-4 py-2.5 rounded-lg border-2 border-slate-100 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Link Copied!" : "Copy Link"}
                    </button>
                    <a
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-slate-100 text-slate-900 hover:bg-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <Globe className="w-4 h-4" />
                        Apply Direct
                    </a>
                </div>

                {/* Masked Indicator */}
                {job.title.includes('*') && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold rounded-full border border-amber-100">
                        <AlertCircle className="w-3 h-3" />
                        MASKED DATA
                    </div>
                )}
            </div>

            {showModal && (
                <JobDetailsModal
                    job={job}
                    onClose={() => setShowModal(false)}
                    onOptimize={handleUseForCV}
                />
            )}
        </>
    );
}
