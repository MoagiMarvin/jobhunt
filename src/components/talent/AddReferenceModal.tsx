"use client";

import { useState } from "react";
import { X, Save, User, Building2, Phone, Mail, Briefcase } from "lucide-react";

interface AddReferenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (reference: any) => void;
}

export default function AddReferenceModal({ isOpen, onClose, onAdd }: AddReferenceModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        relationship: "",
        company: "",
        phone: "",
        email: ""
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(formData);
        setFormData({ name: "", relationship: "", company: "", phone: "", email: "" });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Add Professional Reference</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <User className="w-3.5 h-3.5" /> Full Name
                        </label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. John Doe"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5" /> Relationship
                        </label>
                        <input
                            required
                            type="text"
                            value={formData.relationship}
                            onChange={e => setFormData({ ...formData, relationship: e.target.value })}
                            placeholder="e.g. Former Manager"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5" /> Company
                        </label>
                        <input
                            required
                            type="text"
                            value={formData.company}
                            onChange={e => setFormData({ ...formData, company: e.target.value })}
                            placeholder="e.g. TechCorp Solutions"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5" /> Phone
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+27..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5" /> Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@example.com"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                            />
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
                            Save Reference
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
