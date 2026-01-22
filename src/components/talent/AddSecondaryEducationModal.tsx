"use client";

import { useState } from "react";
import { X, Save, School } from "lucide-react";

interface AddSecondaryEducationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: any) => void;
}

export default function AddSecondaryEducationModal({ isOpen, onClose, onAdd }: AddSecondaryEducationModalProps) {
    const [schoolName, setSchoolName] = useState("");
    const [completionYear, setCompletionYear] = useState(new Date().getFullYear());

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            schoolName,
            completionYear
        });
        setSchoolName("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Add Matric Details</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <School className="w-3.5 h-3.5" /> High School Name
                        </label>
                        <input
                            required
                            type="text"
                            value={schoolName}
                            onChange={e => setSchoolName(e.target.value)}
                            placeholder="e.g. Pretoria High School"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            Completion Year
                        </label>
                        <input
                            required
                            type="number"
                            value={completionYear}
                            onChange={e => setCompletionYear(parseInt(e.target.value))}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
