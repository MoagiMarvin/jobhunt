"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, FileText, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const pathname = usePathname();

    const links = [
        { href: "/profile", label: "Profile", icon: User },
        { href: "/search", label: "Job Search", icon: Search },
        { href: "/generate", label: "Generate CV", icon: FileText },
    ];

    return (
        <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-accent" />
                        <span className="text-xl font-bold text-primary">
                            Job<span className="text-secondary">Hunt</span>
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
                                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                                            : "text-slate-600 hover:text-primary hover:bg-slate-100"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}
