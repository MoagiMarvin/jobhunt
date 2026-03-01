import React, { useState } from "react";
import { X, Save, Sparkles, Loader2, CheckCircle2, AlertCircle, Wand2, Info } from "lucide-react";

interface MasterRevampModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { summary: string, experiences: any[], projects: any[] }) => void;
    currentData: {
        summary: string;
        experiences: any[];
        projects: any[];
        skills: { name: string }[];
    };
}

export default function MasterRevampModal({ isOpen, onClose, onSave, currentData }: MasterRevampModalProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [step, setStep] = useState<'initial' | 'drafting' | 'review'>('initial');
    const [revampedData, setRevampedData] = useState<any>(null);
    const [focus, setFocus] = useState("");

    const handleGenerate = async () => {
        setIsGenerating(true);
        setStep('drafting');
        try {
            const res = await fetch('/api/ai/revamp-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentData,
                    focus: focus || "professionalism and clarity"
                })
            });

            const data = await res.json();
            if (data.revamped) {
                setRevampedData(data.revamped);
                setStep('review');
            } else {
                throw new Error("No data returned");
            }
        } catch (error) {
            console.error("Revamp failed:", error);
            alert("Failed to generate optimization. Please try again.");
            setStep('initial');
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-blue-900 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                        <div className="p-1.5 bg-white/10 rounded-lg">
                            <Sparkles className="w-5 h-5 text-blue-200" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Profile Optimization</h2>
                            <p className="text-[10px] text-blue-100 uppercase font-bold tracking-wider">AI-Powered Professional Enhancement</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {step === 'initial' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4">
                                <div className="p-2 bg-blue-100 rounded-full h-fit">
                                    <Info className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-900 text-sm">How it works</h3>
                                    <p className="text-xs text-blue-700 leading-relaxed mt-1">
                                        Our AI analyzes your entire profile—skills, experience, and projects—to create a cohesive professional narrative. It will draft a new summary and optimize your bullet points for maximum impact.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700">What should we focus on?</label>
                                <textarea
                                    value={focus}
                                    onChange={(e) => setFocus(e.target.value)}
                                    placeholder="e.g. Focus on my React and Node.js skills, or make me sound more senior..."
                                    className="w-full h-32 px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 border-2 border-slate-50 rounded-xl bg-slate-50/50">
                                    <div className="text-blue-600 font-bold text-sm mb-1">1. Analyze</div>
                                    <p className="text-[10px] text-slate-500 font-medium tracking-tight">Scans all current profile data</p>
                                </div>
                                <div className="p-4 border-2 border-slate-50 rounded-xl bg-slate-50/50">
                                    <div className="text-blue-600 font-bold text-sm mb-1">2. Optimize</div>
                                    <p className="text-[10px] text-slate-500 font-medium tracking-tight">Refines language and tone</p>
                                </div>
                                <div className="p-4 border-2 border-slate-50 rounded-xl bg-slate-50/50">
                                    <div className="text-blue-600 font-bold text-sm mb-1">3. Review</div>
                                    <p className="text-[10px] text-slate-500 font-medium tracking-tight">You approve all changes</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'drafting' && (
                        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                                <Sparkles className="w-8 h-8 text-blue-600 absolute inset-0 m-auto animate-bounce" />
                            </div>
                            <h3 className="mt-6 font-bold text-slate-800 text-lg">Optimizing Your Profile</h3>
                            <p className="text-sm text-slate-500 mt-2">Crafting your professional narrative...</p>
                        </div>
                    )}

                    {step === 'review' && revampedData && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-100 w-fit">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Optimization Ready</span>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2 mb-2">
                                        Professional Summary
                                    </label>
                                    <p className="text-sm text-slate-700 leading-relaxed font-medium italic">"{revampedData.summary}"</p>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase">
                                        <Wand2 className="w-3.5 h-3.5 text-blue-600" /> Key Improvements made
                                    </h4>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <li className="flex items-start gap-2 text-xs text-slate-600 bg-blue-50/50 p-2 rounded-lg">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                                            Professional tone enhancement
                                        </li>
                                        <li className="flex items-start gap-2 text-xs text-slate-600 bg-blue-50/50 p-2 rounded-lg">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                                            Keyword optimization for ATS
                                        </li>
                                        <li className="flex items-start gap-2 text-xs text-slate-600 bg-blue-50/50 p-2 rounded-lg">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                                            Impact-driven bullet points
                                        </li>
                                        <li className="flex items-start gap-2 text-xs text-slate-600 bg-blue-50/50 p-2 rounded-lg">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                                            Cohesive brand narrative
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                    {step === 'review' ? (
                        <>
                            <button
                                onClick={() => setStep('initial')}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-all border border-slate-200"
                            >
                                Start Over
                            </button>
                            <button
                                onClick={() => {
                                    onSave(revampedData);
                                    onClose();
                                }}
                                className="flex-[2] py-3 px-4 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                Apply Optimization
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-all border border-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="flex-[2] py-3 px-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Sparkles className="w-5 h-5" />
                                )}
                                {isGenerating ? "Generating..." : "Optimize Profile"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
