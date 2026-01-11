"use client";

import React, { useState } from "react";
import { X, Save, FolderKanban, Link as LinkIcon, Github, Image as ImageIcon, Upload, Sparkles } from "lucide-react";

interface AddProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: any) => void;
}

export default function AddProjectModal({ isOpen, onClose, onAdd }: AddProjectModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        technologies: "",
        link_url: "",
        github_url: ""
    });
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewImage(url);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            ...formData,
            technologies: formData.technologies.split(",").map((s: string) => s.trim()).filter(Boolean),
            image_url: previewImage // In production, this would be the Supabase URL
        });
        setFormData({ title: "", description: "", technologies: "", link_url: "", github_url: "" });
        setPreviewImage(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-xl text-primary">
                            <FolderKanban className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Add Project</h2>
                            <p className="text-xs text-slate-500">Showcase your best work to recruiters</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {/* Visual Upload Area */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
                            Project Cover (Screenshot or GIF)
                            <span className="text-[10px] bg-primary/5 text-primary px-2 py-0.5 rounded-full border border-primary/20">Recommended</span>
                        </label>

                        <div className="relative group">
                            <input
                                type="file"
                                accept="image/*,.gif"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />

                            {previewImage ? (
                                <div className="relative h-48 rounded-2xl overflow-hidden border-2 border-dashed border-primary/20 group-hover:border-primary transition-all">
                                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                                            <Upload className="w-5 h-5" />
                                            Change Image
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-48 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-25 flex flex-col items-center justify-center gap-3 group-hover:bg-slate-50 group-hover:border-primary/40 transition-all">
                                    <div className="p-4 bg-white rounded-full shadow-sm text-slate-400 group-hover:text-primary transition-colors">
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-slate-600">Drag & Drop or Click to Upload</p>
                                        <p className="text-xs text-slate-400">Supports PNG, JPG, GIF (Max 5MB)</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pro Tip */}
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                                <span className="font-bold text-primary">Pro Tip:</span> Upload a <span className="underline italic">GIF</span> of your app in action to show "Proof of Life". It catches recruiter eyes 3x faster!
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Project Title</label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. AI Content Generator"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
                            />
                        </div>

                        {/* Tech Stack */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Tech Stack (comma separated)</label>
                            <input
                                type="text"
                                value={formData.technologies}
                                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                                placeholder="React, Node.js, Tailwind"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Short Description</label>
                        <textarea
                            required
                            rows={2}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="What did you build and why?"
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none text-sm leading-relaxed font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Live Link */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-primary" />
                                Live Demo Hub
                            </label>
                            <input
                                type="url"
                                value={formData.link_url}
                                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
                            />
                        </div>

                        {/* Github Link */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Github className="w-4 h-4 text-slate-600" />
                                Source Code
                            </label>
                            <input
                                type="url"
                                value={formData.github_url}
                                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                                placeholder="https://github.com/..."
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
                            />
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3.5 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-all border border-slate-200 shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="flex-2 py-3.5 px-10 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        Save Project
                    </button>
                </div>
            </div>
        </div>
    );
}
