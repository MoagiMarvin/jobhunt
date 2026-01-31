"use client";

import { useState, useEffect } from "react";
import { X, Save, School } from "lucide-react";

interface AddSecondaryEducationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: any) => void;
    initialData?: any;
}

export default function AddSecondaryEducationModal({ isOpen, onClose, onAdd, initialData }: AddSecondaryEducationModalProps) {
    const [schoolName, setSchoolName] = useState("");
    const [completionYear, setCompletionYear] = useState(new Date().getFullYear());

    useEffect(() => {
        if (initialData && isOpen) {
            setSchoolName(initialData.schoolName || "");
            setCompletionYear(initialData.completionYear || new Date().getFullYear());
        } else if (!isOpen) {
            setSchoolName("");
            setCompletionYear(new Date().getFullYear());
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            ...initialData,
            schoolName,
            completionYear,
            id: initialData?.id
        });
        setSchoolName("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 max-h-[95vh] sm:max-h-[85vh] flex flex-col">
                {/* Mobile Grab Handle */}
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-bold text-slate-900">{initialData ? "Edit" : "Add"} Matric Details</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col min-h-0 overflow-hidden">
                    <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
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
                    </div>

                    <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all border border-slate-200 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <Save className="w-4 h-4" />
                            {initialData ? "Update" : "Save"} Details
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
