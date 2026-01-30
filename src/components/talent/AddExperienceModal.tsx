"use client";

import { useState, useEffect } from "react";
import { X, Save, Briefcase, Calendar, FileText } from "lucide-react";

interface AddExperienceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: any) => void;
    initialData?: any;
}

export default function AddExperienceModal({ isOpen, onClose, onAdd, initialData }: AddExperienceModalProps) {
    const [formData, setFormData] = useState({
        role: "",
        company: ""
    });
    const [achievements, setAchievements] = useState<string[]>([]);
    const [currentAchievement, setCurrentAchievement] = useState("");
    const [startDate, setStartDate] = useState({ month: "January", year: new Date().getFullYear().toString() });
    const [endDate, setEndDate] = useState({ month: "January", year: new Date().getFullYear().toString() });
    const [isCurrent, setIsCurrent] = useState(true);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 40 }, (_, i) => (currentYear - i).toString());

    useEffect(() => {
        if (initialData && isOpen) {
            setFormData({
                role: initialData.role || "",
                company: initialData.company || ""
            });
            setAchievements(initialData.description ? initialData.description.split('\n') : []);
            setIsCurrent(initialData.duration?.toLowerCase().includes("present") ?? true);

            // Try to parse duration (e.g., "Jan 2020 - Dec 2022" or "Jan 2020 - Present")
            if (initialData.duration) {
                const parts = initialData.duration.split(' - ');
                if (parts.length > 0) {
                    const startPart = parts[0].trim();
                    const startMonthYear = startPart.split(' ');
                    if (startMonthYear.length === 2) {
                        const [startMonth, startYear] = startMonthYear;
                        const fullStartMonth = months.find(m => m.startsWith(startMonth)) || "January";
                        setStartDate({ month: fullStartMonth, year: startYear });
                    }
                }
                if (parts.length > 1 && !parts[1].toLowerCase().includes("present")) {
                    const endPart = parts[1].trim();
                    const endMonthYear = endPart.split(' ');
                    if (endMonthYear.length === 2) {
                        const [endMonth, endYear] = endMonthYear;
                        const fullEndMonth = months.find(m => m.startsWith(endMonth)) || "January";
                        setEndDate({ month: fullEndMonth, year: endYear });
                    }
                }
            }
        } else if (!isOpen) {
            // Reset when closing
            setFormData({ role: "", company: "" });
            setAchievements([]);
            setCurrentAchievement("");
            setStartDate({ month: "January", year: new Date().getFullYear().toString() });
            setEndDate({ month: "January", year: new Date().getFullYear().toString() });
            setIsCurrent(true);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const addAchievement = () => {
        if (currentAchievement.trim()) {
            setAchievements([...achievements, currentAchievement.trim()]);
            setCurrentAchievement("");
        }
    };

    const removeAchievement = (index: number) => {
        setAchievements(achievements.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addAchievement();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Finalize any text in the input
        let finalAchievements = [...achievements];
        if (currentAchievement.trim()) {
            finalAchievements.push(currentAchievement.trim());
        }

        if (finalAchievements.length === 0) {
            alert("Please add at least one achievement or responsibility.");
            return;
        }

        const startStr = `${startDate.month.slice(0, 3)} ${startDate.year}`;
        const endStr = isCurrent ? "Present" : `${endDate.month.slice(0, 3)} ${endDate.year}`;

        const startMonthIndex = months.indexOf(startDate.month) + 1;
        const formattedStartDate = `${startDate.year}-${startMonthIndex.toString().padStart(2, '0')}-01`;

        const endMonthIndex = months.indexOf(endDate.month) + 1;
        const formattedEndDate = isCurrent ? null : `${endDate.year}-${endMonthIndex.toString().padStart(2, '0')}-01`;

        onAdd({
            ...formData,
            id: initialData?.id,
            description: finalAchievements.join('\n'),
            duration: `${startStr} - ${endStr}`,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
            is_current: isCurrent
        });

        if (!initialData) {
            setFormData({ role: "", company: "" });
            setAchievements([]);
            setCurrentAchievement("");
            setIsCurrent(true);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        {initialData ? "Edit Work Experience" : "Add Work Experience"}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-5 max-h-[85vh] overflow-y-auto">
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

                    {/* Achievements & Responsibilities */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-blue-600" /> Achievements & Responsibilities
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={currentAchievement}
                                onChange={(e) => setCurrentAchievement(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a responsibility and press Enter..."
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                            />
                            <button
                                type="button"
                                onClick={addAchievement}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-all"
                            >
                                Add
                            </button>
                        </div>

                        {/* List of achievements */}
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {achievements.map((item, index) => (
                                <div key={index} className="flex font-semibold items-start justify-between gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 group animate-in slide-in-from-left-2 duration-200">
                                    <div className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                        <p className="text-sm text-slate-700 leading-relaxed capitalize italic">
                                            {item}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeAchievement(index)}
                                        className="text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
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
                            {initialData ? "Update Experience" : "Save Experience"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
