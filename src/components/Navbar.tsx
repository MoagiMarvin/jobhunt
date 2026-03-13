"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase, FileText, Search, User, FolderOpen, Building2, LogOut, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < 10) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY) {
                // Scrolling down - hide
                setIsVisible(false);
            } else {
                // Scrolling up - show
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        // Close menu on route change
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        // Real Supabase session check
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
            setRole(localStorage.getItem("mock_role") || "talent");
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setIsLoggedIn(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const talentLinks = [
        { href: "/profile", label: "Profile", icon: User },
        { href: "/search", label: "Job Search", icon: Search },
        { href: "/generate", label: "Generate CV", icon: FileText },
        { href: "/interview/practice", label: "Interview Coach", icon: Video },
    ];



    const links = isLoggedIn ? talentLinks : [];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem("mock_role");
        localStorage.removeItem("is_logged_in");
        setIsLoggedIn(false);
        setRole(null);
        router.push("/");
    };

    // Don't show Navbar on login/register pages at all, or on public profile routes
    const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
    const isAuthPage = currentPath === "/" || currentPath === "/register";
    const isPublicProfile = currentPath?.startsWith("/p/");

    if (isAuthPage || isPublicProfile) return null;

    // Fallback security check
    if (!isLoggedIn) return null;

    return (
        <>
            <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group shrink-0">
                            <svg viewBox="0 0 32 32" fill="none" className="w-9 h-9 md:w-11 md:h-11 shrink-0">
                                <path d="M7 24 L13 14" stroke="#0a66c2" strokeWidth="4.5" strokeLinecap="round" />
                                <path d="M14 24 L23 8" stroke="#0a66c2" strokeWidth="4.5" strokeLinecap="round" />
                            </svg>
                            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                Vitah
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-1">
                            {links.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href;

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                                            isActive
                                                ? "bg-blue-50 text-[#0a66c2]"
                                                : "text-slate-500 hover:text-[#0a66c2] hover:bg-blue-50/50"
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {link.label}
                                    </Link>
                                );
                            })}

                            {isLoggedIn && (
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all ml-4"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            )}
                        </div>

                        {/* Mobile - Logout Only on Top Header */}
                        <div className="lg:hidden flex items-center gap-2">
                            {isLoggedIn && (
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-all"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Premium Mobile Tab Bar (LinkedIn/Airbnb Style) - Independent of top nav */}
            <div className={cn(
                "lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 transition-all duration-500 ease-in-out transform shadow-[0_-4px_12px_rgba(0,0,0,0.03)] pb-[env(safe-area-inset-bottom)]",
                isVisible ? "translate-y-0" : "translate-y-full"
            )}>
                <div className="flex items-center justify-around h-[56px] px-2 max-w-md mx-auto">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors duration-300 relative",
                                    isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-slate-900 rounded-b-full shadow-[0_1px_2px_rgba(0,0,0,0.1)]" />
                                )}
                                <div className="p-0.5 transition-transform duration-300">
                                    <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5]" : "stroke-[2]")} />
                                </div>
                                <span className={cn(
                                    "text-[8px] font-bold tracking-tight transition-all",
                                    isActive ? "opacity-100" : "opacity-80"
                                )}>
                                    {link.label.split(' ')[0]}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
