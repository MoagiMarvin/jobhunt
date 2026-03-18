"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Search,
    Bookmark,
    Sparkles,
    User,
    Settings,
    LayoutDashboard,
    Briefcase,
    Mic2,
    MoreVertical,
    ChevronUp,
    LogOut,
    Menu,
    X,
    Shield,
    HelpCircle
} from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const navItems = [
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Saved Jobs', href: '/jobs/saved', icon: Bookmark },
    { name: 'AI Tailor', href: '/generate', icon: Sparkles },
    { name: 'Interview', href: '/interview/practice', icon: Mic2 },
    { name: 'Profile', href: '/profile', icon: User },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);
    const [userData, setUserData] = React.useState<{ name: string; avatar: string | null; role: 'talent' | 'recruiter' }>({
        name: "User Account",
        avatar: null,
        role: 'talent'
    });

    React.useEffect(() => {
        const fetchUserData = async (userId: string) => {
            // Try fetching from profiles (talent) first
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', userId)
                .single();

            if (profile) {
                setUserData({
                    name: profile.full_name || "User Account",
                    avatar: profile.avatar_url,
                    role: 'talent'
                });
                return;
            }

            // Fallback to recruiter_profiles
            const { data: recruiterProfile } = await supabase
                .from('recruiter_profiles')
                .select('full_name, company_name')
                .eq('user_id', userId)
                .single();

            if (recruiterProfile) {
                setUserData({
                    name: recruiterProfile.full_name || recruiterProfile.company_name || "Recruiter",
                    avatar: null,
                    role: 'recruiter'
                });
            }
        };

        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
            if (session?.user) {
                fetchUserData(session.user.id);
            }
        };
        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
            if (session?.user) {
                fetchUserData(session.user.id);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        setIsMenuOpen(false);
        await supabase.auth.signOut();
        router.push("/");
    };

    const isAuthPage = pathname === "/" || pathname === "/register" || pathname === "/login";
    const isPublicProfile = pathname?.startsWith("/p/");
    const isPublicFeature = pathname?.startsWith("/search") || pathname?.startsWith("/jobs/view");

    if (isAuthPage || isPublicProfile) return null;
    
    // For non-logged in users on public features, show a simple header but no sidebar
    if (!isLoggedIn && isPublicFeature) {
        return (
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between z-50">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                        <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
                            <path d="M4 26 L12 12" stroke="white" strokeWidth="4" strokeLinecap="round" />
                            <path d="M13 26 L24 6" stroke="white" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span className="font-bold text-slate-900">Vitah</span>
                </Link>
                <Link href="/login" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                    Sign In
                </Link>
            </header>
        );
    }

    if (!isLoggedIn) return null;

    return (
        <>
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-50">
                <Link href="/" className="flex items-center gap-2 group">
                    <svg viewBox="0 0 32 32" fill="none" className="w-9 h-9 shrink-0">
                        <path d="M4 26 L12 12" stroke="#0a66c2" strokeWidth="4" strokeLinecap="round" />
                        <path d="M13 26 L24 6" stroke="#0a66c2" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    <span className="font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Vitah</span>
                </Link>
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            {/* Backdrop for Mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside className={`fixed md:sticky top-0 left-0 w-64 h-screen bg-white border-r border-slate-200 flex flex-col z-[70] transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="p-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <svg viewBox="0 0 32 32" fill="none" className="w-9 h-9 shrink-0">
                            <path d="M4 26 L12 12" stroke="#0a66c2" strokeWidth="4" strokeLinecap="round" />
                            <path d="M13 26 L24 6" stroke="#0a66c2" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                        <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                            Vitah
                        </span>
                    </Link>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="md:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive
                                    ? 'bg-blue-50 text-[#0a66c2]'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-[#0a66c2]' : 'text-slate-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100 relative">
                    {/* Profile Popup Menu */}
                    {isMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsMenuOpen(false)}
                            />
                            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 animate-in fade-in slide-in-from-bottom-2">
                                <Link
                                    href={userData.role === 'recruiter' ? '/recruiter/profile' : '/profile'}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors group"
                                >
                                    <User className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                                    My Profile
                                </Link>
                                <div className="py-2 border-b border-slate-100">
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            window.location.href = "mailto:support@vitah.io";
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                        Contact Support
                                    </button>
                                    <Link
                                        href="/settings"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </Link>
                                </div>
                                <div className="h-px bg-slate-100 my-1 mx-2" />
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </>
                    )}

                    {/* Profile Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 ${isMenuOpen ? 'bg-slate-100' : 'hover:bg-slate-50'
                            }`}
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#0a66c2] font-black shrink-0 overflow-hidden ring-2 ring-white shadow-sm">
                            {userData.avatar ? (
                                <img src={userData.avatar} alt={userData.name} className="w-full h-full object-cover" />
                            ) : (
                                userData.name[0]?.toUpperCase() || 'U'
                            )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{userData.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-wider">
                                {userData.role === 'recruiter' ? 'Recruiter' : 'Talent'}
                            </p>
                        </div>
                        <div className={`text-slate-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}>
                            <ChevronUp className="w-4 h-4" />
                        </div>
                    </button>
                </div>
            </aside>
        </>
    );
}
