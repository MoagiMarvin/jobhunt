"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    ArrowRight, 
    CheckCircle2, 
    Zap, 
    Users, 
    Sparkles, 
    Star,
    Globe,
    Search,
    ShieldCheck,
    HelpCircle,
    ChevronDown,
    Heart,
    ArrowDown,
    PenTool,
    Briefcase,
    ZapIcon,
    ArrowUpRight,
    MapPin,
    Building2,
    Calendar,
    Target
} from "lucide-react";

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-100 last:border-0">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left group"
            >
                <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-[0.1em]">{question}</span>
                <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform duration-500 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-60 pb-6' : 'max-h-0'}`}>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    {answer}
                </p>
            </div>
        </div>
    );
};

export default function LandingPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            sessionStorage.setItem('job_search_query', searchQuery);
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
            {/* Standard Serifs for that high-end "Human" feel */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,900;1,900&display=swap');
                
                .font-serif-luxe {
                    font-family: 'Playfair Display', serif;
                }
                .font-serif-body {
                    font-family: 'Libre Baskerville', serif;
                }
                .soft-blur {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                }
                .animate-in {
                    animation: fadeIn 1s ease-out forwards;
                }
                .seamless-mask-bottom {
                    mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
                    -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
                }
                .seamless-mask-right {
                    mask-image: linear-gradient(to right, black 80%, transparent 100%);
                    -webkit-mask-image: linear-gradient(to right, black 80%, transparent 100%);
                }
                .image-glow {
                    position: relative;
                }
                .image-glow::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    box-shadow: inset 0 0 100px rgba(255, 255, 255, 0.2);
                    pointer-events: none;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Subtle Texture Grain Overlay for Hand-Crafted Feel */}
            <div className="fixed inset-0 pointer-events-none z-[200] opacity-[0.015] mix-blend-multiply">
                 <svg viewBox="0 0 200 200" className="w-full h-full">
                    <filter id="noise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noise)" />
                </svg>
            </div>

            {/* Navigation: Architectural & Clean - Dynamic Visibility for Cinematic Hero */}
            <nav className={`fixed top-0 w-full z-[150] transition-all duration-700 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-100 py-4 shadow-sm' : 'bg-transparent py-10'}`}>
                <div className="max-w-7xl mx-auto px-10 flex items-center justify-between">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center p-2.5 shadow-2xl transition-all duration-500 ${scrolled ? 'bg-slate-900' : 'bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-blue-600'}`}>
                            <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                                <path d="M4 26 L12 12" stroke="white" strokeWidth="4" strokeLinecap="round" />
                                <path d="M13 26 L24 6" stroke="white" strokeWidth="4" strokeLinecap="round" />
                            </svg>
                        </div>
                        <span className={`text-2xl font-black tracking-tighter transition-colors duration-500 ${scrolled ? 'text-slate-900' : 'text-white'}`}>Vitah</span>
                    </div>
                    
                    <div className={`hidden lg:flex items-center gap-14 text-[10px] font-black uppercase tracking-[0.4em] transition-colors duration-500 ${scrolled ? 'text-slate-400' : 'text-white/60'}`}>
                        <Link href="#how-it-works" className={`transition-all hover:tracking-[0.6em] ${scrolled ? 'hover:text-slate-900' : 'hover:text-white'}`}>Advantage</Link>
                        <Link href="#stories" className={`transition-all hover:tracking-[0.6em] ${scrolled ? 'hover:text-slate-900' : 'hover:text-white'}`}>Success</Link>
                        <Link href="/search" className={`transition-all hover:tracking-[0.6em] ${scrolled ? 'text-blue-600' : 'text-blue-400'}`}>Search</Link>
                    </div>

                    <div className="flex items-center gap-12">
                        <Link href="/login" className={`hidden md:block text-[10px] font-black uppercase tracking-[0.3em] transition-all ${scrolled ? 'text-slate-400 hover:text-slate-900' : 'text-white/60 hover:text-white'}`}>
                            Enter
                        </Link>
                        <Link 
                            href="/register" 
                            className={`text-[10px] font-black uppercase tracking-[0.3em] px-12 py-5 rounded-full transition-all active:scale-95 shadow-2xl ${scrolled ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-slate-900 hover:bg-blue-600 hover:text-white'}`}
                        >
                            Open Lab
                        </Link>
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero Overhaul: The "Visual First Impression" cinematic experience */}
                <section className="relative min-h-screen flex items-center justify-center px-10 overflow-hidden bg-slate-900">
                    {/* Cinematic Background Image */}
                    <div className="absolute inset-0 z-0">
                         <img 
                            src="/vitah-hero.png" 
                            alt="Professional Success" 
                            className="w-full h-full object-cover opacity-60 grayscale-[0.2] contrast-[1.1]"
                         />
                         {/* Seamless Overlays for depth and readability */}
                         <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-white" />
                         <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white to-transparent" />
                    </div>

                    <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-12 relative z-10 w-full animate-in">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white text-[10px] font-black tracking-[0.4em] uppercase shadow-2xl">
                                <ShieldCheck className="w-4 h-4 text-blue-400" />
                                Professional Recruitment Logic • International Access
                            </div>
                            
                            <h1 className="text-7xl md:text-[11.5rem] font-serif-luxe text-white leading-[0.8] tracking-tighter drop-shadow-2xl">
                                Excellence in <br />
                                <span className="text-blue-400 italic">Alignment.</span>
                            </h1>
                            
                            <p className="text-xl md:text-3xl text-white/80 max-w-4xl mx-auto leading-tight font-medium font-serif-body italic drop-shadow-lg">
                                "The first step to arriving is deciding exactly where you belong."
                            </p>
                        </div>

                        {/* Sector-Specific Entry Points: Floating Glass Style */}
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            {[
                                { name: "Information Technology", icon: <Zap className="w-4 h-4" /> },
                                { name: "Finance & Accounting", icon: <Building2 className="w-4 h-4" /> },
                                { name: "Engineering / Technical", icon: <PenTool className="w-4 h-4" /> }
                            ].map((sector, i) => (
                                <button key={i} className="flex items-center gap-4 px-10 py-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 hover:border-white/20 transition-all group">
                                    <div className="text-blue-400 group-hover:scale-110 transition-transform">{sector.icon}</div>
                                    <span className="text-[11px] font-black uppercase tracking-widest text-white/70 group-hover:text-white">{sector.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Search field: The "Command Center" - Centered and High-Impact */}
                        <form onSubmit={handleSearch} className="w-full max-w-5xl relative mt-8 group">
                             <div className="absolute -inset-4 bg-blue-600/20 rounded-[3rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                             <div className="relative flex flex-col md:flex-row p-5 bg-white rounded-[3rem] border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] items-center">
                                <div className="flex-1 flex items-center px-12 py-7 w-full border-r border-slate-50">
                                    <Search className="w-8 h-8 text-slate-400 mr-10" />
                                    <input 
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by role, company, or sector..."
                                        className="w-full outline-none text-slate-900 font-bold text-2xl placeholder:text-slate-200"
                                    />
                                </div>
                                <div className="flex items-center px-12 py-5 w-full md:w-auto text-slate-300 font-bold text-sm italic border-r border-slate-50 hidden md:flex">
                                    All of South Africa
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full md:w-auto bg-slate-900 text-white px-20 py-8 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-2xl active:scale-95 mt-4 md:mt-0"
                                >
                                    Find My Match
                                </button>
                             </div>
                        </form>

                        {/* Trust Bar: Minimal Authority */}
                        <div className="flex flex-wrap items-center justify-center gap-20 pt-16">
                             <div className="space-y-1 text-center">
                                <div className="text-4xl font-black text-white tracking-tighter">30+ Years</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Recruitment Logic</div>
                             </div>
                             <div className="w-px h-16 bg-white/10" />
                             <div className="space-y-1 text-center">
                                <div className="text-4xl font-black text-white tracking-tighter">95%</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Success Retention</div>
                             </div>
                             <div className="w-px h-16 bg-white/10" />
                             <div className="space-y-1 text-center">
                                <div className="text-4xl font-black text-white tracking-tighter">6 Suburbs</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Localized Focus</div>
                             </div>
                        </div>
                    </div>

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                        <ArrowDown className="w-6 h-6 text-slate-300" />
                    </div>
                </section>

                {/* Visceral Value Demo: The Recruitment Logic */}
                <section id="how-it-works" className="py-40 bg-slate-50/50 border-y border-slate-100 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-10">
                        <div className="grid lg:grid-cols-2 gap-32 items-center">
                            <div className="space-y-12 animate-in">
                                <div className="inline-flex items-center gap-4 text-[11px] font-black text-blue-600 uppercase tracking-[0.5em]">
                                    <div className="w-10 h-px bg-blue-600" />
                                    PRECISION LOGIC
                                </div>
                                <h2 className="text-5xl md:text-6xl font-serif-luxe text-slate-900 leading-tight">
                                    The science of <br />
                                    <span className="italic text-blue-600">Professional Evolution.</span>
                                </h2>
                                <p className="text-xl text-slate-500 font-medium leading-relaxed font-serif-body">
                                    Network Recruitment isn't about breadth; it's about depth. Vitah applies 30 years of recruitment logic to your DNA, ensuring a 98% match before you ever step into the room.
                                </p>
                                
                                <div className="space-y-12 pt-4">
                                    <div className="flex gap-10 group">
                                        <div className="w-16 h-16 rounded-[2rem] bg-white shadow-xl flex items-center justify-center text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                            <Target className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-bold text-slate-900">Contextual Mapping</h4>
                                            <p className="text-sm text-slate-400 mt-2 font-medium">We map your trajectory against the top-tier firm's cultural DNA.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-10 group">
                                        <div className="w-16 h-16 rounded-[2rem] bg-white shadow-xl flex items-center justify-center text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                            <Globe className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-bold text-slate-900">Direct Entry Access</h4>
                                            <p className="text-sm text-slate-400 mt-2 font-medium">Bypass the "Black Hole" of standard job boards. Direct line to Luno, Absa, and Discovery.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="relative">
                                {/* Visceral UI Snippet Demo */}
                                <div className="bg-white rounded-[3rem] p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100 space-y-8 animate-in">
                                     <div className="flex items-center justify-between">
                                         <div className="flex items-center gap-4">
                                             <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                                                 <Target className="w-6 h-6" />
                                             </div>
                                             <div>
                                                 <div className="text-sm font-black text-slate-900 uppercase tracking-widest">Match Score</div>
                                                 <div className="text-xs font-bold text-blue-600">Ultra High Alignment</div>
                                             </div>
                                         </div>
                                         <div className="text-4xl font-black text-slate-900 tracking-tighter">98%</div>
                                     </div>
                                     
                                     <div className="space-y-4">
                                         <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 italic font-serif-body text-slate-600 text-sm">
                                             "Based on your recent work at FirstRand, this role at Luno is a perfect strategic evolution for your career path."
                                         </div>
                                         <div className="flex gap-3">
                                             <div className="px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest">Fintech</div>
                                             <div className="px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest">Cape Town</div>
                                         </div>
                                     </div>
                                     
                                     <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                                         Tailor CV Now
                                     </button>
                                </div>
                                
                                {/* Floating Element for offset layout */}
                                <div className="absolute -bottom-10 -right-10 bg-blue-600 p-8 rounded-[2rem] text-white shadow-2xl hidden md:block">
                                     <Sparkles className="w-6 h-6 mb-3" />
                                     <div className="text-2xl font-black">500+</div>
                                     <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Jobs Analyzed Today</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Seamless Trust Section: High-End Human Connectivity */}
                <section className="py-20 bg-white overflow-hidden">
                    <div className="max-w-7xl mx-auto px-10">
                        <div className="grid lg:grid-cols-2 gap-32 items-center">
                             <div className="relative group animate-in">
                                 <div className="absolute -inset-10 bg-blue-50/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                 <div className="relative rounded-[4rem] overflow-hidden shadow-2xl h-[600px] border border-slate-50 image-glow">
                                     <img 
                                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200" 
                                        alt="High-End Professional Connection" 
                                        className="w-full h-full object-cover grayscale-[0.1] contrast-[1.05] seamless-mask-bottom"
                                     />
                                 </div>
                                 {/* Seamless Floating Badge */}
                                 <div className="absolute top-12 -right-12 bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-slate-100 w-64 space-y-4">
                                      <div className="flex items-center gap-3">
                                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live Community</span>
                                      </div>
                                      <div className="text-lg font-bold text-slate-900">12 Top-Tier Roles</div>
                                      <p className="text-[10px] text-slate-400 font-medium italic">"Found via Vitah Intelligence in the last 4 hours."</p>
                                 </div>
                             </div>

                             <div className="space-y-12">
                                <div className="inline-flex items-center gap-4 text-[11px] font-black text-blue-600 uppercase tracking-[0.5em]">
                                    <div className="w-10 h-px bg-blue-600" />
                                    BEYOND THE GRID
                                </div>
                                <h2 className="text-5xl md:text-7xl font-serif-luxe text-slate-900 leading-[0.9] tracking-tighter">
                                    Trust is <br />
                                    <span className="italic">engineered.</span>
                                </h2>
                                <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                                    We don't just show you jobs. We show you your future colleagues, the culture of the boardroom, and the energy of the workspace. 
                                </p>
                                <div className="pt-8 flex items-center gap-8">
                                    <div className="flex -space-x-4">
                                        {[1,2,3,4].map(i => (
                                            <img key={i} src={`https://i.pravatar.cc/100?u=${i+10}`} className="w-14 h-14 rounded-full border-4 border-white shadow-lg grayscale hover:grayscale-0 transition-all cursor-pointer" />
                                        ))}
                                    </div>
                                    <div className="text-sm font-black uppercase tracking-widest text-slate-300">
                                        Joined by 2.4k+ Pros
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials: Stories of Arrival */}
                <section id="stories" className="py-40 bg-white">
                    <div className="max-w-7xl mx-auto px-10">
                        <div className="max-w-3xl space-y-8 mb-24">
                            <h2 className="text-5xl font-serif-luxe text-slate-900 leading-tight">
                                They didn't just find a job. <br />
                                <span className="italic text-blue-600">They arrived.</span>
                            </h2>
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {[
                                { name: "Thabo M.", role: "Senior Engineer", company: "Discovery Limited", text: "Vitah moved me from 20 ignored apps to 3 tier-1 offers in the same week. The context match is real.", img: "https://i.pravatar.cc/150?u=thabo3" },
                                { name: "Lerato K.", role: "Product Lead", company: "Luno", text: "Finally, a platform that understands the nuance of the SA tech landscape. Vitah is miles ahead.", img: "https://i.pravatar.cc/150?u=lerato" },
                                { name: "Chris P.", role: "Design Director", company: "Absa", text: "The interview prep gave me the confidence to negotiate my worth. Vitah pays for itself instantly.", img: "https://i.pravatar.cc/150?u=chrisp" }
                            ].map((s, i) => (
                                <div key={i} className="space-y-8 p-10 rounded-[3rem] bg-white border border-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:-translate-y-2 transition-all duration-500">
                                    <div className="flex text-amber-400">
                                        {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                                    </div>
                                    <p className="text-xl font-serif-body italic text-slate-800 leading-relaxed">"{s.text}"</p>
                                    <div className="flex items-center gap-6 pt-6 border-t border-slate-50">
                                        <img src={s.img} className="w-14 h-14 rounded-2xl grayscale" alt={s.name} />
                                        <div>
                                            <div className="text-sm font-black text-slate-900 uppercase tracking-widest">{s.name}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.role} @ {s.company}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* The "Global Reach" Authority section */}
                <section className="py-40 bg-slate-900 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/10 blur-[150px]" />
                    <div className="max-w-7xl mx-auto px-10 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-32 items-center">
                            <div className="space-y-12">
                                <div className="inline-flex items-center gap-4 text-[11px] font-black text-blue-400 uppercase tracking-[0.5em]">
                                    <div className="w-10 h-px bg-blue-400" />
                                    NETWORK REACH
                                </div>
                                <h2 className="text-6xl font-serif-luxe leading-[0.85] tracking-tighter">
                                    A Global <br />
                                    <span className="italic text-blue-400">Foundation.</span>
                                </h2>
                                <p className="text-xl text-slate-400 font-medium leading-relaxed font-serif-body">
                                    Our logic spans 6 continents, but our focus is strictly local. We bring world-class recruitment standards to the heart of the South African economy.
                                </p>
                                <div className="grid grid-cols-2 gap-12 pt-8">
                                    <div className="space-y-2">
                                        <div className="text-4xl font-black text-white">400k+</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Data Points</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-4xl font-black text-white">100%</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">SA Compliance</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="relative">
                                 <div className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[500px] border border-white/10 group">
                                     <img 
                                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
                                        alt="Global Professional Network" 
                                        className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000"
                                     />
                                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                 </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final Professional CTA */}
                <section className="py-40 bg-white">
                    <div className="max-w-5xl mx-auto px-10 text-center space-y-20">
                         <div className="space-y-10 animate-in">
                            <h2 className="text-7xl md:text-[10rem] font-serif-luxe text-slate-900 leading-[0.82] tracking-tighter">
                                Join the <br />
                                <span className="italic text-blue-600">Talent Pool.</span>
                            </h2>
                            <p className="text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed font-serif-body">
                                Become part of the 5% who receive direct entry invites. Specialized for Finance, IT, and Engineering professionals.
                            </p>
                         </div>
                         
                         <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                             <Link 
                                href="/register" 
                                className="w-full md:w-auto px-20 py-10 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] rounded-full hover:bg-blue-600 transition-all shadow-[0_30px_60px_-15px_rgba(37,99,235,0.4)] active:scale-95"
                             >
                                Register Now
                             </Link>
                             <div className="flex items-center gap-4 text-left">
                                 <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                     <Users className="w-6 h-6" />
                                 </div>
                                 <div>
                                     <div className="text-sm font-black text-slate-900 uppercase">30 Years</div>
                                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Of Logic Applied</div>
                                 </div>
                             </div>
                         </div>
                    </div>
                </section>
            </main>

            <footer className="py-24 bg-white border-t border-slate-50">
                <div className="max-w-7xl mx-auto px-10">
                     <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                                <svg viewBox="0 0 32 32" fill="none" className="w-full h-full p-2">
                                    <path d="M4 26 L12 12" stroke="white" strokeWidth="4" strokeLinecap="round" />
                                    <path d="M13 26 L24 6" stroke="white" strokeWidth="4" strokeLinecap="round" />
                                </svg>
                            </div>
                            <span className="text-2xl font-black text-slate-900">Vitah</span>
                        </div>
                        <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                            <Link href="/privacy" className="hover:text-slate-900 transition-all">Privacy</Link>
                            <Link href="/terms" className="hover:text-slate-900 transition-all">Terms</Link>
                            <Link href="mailto:support@vitah.io" className="text-blue-600 hover:text-blue-700 transition-all">Support</Link>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-200">
                            © 2026 VITAH • BORN IN SOUTH AFRICA
                        </div>
                     </div>
                </div>
            </footer>
        </div>
    );
}
