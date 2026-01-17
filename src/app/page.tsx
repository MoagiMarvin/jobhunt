"use client";

import Link from "next/link";
import {
    Briefcase,
    GraduationCap,
    BookOpen,
    Search,
    Zap,
    ShieldCheck,
    ArrowRight,
    TrendingUp,
    MapPin,
    Clock
} from "lucide-react";

export default function Home() {
    const categories = [
        {
            title: "Learnerships",
            count: "1,200+",
            icon: Zap,
            color: "blue",
            description: "Earn while you learn. Perfect for Grade 12 & TVET students.",
            href: "/search?query=learnership"
        },
        {
            title: "Graduate Programs",
            count: "450+",
            icon: GraduationCap,
            color: "indigo",
            description: "Start your career at SA's top corporate giants.",
            href: "/search?query=graduate"
        },
        {
            title: "Internships",
            count: "800+",
            icon: Briefcase,
            color: "purple",
            description: "Gain valuable work experience in your field of study.",
            href: "/search?query=internship"
        },
        {
            title: "Bursaries",
            count: "300+",
            icon: BookOpen,
            color: "emerald",
            description: "Full funding for your university or college studies.",
            href: "/search?query=bursary"
        }
    ];

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden bg-slate-50">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-blue-50 rounded-full blur-3xl opacity-50 mt-10" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-6">
                            <TrendingUp className="w-3 h-3" />
                            <span>OVER 5,000+ NEW JOBS DISCOVERED THIS WEEK</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-6">
                            The Cleaner Way to Find <span className="text-blue-600">Your First Job.</span>
                        </h1>

                        <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                            We use a powerful discovery engine to scan every career portal in South Africa,
                            delivering thousands of Learnerships, Bursaries, and Internships in one clean,
                            pro-level interface.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/search"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                            >
                                <Search className="w-5 h-5" />
                                Explore All Opportunities
                            </Link>
                            <Link
                                href="/generate"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 font-bold rounded-xl hover:border-blue-600 transition-all"
                            >
                                Create AI-Optimized CV
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>

                        <div className="mt-12 flex items-center gap-8 border-t border-slate-200 pt-8">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Scanned & Verified</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-500" />
                                <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Live Discovery Updates</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Discover by Category</h2>
                    <p className="text-slate-500">Pick a pathway to start your career journey today.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat) => (
                        <Link
                            key={cat.title}
                            href={cat.href}
                            className="group p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-50/50 transition-all cursor-pointer relative overflow-hidden"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-${cat.color}-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <cat.icon className={`w-7 h-7 text-${cat.color}-600`} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{cat.title}</h3>
                            <p className="text-sm text-slate-500 mb-6">{cat.description}</p>
                            <div className="flex items-center justify-between mt-auto">
                                <span className={`text-${cat.color}-600 font-black text-sm uppercase tracking-wider`}>
                                    {cat.count} listings
                                </span>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Why JobHunt Section */}
            <section className="py-24 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-20">
                    <div className="flex-1">
                        <h2 className="text-4xl font-extrabold mb-8 leading-tight">
                            Bigger Volume.<br />
                            <span className="text-blue-500 tracking-tight italic">Cleaner Experience.</span>
                        </h2>
                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                                    <Zap className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Live Discovery Engine</h4>
                                    <p className="text-slate-400 text-sm">We crawl all major SA career portals in real-time. No more waiting for "manual" posts.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Scam-Free Listings</h4>
                                    <p className="text-slate-400 text-sm">Only verified corporate and government portals. No "pay for interview" scams.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                                    <TrendUp className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">One-Click AI Optimization</h4>
                                    <p className="text-slate-400 text-sm">Found a job? Our AI builds a tailored CV for that exact listing instantly.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 blur-[80px] opacity-20 -z-10" />
                            <div className="bg-slate-800 p-8 rounded-[40px] border border-slate-700 shadow-2xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                </div>
                                <div className="space-y-4">
                                    <div className="h-6 w-32 bg-slate-700/50 rounded-lg animate-pulse" />
                                    <div className="h-10 w-full bg-slate-700 rounded-xl animate-pulse" />
                                    <div className="h-24 w-full bg-slate-700/30 rounded-2xl animate-pulse" />
                                    <div className="flex gap-2">
                                        <div className="h-4 w-16 bg-blue-500/30 rounded-full" />
                                        <div className="h-4 w-20 bg-blue-500/30 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function TrendUp(props: any) {
    return <TrendingUp {...props} />;
}
