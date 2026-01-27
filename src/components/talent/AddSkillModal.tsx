"use client";

import { useState, useEffect } from "react";
import { X, Save, Layers, MessageSquare, Plus } from "lucide-react";

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

    // Technical Skills Inventory
    const [tempSkills, setTempSkills] = useState<{ name: string; years: string }[]>([]);
    const [currentSkillName, setCurrentSkillName] = useState("");
    const [currentSkillYears, setCurrentSkillYears] = useState("");

    // Soft Skills Inventory
    const [tempSoftSkills, setTempSoftSkills] = useState<string[]>([]);
    const [currentSoftSkill, setCurrentSoftSkill] = useState("");

    if (!isOpen) return null;

    const addSkillToTempList = () => {
        if (!currentSkillName.trim()) return;
        setTempSkills([...tempSkills, { name: currentSkillName.trim(), years: currentSkillYears }]);
        setCurrentSkillName("");
        setCurrentSkillYears("");
    };

    const addSoftSkillToTempList = () => {
        if (!currentSoftSkill.trim()) return;
        setTempSoftSkills([...tempSoftSkills, currentSoftSkill.trim()]);
        setCurrentSoftSkill("");
    };

    const removeSkillFromTempList = (index: number) => {
        setTempSkills(tempSkills.filter((_, i) => i !== index));
    };

    const removeSoftSkillFromTempList = (index: number) => {
        setTempSoftSkills(tempSoftSkills.filter((_, i) => i !== index));
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
            if (tempSoftSkills.length === 0 && !currentSoftSkill.trim()) return;

            let finalSoftSkillsToSubmit = [...tempSoftSkills];
            if (currentSoftSkill.trim()) {
                finalSoftSkillsToSubmit.push(currentSoftSkill.trim());
            }

            const newSkills: TalentSkill[] = finalSoftSkillsToSubmit.map(s => ({
                name: s,
                description: s,
                isSoftSkill: true,
                category: "Soft Skills"
            }));

            onAdd(newSkills);
        }

        // Reset and close
        setCategory("");
        setTempSkills([]);
        setCurrentSkillName("");
        setCurrentSkillYears("");
        setTempSoftSkills([]);
        setCurrentSoftSkill("");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        {mode === "technical" ? (
                            <Layers className="w-5 h-5 text-blue-600" />
                        ) : (
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                        )}
                        {mode === "technical" ? "Add Technical Skills" : "Add Soft Skills"}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">

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
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Soft Skill / Personal Strength</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={currentSoftSkill}
                                        onChange={(e) => setCurrentSoftSkill(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addSoftSkillToTempList()}
                                        placeholder="e.g. I am a leader"
                                        className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                                    />
                                    <button
                                        onClick={addSoftSkillToTempList}
                                        disabled={!currentSoftSkill.trim()}
                                        className="p-3 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors disabled:opacity-50"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed pl-1">Press Enter to add multiple soft skills.</p>

                                {/* Temp Soft Skills List */}
                                {tempSoftSkills.length > 0 && (
                                    <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100 mt-4">
                                        {tempSoftSkills.map((s, i) => (
                                            <div key={i} className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm animate-in slide-in-from-top-1">
                                                <span className="text-sm font-bold text-slate-700">{s}</span>
                                                <button
                                                    onClick={() => removeSoftSkillFromTempList(i)}
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
                        disabled={mode === "technical" ? (tempSkills.length === 0 && !currentSkillName.trim()) : (tempSoftSkills.length === 0 && !currentSoftSkill.trim())}
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
