"use client";

import { useState } from "react";
import { X, Save, School, Plus, Trash2, Award } from "lucide-react";

interface AddSecondaryEducationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: any) => void;
}

export default function AddSecondaryEducationModal({ isOpen, onClose, onAdd }: AddSecondaryEducationModalProps) {
    const [schoolName, setSchoolName] = useState("");
    const [completionYear, setCompletionYear] = useState(new Date().getFullYear());
    const [distinctionsCount, setDistinctionsCount] = useState(0);
    const [subjects, setSubjects] = useState<{ subject: string; grade: string }[]>([]);
    const [newSubject, setNewSubject] = useState("");
    const [newGrade, setNewGrade] = useState("");

    if (!isOpen) return null;

    const handleAddSubject = () => {
        if (newSubject && newGrade) {
            setSubjects([...subjects, { subject: newSubject, grade: newGrade }]);
            setNewSubject("");
            setNewGrade("");
        }
    };

    const handleRemoveSubject = (idx: number) => {
        setSubjects(subjects.filter((_, i) => i !== idx));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            schoolName,
            completionYear,
            distinctionsCount,
            subjects
        });
        setSchoolName("");
        setSubjects([]);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Add Matric / High School</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <School className="w-3.5 h-3.5" /> School Name
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

                    <div className="grid grid-cols-2 gap-4">
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
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Award className="w-3.5 h-3.5" /> Distinctions
                            </label>
                            <input
                                type="number"
                                value={distinctionsCount}
                                onChange={e => setDistinctionsCount(parseInt(e.target.value))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                            />
                        </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Top Subjects & Grades</label>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Subject"
                                value={newSubject}
                                onChange={e => setNewSubject(e.target.value)}
                                className="flex-[2] px-3 py-2 rounded-lg border border-slate-200 text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Grade/Level"
                                value={newGrade}
                                onChange={e => setNewGrade(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                            />
                            <button
                                type="button"
                                onClick={handleAddSubject}
                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                            {subjects.map((sub, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-slate-700">{sub.subject}</span>
                                        <span className="text-[10px] px-2 py-0.5 bg-blue-600 text-white rounded-full font-black">{sub.grade}</span>
                                    </div>
                                    <button onClick={() => handleRemoveSubject(idx)} className="text-slate-400 hover:text-red-500">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
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
                            Save Matric
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
