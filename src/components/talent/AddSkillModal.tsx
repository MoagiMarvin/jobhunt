"use client";

import { useState } from "react";
import { X, Save, Sparkles } from "lucide-react";

interface AddSkillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (skill: { name: string; category: "Technical" | "Professional" | "Soft" }) => void;
}

export default function AddSkillModal({ isOpen, onClose, onAdd }: AddSkillModalProps) {
    const [skill, setSkill] = useState("");
    const [category, setCategory] = useState<"Technical" | "Professional" | "Soft">("Technical");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-500 to-pink-600">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Add New Skill
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Skill Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as any)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all bg-white"
                        >
                            <option value="Technical">Technical (Hard Skills)</option>
                            <option value="Professional">Professional (Industry Knowledge)</option>
                            <option value="Soft">Soft Skills (Interpersonal)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Skill Name</label>
                        <input
                            type="text"
                            value={skill}
                            onChange={(e) => setSkill(e.target.value)}
                            placeholder="e.g. Python, Public Speaking, React"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            autoFocus
                        />
                    </div>
                    <p className="text-xs text-slate-500">
                        Add skills that recruiters look for. You don't need a certificate for every skill you have!
                    </p>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-all border border-slate-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (skill.trim()) {
                                onAdd({ name: skill.trim(), category });
                                setSkill("");
                            }
                        }}
                        disabled={!skill.trim()}
                        className="flex-2 py-3 px-8 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        Add Skill
                    </button>
                </div>
            </div>
        </div>
    );
}
