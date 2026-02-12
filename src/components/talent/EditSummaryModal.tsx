"use client";

import { useState, useEffect } from "react";
import { X, Save, FileText, Sparkles, Wand2 } from "lucide-react";

interface EditSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (summary: string) => void;
    initialSummary: string;
}

export default function EditSummaryModal({ isOpen, onClose, onSave, initialSummary }: EditSummaryModalProps) {
    const [summary, setSummary] = useState(initialSummary);
    const [isRevamping, setIsRevamping] = useState(false);
    const [showRevampInput, setShowRevampInput] = useState(false);
    const [revampInstructions, setRevampInstructions] = useState("");

    // Sync state when initialSummary changes or modal opens
    useEffect(() => {
        setSummary(initialSummary || "");
    }, [initialSummary, isOpen]);

    const handleRevamp = async () => {
        if (!summary) return;

        setIsRevamping(true);
        try {
            const res = await fetch('/api/ai/revamp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: summary,
                    goal: 'summary',
                    instructions: revampInstructions
                })
            });

            const data = await res.json();
            if (data.revampedText) {
                setSummary(data.revampedText);
                setShowRevampInput(false);
                setRevampInstructions("");
            }
        } catch (error) {
            console.error("Revamp failed:", error);
            alert("Failed to revamp summary. Please try again.");
        } finally {
            setIsRevamping(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 max-h-[95vh] sm:max-h-[85vh] flex flex-col">
                {/* Mobile Grab Handle */}
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <FileText className="w-4 h-4" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Edit Summary</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-6 overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Professional Summary
                                </label>
                                <p className="text-[10px] text-slate-400 font-medium italic">
                                    Write 2-4 sentences about your experience, key skills, and what value you bring to a role.
                                </p>
                                <textarea
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    placeholder="E.g. Passionate Computer Science graduate with a strong foundation in..."
                                    className="w-full h-48 px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none font-medium leading-relaxed text-slate-700 text-sm"
                                />

                                {/* AI Revamp Section */}
                                <div className="mt-2">
                                    {!showRevampInput ? (
                                        <button
                                            onClick={() => setShowRevampInput(true)}
                                            className="flex items-center gap-2 text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors px-3 py-2 bg-purple-50 rounded-lg border border-purple-100"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" />
                                            Rewrite with AI
                                        </button>
                                    ) : (
                                        <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 space-y-2 animate-in slide-in-from-top-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-bold text-purple-700 uppercase">
                                                    AI Instructions
                                                </label>
                                                <button
                                                    onClick={() => setShowRevampInput(false)}
                                                    className="text-slate-400 hover:text-slate-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={revampInstructions}
                                                    onChange={(e) => setRevampInstructions(e.target.value)}
                                                    placeholder="E.g. Make it sound more senior and focus on React..."
                                                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-500 outline-none"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleRevamp();
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={handleRevamp}
                                                    disabled={isRevamping}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-50 transition-all shadow-sm"
                                                >
                                                    {isRevamping ? (
                                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <Wand2 className="w-3 h-3" />
                                                    )}
                                                    Revamp
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all border border-slate-200 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onSave(summary);
                                onClose();
                            }}
                            className="flex-[2] py-3 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <Save className="w-5 h-5" />
                            Save Summary
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
