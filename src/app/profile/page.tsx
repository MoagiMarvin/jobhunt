"use client";

import { useState } from "react";
import { Upload, FileText, Sparkles } from "lucide-react";

export default function ProfilePage() {
    const [cvText, setCvText] = useState("");

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="space-y-2 mb-8">
                    <h1 className="text-3xl font-bold">Master CV Profile</h1>
                    <p className="text-muted-foreground">
                        Upload or paste your complete CV. This will be your master profile used to generate tailored CVs.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Upload Section */}
                    <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-indigo-500/50 transition-all">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Upload CV</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Drag and drop your CV (PDF, DOCX) or click to browse
                        </p>
                        <button className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium transition-all">
                            Choose File
                        </button>
                    </div>

                    {/* OR Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-background text-muted-foreground">OR</span>
                        </div>
                    </div>

                    {/* Paste Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Paste CV Text
                        </label>
                        <textarea
                            value={cvText}
                            onChange={(e) => setCvText(e.target.value)}
                            placeholder="Paste your complete CV text here..."
                            className="w-full h-96 bg-secondary/50 border border-input rounded-lg p-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none transition-all placeholder:text-muted-foreground/50 font-mono"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button className="flex-1 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Save Master CV
                        </button>
                        <button className="px-6 py-3 rounded-lg bg-secondary hover:bg-secondary/80 font-medium transition-all">
                            Clear
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300">
                        <strong>Tip:</strong> Include all your skills, experiences, projects, and achievements. The AI will select the most relevant ones for each job application.
                    </div>
                </div>
            </div>
        </main>
    );
}
