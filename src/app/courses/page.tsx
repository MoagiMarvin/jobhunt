"use client";

import React, { useState } from "react";
import { 
    BookOpen, 
    Search, 
    Sparkles, 
    ShieldCheck, 
    Database, 
    Target, 
    ArrowUpRight,
    Zap,
    Clock,
    Award,
    ExternalLink
} from "lucide-react";
import Link from "next/link";

const COURSES = [
    {
        id: "ai-fundamentals",
        title: "AI Fundamentals & Ethics",
        provider: "NEMISA",
        category: "AI & Innovation",
        duration: "15 Hours",
        level: "Beginner",
        description: "Official government-backed certification covering AI literacy, machine learning basics, and ethical AI legislation in South Africa.",
        link: "https://www.nemisa.co.za",
        isFree: true,
        icon: <Sparkles className="w-5 h-5" />
    },
    {
        id: "digital-marketing",
        title: "Fundamentals of Digital Marketing",
        provider: "Google",
        category: "Digital Business",
        duration: "40 Hours",
        level: "Beginner",
        description: "Master the basics of digital marketing with a course accredited by Interactive Advertising Bureau Europe and The Open University.",
        link: "https://skillshop.exceedlms.com/student/collection/648385-digital-marketing",
        isFree: true,
        icon: <Target className="w-5 h-5" />
    },
    {
        id: "cybersecurity",
        title: "Cybersecurity Essentials",
        provider: "Cisco / NEMISA",
        category: "Security",
        duration: "30 Hours",
        level: "Intermediate",
        description: "Critical security skills for the modern workplace. Learn how to protect data and privacy in a digital-first economy.",
        link: "https://www.netacad.com",
        isFree: true,
        icon: <ShieldCheck className="w-5 h-5" />
    },
    {
        id: "data-analytics",
        title: "Data Analytics Professional",
        provider: "Google",
        category: "Data & Dev",
        duration: "6 Months",
        level: "Beginner",
        description: "Gain in-demand skills that will have you job-ready in less than six months. No degree or experience required.",
        link: "https://grow.google/certificates/data-analytics",
        isFree: true,
        icon: <Database className="w-5 h-5" />
    },
    {
        id: "career-readiness",
        title: "Job & Work Readiness",
        provider: "NEMISA",
        category: "Career",
        duration: "10 Hours",
        level: "Beginner",
        description: "Professional soft skills designed for the South African corporate environment. Includes professionalism and labor law basics.",
        link: "https://www.nemisa.co.za",
        isFree: true,
        icon: <BookOpen className="w-5 h-5" />
    },
    {
        id: "ai-fluency",
        title: "Digital Skills for Jobs: AI Fluency",
        provider: "Microsoft / DCDT",
        category: "AI & Innovation",
        duration: "20 Hours",
        level: "Beginner",
        description: "A transformative program to prepare youth for success in the evolving digital economy with Microsoft certifications.",
        link: "https://www.microsoft.com/en-za/digital-skills",
        isFree: true,
        icon: <Zap className="w-5 h-5" />
    }
];

const CATEGORIES = ["All", "AI & Innovation", "Digital Business", "Security", "Data & Dev", "Career"];

export default function CoursesPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCourses = COURSES.filter(course => {
        const matchesCategory = activeCategory === "All" || course.category === activeCategory;
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            course.provider.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* SEO/Font Styling - Matching Landing Page */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,900;1,900&display=swap');
                
                .font-serif-luxe { font-family: 'Playfair Display', serif; }
                .font-serif-body { font-family: 'Libre Baskerville', serif; }
            `}</style>

            {/* Hero Section */}
            <section className="bg-slate-900 text-white py-24 px-10 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-blue-600/10 blur-[120px] opacity-50" />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Career Intelligence</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-serif-luxe leading-tight tracking-tighter mb-6">
                        Future-Proof Your <br />
                        <span className="text-blue-400 italic">Trajectory.</span>
                    </h1>
                    
                    <p className="text-xl text-white/60 max-w-2xl font-serif-body italic leading-relaxed">
                        Curated certifications from world-class providers. Specialized for the South African professional landscape.
                    </p>
                </div>
            </section>

            {/* Filter & Search Bar */}
            <section className="max-w-7xl mx-auto px-10 -mt-10 relative z-20">
                <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 flex items-center bg-slate-50 rounded-2xl px-6 py-4 w-full">
                        <Search className="w-5 h-5 text-slate-400 mr-4" />
                        <input 
                            type="text"
                            placeholder="Search certifications (e.g. AI, Google)..."
                            className="bg-transparent outline-none w-full text-sm font-bold text-slate-900 placeholder:text-slate-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
                        {CATEGORIES.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    activeCategory === cat 
                                    ? 'bg-slate-900 text-white shadow-xl translate-y-[-2px]' 
                                    : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Course Grid */}
            <section className="max-w-7xl mx-auto px-10 py-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map((course) => (
                        <div 
                            key={course.id}
                            className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full hover:translate-y-[-8px]"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                                    {course.icon}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest">
                                        Free
                                    </span>
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                        {course.provider}
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {course.title}
                            </h3>
                            
                            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8 flex-1">
                                {course.description}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">{course.duration}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Award className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">{course.level}</span>
                                </div>
                            </div>

                            <a 
                                href={course.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-5 bg-slate-50 rounded-2xl flex items-center justify-center gap-3 group/btn hover:bg-slate-900 hover:text-white transition-all duration-500"
                            >
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Enroll Now</span>
                                <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                            </a>
                        </div>
                    ))}
                </div>

                {filteredCourses.length === 0 && (
                    <div className="text-center py-40">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">No courses found</h3>
                        <p className="text-slate-400">Try adjusting your search or filters.</p>
                    </div>
                )}
            </section>

            {/* Bottom CTA */}
            <section className="max-w-5xl mx-auto px-10 pt-20 text-center">
                <div className="p-16 rounded-[4rem] bg-blue-600 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-serif-luxe leading-tight mb-6">
                            Verified Your <br />
                            <span className="italic opacity-80">Skills Yet?</span>
                        </h2>
                        <p className="text-lg text-white/70 font-medium mb-10 max-w-xl mx-auto">
                            Complete these courses and add them to your Vitah profile to get a 5x boost in visibility to recruiters.
                        </p>
                        <Link 
                            href="/profile"
                            className="inline-flex items-center gap-4 px-12 py-6 bg-white text-blue-600 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all shadow-xl active:scale-95"
                        >
                            Update My Profile
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
