"use client";

import { useState } from "react";
import { X, Save, Briefcase, Calendar, FileText } from "lucide-react";

interface AddExperienceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: any) => void;
}

export default function AddExperienceModal({ isOpen, onClose, onAdd }: AddExperienceModalProps) {
    const [formData, setFormData] = useState({
        role: "",
        company: "",
        duration: "",
        description: ""
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(formData);
        setFormData({ role: "", company: "", duration: "", description: "" });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        Add Work Experience
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Role */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Job Title / Role</label>
                        <input
                            required
                            type="text"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            placeholder="e.g. Software Developer Intern"
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                        />
                    </div>

                    {/* Company */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Company Name</label>
                        <input
                            required
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            placeholder="e.g. Tech Solutions SA"
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                        />
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            Duration / Period
                        </label>
                        <input
                            required
                            type="text"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            placeholder="e.g. Jan 2023 - Present"
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            Description / Key Achievements
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe your responsibilities and impact..."
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium resize-none"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-all border border-slate-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-3 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            Save Experience
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
