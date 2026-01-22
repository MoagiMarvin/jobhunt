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
        licenseCode?: string;
        haveCar?: boolean;
        github?: string;
        linkedin?: string;
        portfolio?: string;
    };
}

export default function EditProfileModal({ isOpen, onClose, onSave, initialData }: EditProfileModalProps) {
    const [formData, setFormData] = useState(initialData);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Edit Professional Profile</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Wrapper */}
                <div className="overflow-y-auto max-h-[70vh]">
                    <div className="p-8 grid md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-600" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                            />
                        </div>

                        {/* Headline */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-blue-600" />
                                Professional Headline
                            </label>
                            <input
                                type="text"
                                value={formData.headline}
                                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                                placeholder="e.g. Computer Science Student | UI/UX Enthusiast"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                            />
                        </div>


                        {/* Contact Info */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-600" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-blue-600" />
                                WhatsApp Number
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                            />
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                Location
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                            />
                        </div>

                        {/* Availability */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-primary" />
                                Availability Status
                            </label>
                            <select
                                value={formData.availabilityStatus}
                                onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value as any })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white font-medium capitalize"
                            >
                                <option value="Looking for Work">Looking for Work</option>
                                <option value="Not Looking">Not Looking</option>
                            </select>
                        </div>

                        {/* Social Links Section Header */}
                        <div className="col-span-2 pt-4 border-t border-slate-100 mt-2">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Social Media & Portfolio</h3>
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
                                        className="w-full px-3 py-2 rounded-lg border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-all font-medium"
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
                                        className="w-full px-3 py-2 rounded-lg border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-all font-medium"
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
                                        className="w-full px-3 py-2 rounded-lg border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-all font-medium"
                                    />
                                </div>
                            </div>
                        </div>


                        {/* Logistics Section */}
                        <div className="col-span-2 space-y-4 pt-4 border-t border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Logistics & Transport</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 flex items-center gap-2 uppercase">
                                        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                                        Driver's License
                                    </label>
                                    <select
                                        value={formData.licenseCode || "None"}
                                        onChange={(e) => {
                                            const code = e.target.value;
                                            setFormData({
                                                ...formData,
                                                licenseCode: code === "None" ? "" : code,
                                                haveLicense: code !== "None"
                                            });
                                        }}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white font-medium"
                                    >
                                        <option value="None">None / No License</option>
                                        <option value="Learners">Learner's License</option>
                                        <option value="Code 8 (B)">Code 8 / B (Light Vehicle)</option>
                                        <option value="Code 10 (C1)">Code 10 / C1 (Heavy Vehicle)</option>
                                        <option value="Code 14 (EC)">Code 14 / EC (Extra Heavy)</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.haveCar ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white'}`}>
                                    <input
                                        type="checkbox"
                                        checked={formData.haveCar}
                                        onChange={(e) => setFormData({ ...formData, haveCar: e.target.checked })}
                                        className="hidden"
                                    />
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.haveCar ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
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
                        className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-all border border-slate-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(formData)}
                        className="flex-[2] py-3 px-12 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
