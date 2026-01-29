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
        start_date: "",
        end_date: "",
        qualification_level: "",
        credential_url: "",
        document_url: "",
        isVerified: false
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    if (!isOpen) return null;

    const Icon = type === "education" ? GraduationCap : Award;
    const titleLabel = type === "education" ? "Degree / Qualification" : "Certification Name";
    const issuerLabel = type === "education" ? "University / Institution" : "Issuing Organization";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Icon className={`w-5 h-5 text-blue-600`} />
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Dates */}
                        <div className="space-y-2 col-span-1">
                            <label className="text-sm font-semibold text-slate-700">Start Date / Year</label>
                            <input
                                type="text"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                placeholder="e.g. 2021"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2 col-span-1">
                            <label className="text-sm font-semibold text-slate-700">End Date / Year</label>
                            <input
                                type="text"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                placeholder="e.g. 2024"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                            />
                        </div>

                        {/* Qualification Level (Only for Education) */}
                        {type === "education" && (
                            <div className="space-y-2 col-span-1 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-700">Qualification Level</label>
                                <select
                                    value={formData.qualification_level}
                                    onChange={(e) => setFormData({ ...formData, qualification_level: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-slate-700 bg-white"
                                >
                                    <option value="">Select Level</option>
                                    {/* Removed Matric for tertiary education */}
                                    <option value="Higher Certificate">Higher Certificate</option>
                                    <option value="Diploma">Diploma</option>
                                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                                    <option value="Honours Degree">Honours Degree</option>
                                    <option value="Master's Degree">Master's Degree</option>
                                    <option value="PhD / Doctorate">PhD / Doctorate</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Document Upload */}
                    <div className="space-y-3 pt-2">
                        <label className="text-sm font-semibold text-slate-700 block">Supporting Document (PDF, Image)</label>
                        <div className="relative group">
                            <input
                                type="file"
                                id="credential-upload"
                                className="hidden"
                                accept=".pdf,image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setSelectedFile(file);
                                        setFormData({ ...formData, document_url: URL.createObjectURL(file) });
                                    }
                                }}
                            />
                            <label
                                htmlFor="credential-upload"
                                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer ${selectedFile ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 hover:border-blue-300 bg-slate-50/30'}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${selectedFile ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-blue-500 shadow-sm border border-blue-50'}`}>
                                    <FileUp className="w-5 h-5" />
                                </div>
                                <p className={`text-sm font-bold ${selectedFile ? 'text-blue-700' : 'text-slate-600'}`}>
                                    {selectedFile ? selectedFile.name : 'Click to upload proof'}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Upload certificate, degree, or official transcript
                                </p>
                                {selectedFile && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedFile(null);
                                            setFormData({ ...formData, document_url: "" });
                                        }}
                                        className="mt-3 text-[10px] font-bold text-red-500 hover:text-red-600 underline"
                                    >
                                        Remove file
                                    </button>
                                )}
                            </label>
                        </div>
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
                                // Extract year from end_date for DB compatibility
                                const issueYear = parseInt(formData.end_date) || parseInt(formData.start_date) || new Date().getFullYear();

                                // Format dates as YYYY-MM-DD for database
                                // If user only provides a year (e.g. "2024"), we convert it to "2024-01-01"
                                const formatYearToDate = (yearStr: string) => {
                                    if (!yearStr) return null;
                                    if (/^\d{4}$/.test(yearStr)) return `${yearStr}-01-01`;
                                    return yearStr; // Assume it's already a date or invalid (handled by DB)
                                };

                                onAdd({
                                    ...formData,
                                    year: issueYear,
                                    start_date: formatYearToDate(formData.start_date),
                                    end_date: formatYearToDate(formData.end_date),
                                    isVerified: !!selectedFile,
                                    document_url: selectedFile ? formData.document_url || "/mock/new-doc.pdf" : ""
                                });
                            }
                        }}
                        disabled={!formData.title || !formData.issuer}
                        className="flex-2 py-3 px-8 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 bg-blue-600 hover:bg-blue-700"
                    >
                        <Save className="w-5 h-5" />
                        Save {type === "education" ? "Education" : "Certification"}
                    </button>
                </div>
            </div>
        </div>
    );
}
