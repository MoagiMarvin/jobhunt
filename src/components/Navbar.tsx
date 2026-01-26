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
    const [role, setRole] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Real Supabase session check
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
            // In a real app, we'd fetch the role from the profile table.
            // For now, we still rely on the mock_role in localStorage for UI filtering
            // but we ONLY show links if there is a real session.
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
        <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-blue-600" />
                        <span className="text-xl font-bold text-slate-900">
                            Job<span className="text-blue-600">Hunt</span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                                            : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
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
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all ml-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
