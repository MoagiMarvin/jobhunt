"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Mail, Lock, Sparkles, Building2, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"talent" | "recruiter">("talent");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Mock session logic as requested
        localStorage.setItem("mock_role", role);
        localStorage.setItem("is_logged_in", "true");

        if (role === "talent") {
            router.push("/profile");
        } else {
            router.push("/recruiter/search");
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-xl mb-4">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Job<span className="text-blue-600">Hunt</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Simple Mock Login</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
                    {/* Role Toggle */}
                    <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
                        <button
                            onClick={() => setRole("talent")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all",
                                role === "talent"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-500"
                            )}
                        >
                            <User className="w-4 h-4" />
                            Talent
                        </button>
                        <button
                            onClick={() => setRole("recruiter")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all",
                                role === "recruiter"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-500"
                            )}
                        >
                            <Building2 className="w-4 h-4" />
                            Recruiter
                        </button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    placeholder="any@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password (Optional in Mock)</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <span>Login as {role === "talent" ? "Talent" : "Recruiter"}</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                        <p className="text-slate-500 text-sm">
                            Don't have an account?{" "}
                            <Link href="/register" className="text-blue-600 font-bold hover:underline">
                                Register
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
