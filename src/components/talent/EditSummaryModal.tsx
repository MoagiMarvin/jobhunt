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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <FileText className="w-4 h-4" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Edit Professional Summary</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full p-1 hover:bg-slate-100 border border-transparent hover:border-slate-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                                Summary
                            </label>
                            <p className="text-xs text-slate-500">
                                Write 2-4 sentences about your experience, key skills, and what value you bring to a role.
                            </p>
                            <textarea
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                placeholder="E.g. Passionate Computer Science graduate with a strong foundation in..."
                                className="w-full h-48 px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none font-medium leading-relaxed text-slate-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-white hover:shadow-sm hover:border-slate-200 border border-transparent transition-all text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onSave(summary);
                            onClose();
                        }}
                        className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm"
                    >
                        <Save className="w-4 h-4" />
                        Save Summary
                    </button>
                </div>
            </div>
        </div>
    );
}
