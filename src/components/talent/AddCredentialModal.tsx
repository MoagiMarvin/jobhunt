"use client";

import { useState, useEffect } from "react";
import { X, Save, GraduationCap, Award, FileUp, Link as LinkIcon } from "lucide-react";

interface AddCredentialModalProps {
    isOpen: boolean;
    type: "education" | "certification";
    onClose: () => void;
    onAdd: (data: any) => void;
    initialData?: any;
}

export default function AddCredentialModal({ isOpen, type, onClose, onAdd, initialData }: AddCredentialModalProps) {
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
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (initialData && isOpen) {
            setFormData({
                title: initialData.title || "",
                issuer: initialData.issuer || "",
                start_date: initialData.start_date ? initialData.start_date.split("-")[0] : "",
                end_date: initialData.end_date ? initialData.end_date.split("-")[0] : "",
                qualification_level: initialData.qualification_level || "",
                credential_url: initialData.credential_url || "",
                document_url: initialData.document_url || "",
                isVerified: initialData.isVerified || false
            });
            if (initialData.document_url) {
                // We can't easily recreate a File object from a URL here without fetching it,
                // but we can set the document_url in formData to show it exists.
            }
        } else if (!isOpen) {
            setFormData({
                title: "",
                issuer: "",
                start_date: "",
                end_date: "",
                qualification_level: "",
                credential_url: "",
                document_url: "",
                isVerified: false
            });
            setSelectedFile(null);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const Icon = type === "education" ? GraduationCap : Award;
    const titleLabel = type === "education" ? "Degree / Qualification" : "Certification Name";
    const issuerLabel = type === "education" ? "University / Institution" : "Issuing Organization";

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
                {/* Mobile Grab Handle */}
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Icon className={`w-5 h-5 text-blue-600`} />
                        {initialData ? "Edit" : "Add"} {type === "education" ? "Education" : "Certification"}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-5 md:p-8 space-y-4 overflow-y-auto custom-scrollbar">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{titleLabel}</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder={type === "education" ? "e.g. BSc Computer Science" : "e.g. AWS Certified Developer"}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-sm"
                            />
                        </div>

                        {/* Issuer */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{issuerLabel}</label>
                            <input
                                type="text"
                                value={formData.issuer}
                                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Dates */}
                            {type === "education" ? (
                                <>
                                    <div className="space-y-2 col-span-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Year</label>
                                        <input
                                            type="text"
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                            placeholder="e.g. 2021"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Year</label>
                                        <input
                                            type="text"
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                            placeholder="e.g. 2024"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-sm"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completion Year</label>
                                    <input
                                        type="text"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        placeholder="e.g. 2024"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-sm"
                                    />
                                </div>
                            )}

                            {/* Qualification Level (Only for Education) */}
                            {type === "education" && (
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Qualification Level</label>
                                    <select
                                        value={formData.qualification_level}
                                        onChange={(e) => setFormData({ ...formData, qualification_level: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-slate-700 bg-white text-sm"
                                    >
                                        <option value="">Select Level</option>
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
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Supporting Document (PDF, Image)</label>
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

                    <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all border border-slate-200 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                if (formData.title && formData.issuer) {
                                    setIsUploading(true);
                                    let finalDocUrl = formData.document_url;

                                    try {
                                        // Upload File if selected
                                        if (selectedFile) {
                                            const { data: { session } } = await import("@/lib/supabase").then(m => m.supabase.auth.getSession());
                                            if (session) {
                                                const fileExt = selectedFile.name.split('.').pop();
                                                const fileName = `${session.user.id}/${Date.now()}_${type}.${fileExt}`;

                                                const { error: uploadError } = await import("@/lib/supabase").then(m => m.supabase.storage
                                                    .from('credential-docs')
                                                    .upload(fileName, selectedFile));

                                                if (uploadError) throw uploadError;

                                                const { data: { publicUrl } } = await import("@/lib/supabase").then(m => m.supabase.storage
                                                    .from('credential-docs')
                                                    .getPublicUrl(fileName));

                                                finalDocUrl = publicUrl;
                                            }
                                        }

                                        // Extract year from end_date for DB compatibility
                                        const issueYear = parseInt(formData.end_date) || parseInt(formData.start_date) || new Date().getFullYear();

                                        // Format dates as YYYY-MM-DD for database
                                        const formatYearToDate = (yearStr: string) => {
                                            if (!yearStr) return null;
                                            if (/^\d{4}$/.test(yearStr)) return `${yearStr}-01-01`;
                                            return yearStr;
                                        };

                                        onAdd({
                                            ...formData,
                                            id: initialData?.id,
                                            year: issueYear,
                                            start_date: formatYearToDate(formData.start_date),
                                            end_date: formatYearToDate(formData.end_date),
                                            isVerified: !!finalDocUrl,
                                            document_url: finalDocUrl
                                        });
                                    } catch (error) {
                                        console.error("Error uploading credential:", error);
                                        alert("Failed to upload document. Please try again.");
                                    } finally {
                                        setIsUploading(false);
                                    }
                                }
                            }}
                            disabled={!formData.title || !formData.issuer || isUploading}
                            className="flex-[2] py-3 px-8 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                        >
                            <Save className="w-5 h-5" />
                            {isUploading ? "Saving..." : (initialData ? "Update" : "Save") + " " + (type === "education" ? "Education" : "Certification")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
