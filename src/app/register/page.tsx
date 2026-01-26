"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Mail, Lock, User, ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
    const router = useRouter();
    const [role, setRole] = useState<"talent" | "recruiter">("talent");

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        // Just redirect to login after "registering"
        router.push("/");
    };

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-xl mb-4">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Register on <span className="text-blue-600">JobHunt</span>
                    </h1>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
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

                    <form onSubmit={handleRegister} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Full Name"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <span>Create Account</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                        <p className="text-slate-500 text-sm">
                            Already have an account?{" "}
                            <Link href="/" className="text-blue-600 font-bold hover:underline">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
