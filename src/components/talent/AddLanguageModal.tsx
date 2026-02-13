"use client";

import { useState, useEffect } from "react";
import { X, Save, Languages } from "lucide-react";

interface AddLanguageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (languageData: { id?: string; language: string; proficiency: string }) => Promise<void>;
    initialData?: { id: string; language: string; proficiency: string };
}

export default function AddLanguageModal({ isOpen, onClose, onAdd, initialData }: AddLanguageModalProps) {
    const [language, setLanguage] = useState("");
    const [proficiency, setProficiency] = useState("Fluent");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setLanguage(initialData.language);
                setProficiency(initialData.proficiency);
            } else {
                setLanguage("");
                setProficiency("Fluent");
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!language.trim()) return;
        setIsSaving(true);
        try {
            await onAdd({
                id: initialData?.id,
                language: language.trim(),
                proficiency,
            });
            onClose();
        } catch (error) {
            console.error("Error saving language:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const proficiencies = ["Native", "Fluent", "Intermediate", "Basic"];

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 max-h-[95vh] flex flex-col">
                {/* Mobile Grab Handle */}
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Languages className="w-5 h-5 text-blue-600" />
                        {initialData ? "Edit" : "Add"} Language
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Language</label>
                        <input
                            type="text"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            placeholder="e.g. English, French, Swahili"
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-sm"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proficiency Level</label>
                        <div className="grid grid-cols-2 gap-2">
                            {proficiencies.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setProficiency(p)}
                                    className={`py-3 px-4 rounded-xl border-2 transition-all text-sm font-bold ${proficiency === p
                                            ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm"
                                            : "border-slate-100 hover:border-slate-200 text-slate-600"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-all border border-slate-200 text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!language.trim() || isSaving}
                        className="flex-[2] py-3 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-400/20 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none text-sm"
                    >
                        <Save className="w-5 h-5" />
                        {isSaving ? "Saving..." : "Save Language"}
                    </button>
                </div>
            </div>
        </div>
    );
}
