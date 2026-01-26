"use client";

import { useState } from "react";
import { X, Save, Sparkles } from "lucide-react";



export type TalentSkill = {
    name: string;
    minYears?: number;
};

interface AddSkillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (skill: TalentSkill) => void;
}

export default function AddSkillModal({ isOpen, onClose, onAdd }: AddSkillModalProps) {
    const [skillName, setSkillName] = useState("");
    const [minYears, setMinYears] = useState<string>("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        Add New Skill
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Skill Name</label>
                            <input
                                type="text"
                                value={skillName}
                                onChange={(e) => setSkillName(e.target.value)}
                                placeholder="e.g. Python, Public Speaking, React"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-1">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                    Min Experience (years)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    step={0.5}
                                    value={minYears}
                                    onChange={(e) => setMinYears(e.target.value)}
                                    placeholder="e.g. 1, 2, 5"
                                    className="w-full px-3 py-2 rounded-lg border-2 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                                />
                            </div>
                        </div>

                        <p className="text-xs text-slate-500">
                            Add skills with realistic experience levels. This helps match you to the right roles.
                        </p>
                    </div>
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
                            if (skillName.trim()) {
                                const years = minYears ? Number(minYears) : undefined;
                                onAdd({
                                    name: skillName.trim(),
                                    minYears: isNaN(Number(years)) ? undefined : years,
                                });
                                setSkillName("");
                                setMinYears("");
                            }
                        }}
                        disabled={!skillName.trim()}
                        className="flex-2 py-3 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        Add Skill
                    </button>
                </div>
            </div>
        </div>
    );
}
