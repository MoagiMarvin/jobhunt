"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Briefcase, Mail, Lock, Building2, User, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"talent" | "recruiter">("talent");
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Auto-redirect if already logged in (LinkedIn Style)
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const savedRole = localStorage.getItem("mock_role") || "talent";
                if (savedRole === "talent") {
                    router.push("/profile");
                } else {
                    router.push("/recruiter/search");
                }
            } else {
                setIsCheckingSession(false);
            }
        };
        checkSession();
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!url || !key) {
            setError("Configuration Error: Missing API Keys.");
            setIsLoading(false);
            return;
        }

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            if (!data.session) {
                throw new Error("No session created. Please check your inbox to confirm your email.");
            }

            // Sync legacy logic
            localStorage.setItem("mock_role", role);
            localStorage.setItem("is_logged_in", "true");

            if (role === "talent") {
                router.push("/profile");
            } else {
                router.push("/recruiter/search");
            }
        } catch (err: any) {
            console.error("Login catch error:", err);
            let message = err.message || "Failed to login.";
            if (message.includes("Email not confirmed")) {
                message = "Please confirm your email address. Check your inbox.";
            }
            if (message === "Invalid login credentials") {
                message = "Invalid email or password.";
            }
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isCheckingSession) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-xl flex items-center justify-center animate-pulse">
                    <Briefcase className="w-8 h-8 text-blue-600" />
                </div>
                <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mx-auto"></div>
                    <div className="h-3 w-24 bg-slate-100 rounded animate-pulse mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-slate-50">
            {/* Premium Light Background Pattern */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Brand Header */}
                <div className="text-center mb-10 space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 mb-4 group ring-1 ring-slate-100">
                        <Briefcase className="w-8 h-8 text-blue-600 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-slate-500 text-sm mt-2">Sign in to your professional dashboard</p>
                    </div>
                </div>

                {/* Premium White Card */}
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-8 ring-1 ring-slate-100">

                    {/* Role Toggle */}
                    <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100/80 border border-slate-200 rounded-xl mb-8">
                        <button
                            onClick={() => setRole("talent")}
                            className={cn(
                                "flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                                role === "talent"
                                    ? "bg-white text-blue-600 shadow-sm border border-slate-200 ring-1 ring-slate-200/50"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                            )}
                        >
                            <User className="w-4 h-4" />
                            Talent
                        </button>
                        <button
                            onClick={() => setRole("recruiter")}
                            className={cn(
                                "flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                                role === "recruiter"
                                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200 ring-1 ring-slate-200/50"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                            )}
                        >
                            <Building2 className="w-4 h-4" />
                            Recruiter
                        </button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                                <a href="#" className="text-xs text-blue-600 hover:text-blue-500 transition-colors font-medium">Forgot password?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 group relative overflow-hidden mt-2",
                                "bg-slate-900 hover:bg-slate-800 border border-transparent shadow-slate-900/20",
                                isLoading && "opacity-80 cursor-wait"
                            )}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-slate-500 text-sm">
                            Don't have an account?{" "}
                            <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-500 transition-colors hover:underline decoration-blue-500/30 underline-offset-4">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
