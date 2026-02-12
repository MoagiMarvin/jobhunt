"use client";

import { useState } from "react";
import { X, Save, Sparkles, Wand2, Check, RotateCcw, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface MasterRevampModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (stepData: any) => void;
    currentData: {
        summary: string;
        experiences: any[];
        projects: any[];
        skills: any[];
    };
}

export default function MasterRevampModal({ isOpen, onClose, onSave, currentData }: MasterRevampModalProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [instructions, setInstructions] = useState("");
    const [selectedSections, setSelectedSections] = useState({
        summary: true,
        experiences: true,
        projects: true,
        skills: true
    });

    // Track which individual items are selected
    const [selectedItems, setSelectedItems] = useState<{
        experiences: Record<string, boolean>;
        projects: Record<string, boolean>;
    }>({ experiences: {}, projects: {} });

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const res = await fetch('/api/ai/revamp-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...currentData, instructions })
            });

            if (!res.ok) throw new Error("Analysis failed");

            const data = await res.json();
            setAnalysisResult(data);

            // Initialize selection state
            const initialExpState: Record<string, boolean> = {};
            data.revampedExperiences?.forEach((e: any) => initialExpState[e.id] = true);

            const initialProjState: Record<string, boolean> = {};
            data.revampedProjects?.forEach((p: any) => initialProjState[p.id] = true);

            setSelectedItems({
                experiences: initialExpState,
                projects: initialProjState
            });

        } catch (error) {
            console.error("Master Revamp Error:", error);
            alert("Failed to analyze profile. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleApply = () => {
        if (!analysisResult) return;

        const updates: any = {};

        if (selectedSections.summary && analysisResult.revampedSummary) {
            updates.summary = analysisResult.revampedSummary;
        }

        if (selectedSections.experiences && analysisResult.revampedExperiences) {
            updates.experiences = currentData.experiences.map(exp => {
                const revamp = analysisResult.revampedExperiences.find((r: any) => r.id === exp.id);
                // Only update if selected
                if (revamp && selectedItems.experiences[exp.id]) {
                    return { ...exp, description: revamp.description };
                }
                return exp;
            });
        }

        if (selectedSections.projects && analysisResult.revampedProjects) {
            updates.projects = currentData.projects.map(proj => {
                const revamp = analysisResult.revampedProjects.find((r: any) => r.id === proj.id);
                if (revamp && selectedItems.projects[proj.id]) {
                    return { ...proj, description: revamp.description };
                }
                return proj;
            });
        }

        if (selectedSections.skills && analysisResult.suggestedSkills) {
            // Logic to append suggestions to existing skills
            // Since skills structure is complex (id, name, etc), we might just append names
            // Here we return just the new names, parent component handles the merge
            updates.newSkills = analysisResult.suggestedSkills;
        }

        onSave(updates);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">AI Master Revamp</h2>
                            <p className="text-xs text-slate-500">Holistic profile optimization</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                    {!analysisResult ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6 relative">
                                <Sparkles className={`w-10 h-10 text-purple-500 ${isAnalyzing ? 'animate-pulse' : ''}`} />
                                {isAnalyzing && (
                                    <div className="absolute inset-0 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                {isAnalyzing ? "Analyzing Profile..." : "Ready to Revamp?"}
                            </h3>
                            <p className="text-slate-500 max-w-md mx-auto mb-6">
                                {isAnalyzing
                                    ? "Our AI is reviewing your experience, skills, and projects to suggest professional improvements."
                                    : "Let AI analyze your entire profile to improve your summary, sharpen your bullet points, and highlight your best skills."}
                            </p>
                            {!isAnalyzing && (
                                <div className="w-full max-w-lg space-y-4">
                                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                                            Custom Instructions (Optional)
                                        </label>
                                        <textarea
                                            value={instructions}
                                            onChange={(e) => setInstructions(e.target.value)}
                                            placeholder="E.g., 'Focus on leadership skills' or 'Make it sound more senior' or 'Emphasize technical expertise'..."
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                                            rows={3}
                                        />
                                        <p className="text-[10px] text-slate-400 mt-2">
                                            Tell the AI how you want your profile optimized
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleAnalyze}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-200 transition-all transform hover:scale-105"
                                    >
                                        <Wand2 className="w-5 h-5" />
                                        Start Analysis
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Summary Section */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        Summary
                                    </h3>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedSections.summary}
                                            onChange={(e) => setSelectedSections(prev => ({ ...prev, summary: e.target.checked }))}
                                            className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                                        />
                                        <span className="text-sm font-medium text-slate-600">Apply</span>
                                    </label>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-600 opacity-70">
                                        <div className="font-bold text-xs uppercase text-slate-400 mb-2">Original</div>
                                        {currentData.summary || "No summary"}
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-lg text-sm text-slate-800 border border-purple-100">
                                        <div className="font-bold text-xs uppercase text-purple-400 mb-2 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> AI Suggestion
                                        </div>
                                        {analysisResult.revampedSummary}
                                    </div>
                                </div>
                            </div>

                            {/* Experience Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-slate-800 text-lg">Experience</h3>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedSections.experiences}
                                            onChange={(e) => setSelectedSections(prev => ({ ...prev, experiences: e.target.checked }))}
                                            className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                                        />
                                        <span className="text-sm font-medium text-slate-600">Apply All</span>
                                    </label>
                                </div>
                                {analysisResult.revampedExperiences?.map((exp: any, idx: number) => {
                                    const original = currentData.experiences.find(e => e.id === exp.id);
                                    if (!original) return null;
                                    return (
                                        <div key={idx} className={`bg-white rounded-xl border p-6 transition-all ${selectedItems.experiences[exp.id] ? 'border-purple-200 shadow-sm' : 'border-slate-200 opacity-60'}`}>
                                            <div className="flex justify-between mb-4">
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{original.role}</h4>
                                                    <p className="text-sm text-slate-500">{original.company}</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={!!selectedItems.experiences[exp.id]}
                                                    onChange={(e) => setSelectedItems(prev => ({
                                                        ...prev,
                                                        experiences: { ...prev.experiences, [exp.id]: e.target.checked }
                                                    }))}
                                                    className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                                                />
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="text-xs text-slate-500 whitespace-pre-line p-3 bg-slate-50 rounded">
                                                    {original.description}
                                                </div>
                                                <div className="text-xs text-slate-800 whitespace-pre-line p-3 bg-purple-50/50 rounded border border-purple-100">
                                                    {exp.description}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Projects Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-slate-800 text-lg">Projects</h3>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedSections.projects}
                                            onChange={(e) => setSelectedSections(prev => ({ ...prev, projects: e.target.checked }))}
                                            className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                                        />
                                        <span className="text-sm font-medium text-slate-600">Apply All</span>
                                    </label>
                                </div>
                                {analysisResult.revampedProjects?.map((proj: any, idx: number) => {
                                    const original = currentData.projects.find(p => p.id === proj.id);
                                    if (!original) return null;
                                    return (
                                        <div key={idx} className={`bg-white rounded-xl border p-6 transition-all ${selectedItems.projects[proj.id] ? 'border-purple-200 shadow-sm' : 'border-slate-200 opacity-60'}`}>
                                            <div className="flex justify-between mb-4">
                                                <h4 className="font-bold text-slate-900">{original.title}</h4>
                                                <input
                                                    type="checkbox"
                                                    checked={!!selectedItems.projects[proj.id]}
                                                    onChange={(e) => setSelectedItems(prev => ({
                                                        ...prev,
                                                        projects: { ...prev.projects, [proj.id]: e.target.checked }
                                                    }))}
                                                    className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                                                />
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="text-xs text-slate-500 whitespace-pre-line p-3 bg-slate-50 rounded">
                                                    {original.description}
                                                </div>
                                                <div className="text-xs text-slate-800 whitespace-pre-line p-3 bg-purple-50/50 rounded border border-purple-100">
                                                    {proj.description}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
                    <button
                        onClick={onClose}
                        className="font-bold text-slate-500 hover:text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    {analysisResult && (
                        <button
                            onClick={handleApply}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-200 transition-all"
                        >
                            <Check className="w-5 h-5" />
                            Apply Selected Changes
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
