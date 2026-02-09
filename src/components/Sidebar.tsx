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
    LogOut
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

    React.useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
        };
        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const isAuthPage = pathname === "/" || pathname === "/register";
    const isPublicProfile = pathname?.startsWith("/p/");

    if (isAuthPage || isPublicProfile || !isLoggedIn) return null;

    return (
        <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0 left-0 z-[60]">
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-[#0a66c2] rounded-lg flex items-center justify-center group-hover:bg-[#004182] transition-colors">
                        <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        JobHunt
                    </span>
                </Link>
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
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-[#0a66c2]' : 'text-slate-400'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#0a66c2] font-bold">
                            U
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">User Account</p>
                            <p className="text-[10px] text-slate-500 truncate">Premium Member</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Link
                            href="/settings"
                            className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <Settings className="w-3.5 h-3.5" />
                            Settings
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 w-full py-2 bg-red-50 border border-red-100 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
