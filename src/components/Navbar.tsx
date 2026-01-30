"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase, FileText, Search, User, FolderOpen, Building2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    ];

    const recruiterLinks = [
        { href: "/recruiter/profile", label: "Recruiter Profile", icon: Building2 },
        { href: "/recruiter/search", label: "Recruiter Portal", icon: Briefcase },
        { href: "/recruiter/groups", label: "Saved Candidates", icon: FolderOpen },
    ];

    const links = isLoggedIn
        ? (role === "talent" ? talentLinks : recruiterLinks)
        : [];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem("mock_role");
        localStorage.removeItem("is_logged_in");
        setIsLoggedIn(false);
        setRole(null);
        router.push("/");
    };

    // Don't show Navbar on login/register if not logged in
    const isAuthPage = pathname === "/" || pathname === "/register";
    if (!isLoggedIn && isAuthPage) return null;

    return (
        <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <Briefcase className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                            JOB<span className="text-blue-600">HUNT</span>
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
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                                            : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
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

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center gap-3">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all"
                        >
                            <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
                                <span className={cn("h-0.5 w-6 bg-current transition-all", isOpen && "rotate-45 translate-y-2")} />
                                <span className={cn("h-0.5 w-6 bg-current transition-all", isOpen && "opacity-0")} />
                                <span className={cn("h-0.5 w-6 bg-current transition-all", isOpen && "-rotate-45 -translate-y-2")} />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            <div className={cn(
                "lg:hidden fixed inset-0 top-[64px] md:top-[80px] bg-white z-40 transition-all duration-300 transform",
                isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
            )}>
                <div className="p-6 space-y-4">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-bold transition-all",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-xl shadow-blue-200"
                                        : "text-slate-600 bg-slate-50 hover:bg-slate-100"
                                )}
                            >
                                <div className={cn("p-2 rounded-lg", isActive ? "bg-white/20" : "bg-white text-blue-600")}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                {link.label}
                            </Link>
                        );
                    })}

                    {isLoggedIn && (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-all"
                        >
                            <div className="p-2 rounded-lg bg-white">
                                <LogOut className="w-5 h-5" />
                            </div>
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
