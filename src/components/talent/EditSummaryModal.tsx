"use client";

import { useState, useEffect } from "react";
import { X, Save, FileText } from "lucide-react";

interface EditSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (summary: string) => void;
    initialSummary: string;
}

export default function EditSummaryModal({ isOpen, onClose, onSave, initialSummary }: EditSummaryModalProps) {
    const [summary, setSummary] = useState(initialSummary);

    // Sync state when initialSummary changes or modal opens
    useEffect(() => {
        setSummary(initialSummary || "");
    }, [initialSummary, isOpen]);

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
