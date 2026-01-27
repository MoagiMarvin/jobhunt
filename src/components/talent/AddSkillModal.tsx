"use client";

import { useState, useEffect } from "react";
import { X, Save, Sparkles, Layers, MessageSquare, Plus, Trash2 } from "lucide-react";

export type TalentSkill = {
    name: string;
    minYears?: number;
    category?: string;
    description?: string;
    isSoftSkill?: boolean;
};

interface AddSkillModalProps {
    isOpen: boolean;
    initialMode?: "technical" | "soft";
    onClose: () => void;
    onAdd: (skills: TalentSkill[]) => void;
}

export default function AddSkillModal({ isOpen, initialMode = "technical", onClose, onAdd }: AddSkillModalProps) {
    const [mode, setMode] = useState<"technical" | "soft">(initialMode);

    // Synchronize mode when initialMode changes (e.g. when modal is reopened with a different button)
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
        }
    }, [isOpen, initialMode]);
    const [category, setCategory] = useState("");

    // Technical Skills Inventory (the "shopping list")
    const [tempSkills, setTempSkills] = useState<{ name: string; years: string }[]>([]);
    const [currentSkillName, setCurrentSkillName] = useState("");
    const [currentSkillYears, setCurrentSkillYears] = useState("");

    const [softSkillSentence, setSoftSkillSentence] = useState("");

    if (!isOpen) return null;

    const addSkillToTempList = () => {
        if (!currentSkillName.trim()) return;
        setTempSkills([...tempSkills, { name: currentSkillName.trim(), years: currentSkillYears }]);
        setCurrentSkillName("");
        setCurrentSkillYears("");
    };

    const removeSkillFromTempList = (index: number) => {
        setTempSkills(tempSkills.filter((_, i) => i !== index));
    };

    const handleFinalAdd = () => {
        if (mode === "technical") {
            if (tempSkills.length === 0 && !currentSkillName.trim()) return;

            let finalSkillsToSubmit = [...tempSkills];
            if (currentSkillName.trim()) {
                finalSkillsToSubmit.push({ name: currentSkillName.trim(), years: currentSkillYears });
            }

            const newSkills: TalentSkill[] = finalSkillsToSubmit.map(s => {
                const yrs = s.years ? Number(s.years) : 0;
                return {
                    name: s.name,
                    minYears: isNaN(yrs) ? 0 : yrs,
                    category: category.trim() || "Other Skills",
                    isSoftSkill: false
                };
            });

            onAdd(newSkills);
        } else {
            if (!softSkillSentence.trim()) return;

            const newSkill: TalentSkill = {
                name: softSkillSentence.trim(),
                description: softSkillSentence.trim(),
                isSoftSkill: true,
                category: "Soft Skills"
            };

            onAdd([newSkill]);
        }

        // Reset and close
        setCategory("");
        setTempSkills([]);
        setCurrentSkillName("");
        setCurrentSkillYears("");
        setSoftSkillSentence("");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        Add Skills
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Mode Toggle */}
                    <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                        <button
                            onClick={() => setMode("technical")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === "technical"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <Layers className="w-4 h-4" />
                            Technical Skill
                        </button>
                        <button
                            onClick={() => setMode("soft")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === "soft"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <MessageSquare className="w-4 h-4" />
                            Soft Skill
                        </button>
                    </div>

                    {mode === "technical" ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                            {/* Category Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Group Category</label>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="e.g. Programming Languages, Computer Literacy"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                                />
                            </div>

                            {/* Skills Builder */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Add Individual Skills</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={currentSkillName}
                                        onChange={(e) => setCurrentSkillName(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addSkillToTempList()}
                                        placeholder="Skill Name"
                                        className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                                    />
                                    <input
                                        type="number"
                                        value={currentSkillYears}
                                        onChange={(e) => setCurrentSkillYears(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addSkillToTempList()}
                                        placeholder="Yrs"
                                        className="w-20 px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                                    />
                                    <button
                                        onClick={addSkillToTempList}
                                        disabled={!currentSkillName.trim()}
                                        className="p-3 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors disabled:opacity-50"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Temp List Display */}
                                {tempSkills.length > 0 && (
                                    <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100">
                                        {tempSkills.map((s, i) => (
                                            <div key={i} className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm animate-in slide-in-from-top-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-700">{s.name}</span>
                                                    {s.years && (
                                                        <span className="text-[10px] text-blue-600 font-black bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase">
                                                            {s.years}Y
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removeSkillFromTempList(i)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Soft Skill / Professional Narrative</label>
                                <textarea
                                    value={softSkillSentence}
                                    onChange={(e) => setSoftSkillSentence(e.target.value)}
                                    placeholder="e.g. I am a proactive team leader who excels at Agile workflows and clear communication."
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium resize-none"
                                />
                                <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">Describe your methodology or approach. This adds a huge "human touch" to your profile.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-all border border-slate-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleFinalAdd}
                        disabled={mode === "technical" ? (tempSkills.length === 0 && !currentSkillName.trim()) : !softSkillSentence.trim()}
                        className="flex-[2] py-3 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-400/20 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none"
                    >
                        <Save className="w-5 h-5" />
                        Finish & Save
                    </button>
                </div>
            </div>
        </div>
    );
}
