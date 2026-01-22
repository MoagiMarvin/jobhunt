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
        description: ""
    });
    const [startDate, setStartDate] = useState({ month: "January", year: new Date().getFullYear().toString() });
    const [endDate, setEndDate] = useState({ month: "January", year: new Date().getFullYear().toString() });
    const [isCurrent, setIsCurrent] = useState(true);

    if (!isOpen) return null;

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 40 }, (_, i) => (currentYear - i).toString());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const startStr = `${startDate.month.slice(0, 3)} ${startDate.year}`;
        const endStr = isCurrent ? "Present" : `${endDate.month.slice(0, 3)} ${endDate.year}`;

        onAdd({
            ...formData,
            duration: `${startStr} - ${endStr}`
        });
        setFormData({ role: "", company: "", description: "" });
        setIsCurrent(true);
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

                <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[85vh] overflow-y-auto">
                    {/* Role & Company */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Job Title</label>
                            <input
                                required
                                type="text"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                placeholder="e.g. Developer"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Company</label>
                            <input
                                required
                                type="text"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                placeholder="e.g. Google"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                            />
                        </div>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" /> Start Date
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <select
                                value={startDate.month}
                                onChange={(e) => setStartDate({ ...startDate, month: e.target.value })}
                                className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                            >
                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <select
                                value={startDate.year}
                                onChange={(e) => setStartDate({ ...startDate, year: e.target.value })}
                                className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* End Date */}
                    <div className={`space-y-3 p-4 rounded-xl border transition-all ${isCurrent ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-blue-600" /> End Date
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={isCurrent}
                                    onChange={(e) => setIsCurrent(e.target.checked)}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-xs font-bold text-blue-700">Currently Working Here</span>
                            </label>
                        </div>

                        {!isCurrent && (
                            <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2">
                                <select
                                    value={endDate.month}
                                    onChange={(e) => setEndDate({ ...endDate, month: e.target.value })}
                                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                                >
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <select
                                    value={endDate.year}
                                    onChange={(e) => setEndDate({ ...endDate, year: e.target.value })}
                                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                                >
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        )}
                        {isCurrent && (
                            <p className="text-[10px] font-bold text-blue-400 italic">This will show as "Present" on your CV</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-blue-600" /> Achievements & Responsibilities
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Tell us what you did and your impact..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium resize-none leading-relaxed"
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <Save className="w-4 h-4" />
                            Save Experience
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
