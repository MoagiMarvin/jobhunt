"use client";

import { useState } from "react";
import { Upload, FileText, Sparkles } from "lucide-react";

export default function ProfilePage() {
    const [cvText, setCvText] = useState("");

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="space-y-2 mb-8">
                    <h1 className="text-3xl font-bold text-primary">Master CV Profile</h1>
                    <p className="text-slate-600">
                        Upload or paste your complete CV. This will be your master profile used to generate tailored CVs.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Upload Section */}
                    <div className="border-2 border-dashed border-blue-200 bg-white rounded-xl p-12 text-center hover:border-blue-400 transition-all">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-accent" />
                        <h3 className="text-lg font-semibold text-primary mb-2">Upload CV</h3>
                        <p className="text-sm text-slate-600 mb-4">
                            Drag and drop your CV (PDF, DOCX) or click to browse
                        </p>
                        <button className="px-6 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-primary text-sm font-medium transition-all border border-slate-200">
                            Choose File
                        </button>
                    </div>

                    {/* OR Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-gradient-to-br from-blue-50 to-purple-50 text-slate-500 font-medium">OR</span>
                        </div>
                    </div>

                    {/* Paste Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2 text-primary">
                            <FileText className="w-4 h-4" />
                            Paste CV Text
                        </label>
                        <textarea
                            value={cvText}
                            onChange={(e) => setCvText(e.target.value)}
                            placeholder="Paste your complete CV text here..."
                            className="w-full h-96 bg-white border-2 border-slate-200 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all placeholder:text-slate-400 font-mono"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button className="flex-1 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Save Master CV
                        </button>
                        <button className="px-8 py-4 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-primary transition-all border border-slate-200">
                            Clear
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 text-sm text-slate-700">
                        <strong className="text-primary">💡 Tip:</strong> Include all your skills, experiences, projects, and achievements. The AI will select the most relevant ones for each job application.
                    </div>
                </div>
            </div>
        </main>
    );
}
