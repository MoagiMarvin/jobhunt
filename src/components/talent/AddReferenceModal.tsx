"use client";

import { useState, useEffect } from "react";
import { X, Save, User, Building2, Phone, Mail, Briefcase } from "lucide-react";

interface AddReferenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (reference: any) => void;
    initialData?: any;
}

export default function AddReferenceModal({ isOpen, onClose, onAdd, initialData }: AddReferenceModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        relationship: "",
        company: "",
        phone: "",
        email: ""
    });

    useEffect(() => {
        if (initialData && isOpen) {
            setFormData({
                name: initialData.name || "",
                relationship: initialData.relationship || "",
                company: initialData.company || "",
                phone: initialData.phone || "",
                email: initialData.email || ""
            });
        } else if (!isOpen) {
            setFormData({ name: "", relationship: "", company: "", phone: "", email: "" });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            ...formData,
            id: initialData?.id
        });
        if (!initialData) {
            setFormData({ name: "", relationship: "", company: "", phone: "", email: "" });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 max-h-[95vh] sm:max-h-[85vh] flex flex-col">
                {/* Mobile Grab Handle */}
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-bold text-slate-900">{initialData ? "Edit" : "Add"} Reference</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col min-h-0 overflow-hidden">
                    <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    </div>

                    <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all border border-slate-200 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <Save className="w-4 h-4" />
                            {initialData ? "Update" : "Save"} Reference
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
