"use client";

import { useState } from "react";
import { X, Save, User, Mail, Phone, MapPin, Briefcase, Car, CreditCard, Github, Linkedin, Globe, FileText } from "lucide-react";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData: {
        name: string;
        headline: string;
        email: string;
        phone: string;
        location: string;
        availabilityStatus: "Looking for Work" | "Not Looking";
        haveLicense?: boolean;
        haveCar?: boolean;
        github?: string;
        linkedin?: string;
        portfolio?: string;
        summary?: string;
    };
}

export default function EditProfileModal({ isOpen, onClose, onSave, initialData }: EditProfileModalProps) {
    const [formData, setFormData] = useState(initialData);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600">
                    <h2 className="text-xl font-bold text-white">Edit Professional Profile</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Wrapper */}
                <div className="overflow-y-auto max-h-[70vh]">
                    <div className="p-8 grid md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-500" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Headline */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-blue-500" />
                                Professional Headline
                            </label>
                            <input
                                type="text"
                                value={formData.headline}
                                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                                placeholder="e.g. Computer Science Student | UI/UX Enthusiast"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Professional Summary */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-500" />
                                Professional Summary
                            </label>
                            <textarea
                                value={formData.summary || ""}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                placeholder="Briefly describe your professional background and goals..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32 resize-none"
                            />
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-500" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-blue-500" />
                                WhatsApp Number
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                Location
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Availability */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-blue-500" />
                                Availability Status
                            </label>
                            <select
                                value={formData.availabilityStatus}
                                onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value as any })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                            >
                                <option value="Looking for Work">Looking for Work</option>
                                <option value="Not Looking">Not Looking</option>
                            </select>
                        </div>

                        {/* Social Links Section Header */}
                        <div className="col-span-2 pt-4 border-t border-slate-100 mt-2">
                            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Social Media & Portfolio</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 flex items-center gap-2 uppercase">
                                        <Github className="w-3.5 h-3.5" />
                                        GitHub
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.github || ""}
                                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                                        placeholder="https://github.com/..."
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 flex items-center gap-2 uppercase">
                                        <Linkedin className="w-3.5 h-3.5" />
                                        LinkedIn
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.linkedin || ""}
                                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                        placeholder="https://linkedin.com/in/..."
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-xs font-bold text-slate-500 flex items-center gap-2 uppercase">
                                        <Globe className="w-3.5 h-3.5" />
                                        Portfolio / Website
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.portfolio || ""}
                                        onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Logistics Section */}
                        <div className="col-span-2 space-y-4 pt-4 border-t border-slate-100">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Logistics & Transport</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.haveLicense ? 'border-purple-500 bg-purple-50' : 'border-slate-100 bg-white shadow-inner filter grayscale opacity-60'}`}>
                                    <input
                                        type="checkbox"
                                        checked={formData.haveLicense}
                                        onChange={(e) => setFormData({ ...formData, haveLicense: e.target.checked })}
                                        className="hidden"
                                    />
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.haveLicense ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-bold ${formData.haveLicense ? 'text-purple-700' : 'text-slate-600'}`}>Driver's License</p>
                                        <p className="text-[10px] text-slate-400">Valid license</p>
                                    </div>
                                </label>

                                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.haveCar ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white shadow-inner filter grayscale opacity-60'}`}>
                                    <input
                                        type="checkbox"
                                        checked={formData.haveCar}
                                        onChange={(e) => setFormData({ ...formData, haveCar: e.target.checked })}
                                        className="hidden"
                                    />
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.haveCar ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Car className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-bold ${formData.haveCar ? 'text-blue-700' : 'text-slate-600'}`}>Own Transport</p>
                                        <p className="text-[10px] text-slate-400">Personal vehicle</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(formData)}
                        className="flex-[2] py-3 px-12 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02] active:scale-[0.98] text-white shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
