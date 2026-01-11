"use client";

import { useState } from "react";
import { X, Save, GraduationCap, Award, FileUp, Link as LinkIcon } from "lucide-react";

interface AddCredentialModalProps {
    isOpen: boolean;
    type: "education" | "certification";
    onClose: () => void;
    onAdd: (data: any) => void;
}

export default function AddCredentialModal({ isOpen, type, onClose, onAdd }: AddCredentialModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        issuer: "",
        date: "",
        grade: "",
        credential_url: "",
        isVerified: false
    });

    if (!isOpen) return null;

    const Icon = type === "education" ? GraduationCap : Award;
    const titleLabel = type === "education" ? "Degree / Qualification" : "Certification Name";
    const issuerLabel = type === "education" ? "University / Institution" : "Issuing Organization";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${type === "education" ? "text-blue-600" : "text-amber-600"}`} />
                        Add {type === "education" ? "Education" : "Certification"}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">{titleLabel}</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder={type === "education" ? "e.g. BSc Computer Science" : "e.g. AWS Certified Developer"}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                        />
                    </div>

                    {/* Issuer */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">{issuerLabel}</label>
                        <input
                            type="text"
                            value={formData.issuer}
                            onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Date / Period</label>
                            <input
                                type="text"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                placeholder="e.g. 2021 - 2024"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                            />
                        </div>

                        {/* Grade */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Grade / Result (Optional)</label>
                            <input
                                type="text"
                                value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                placeholder="e.g. Distinction"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Links & Verification */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-primary" />
                            Validation Link (Optional)
                        </label>
                        <input
                            type="url"
                            value={formData.credential_url}
                            onChange={(e) => setFormData({ ...formData, credential_url: e.target.value })}
                            placeholder="https://..."
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-sm"
                        />
                    </div>

                    <div className="space-y-2 pt-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <FileUp className="w-4 h-4 text-primary" />
                            Upload Certificate (PDF/Image)
                        </label>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-primary transition-all cursor-pointer group bg-slate-50">
                            <FileUp className="w-8 h-8 mx-auto mb-2 text-slate-300 group-hover:text-primary" />
                            <p className="text-xs text-slate-500 font-medium">Pick a file to verify this {type}</p>
                        </div>
                        <p className="text-[10px] text-slate-400">Note: Uploading a document helps in getting the "Verified" badge which recruiters trust.</p>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-all border border-slate-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (formData.title && formData.issuer) {
                                onAdd({ ...formData, isVerified: true, document_url: "/mock/new-doc.pdf" });
                            }
                        }}
                        disabled={!formData.title || !formData.issuer}
                        className="flex-2 py-3 px-8 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 bg-slate-900 hover:bg-black"
                    >
                        <Save className="w-5 h-5" />
                        Save {type === "education" ? "Education" : "Certification"}
                    </button>
                </div>
            </div>
        </div>
    );
}
