"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Sparkles, Save, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";

export default function MasterCVPage() {
    const [cvText, setCvText] = useState("");
    const [isCleaning, setIsCleaning] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);

    // Load CV text from localStorage on mount
    useEffect(() => {
        const savedCvText = localStorage.getItem("master_cv_text");
        if (savedCvText) setCvText(savedCvText);
    }, []);

    const handleFileUpload = async (event: any) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsExtracting(true);
        try {
            // Load PDF.js dynamically to avoid SSR issues
            const pdfjs = await import('pdfjs-dist');

            // Set up worker
            pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            let fullText = "";

            // Extract text from each page
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(" ");
                fullText += pageText + "\n\n";
            }

            if (!fullText.trim()) {
                throw new Error("Could not extract any text from this PDF. It might be a scanned image.");
            }

            setCvText(fullText.trim());
            alert('CV extracted successfully! Review and edit below.');
        } catch (error: any) {
            console.error('PDF Extraction failed:', error);
            alert('Failed to extract PDF: ' + error.message);
        } finally {
            setIsExtracting(false);
            event.target.value = '';
        }
    };

    const handleClean = async () => {
        if (!cvText.trim()) return;

        setIsCleaning(true);
        try {
            const res = await fetch('/api/clean-cv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cvText }),
            });

            const data = await res.json();
            if (data.error) throw new Error(`${data.error} (${data.details || 'No details'})}`);

            setCvText(data.cleanedText);
            if (data.version === 'basic' || data.version === 'fallback') {
                alert(`CV Polished (Basic Mode): ${data.note || 'AI was unavailable, using basic patterns.'}`);
            } else {
                alert('CV cleaned and formatted for ATS success!');
            }
        } catch (error: any) {
            console.error('Cleaning failed:', error);
            alert('Failed to clean CV: ' + error.message);
        } finally {
            setIsCleaning(false);
        }
    };

    const handleSave = () => {
        localStorage.setItem("master_cv_text", cvText);
        alert("Master CV saved successfully!");
    };

    const handleLogout = () => {
        console.log("Logging out...");
        alert("Logged out successfully (Mock)");
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Header with Back Button and Logout */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-semibold text-sm transition-all">
                        ← Back to Profile
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-3 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 border-2 border-slate-100 hover:border-red-100 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>

                {/* Master CV Section */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-primary">Master CV</h1>
                        <p className="text-slate-600 text-sm">
                            Upload an existing CV, paste your details, or create one from scratch. This becomes your master document.
                        </p>
                    </div>

                    {/* Options Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Hidden File Input */}
                        <input
                            type="file"
                            id="pdf-upload"
                            accept="application/pdf"
                            className="hidden"
                            onChange={handleFileUpload}
                        />

                        {/* Upload Section */}
                        <div
                            onClick={() => !isExtracting && document.getElementById('pdf-upload')?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center group cursor-pointer ${isExtracting ? 'border-blue-400 bg-blue-50/50' : 'border-blue-200 bg-white hover:border-blue-400'}`}
                        >
                            {isExtracting ? (
                                <Loader2 className="w-8 h-8 mb-3 text-blue-500 animate-spin" />
                            ) : (
                                <Upload className="w-8 h-8 mb-3 text-blue-400 group-hover:text-blue-600 transition-colors" />
                            )}
                            <h3 className="text-md font-semibold text-primary mb-1">
                                {isExtracting ? 'Reading PDF...' : 'Upload File'}
                            </h3>
                            <p className="text-xs text-slate-500 mb-3">
                                PDF only for best results
                            </p>
                            <button type="button" className="px-4 py-2 rounded-lg bg-slate-50 group-hover:bg-blue-50 text-blue-600 text-xs font-medium transition-all border border-blue-100 group-hover:border-blue-200">
                                {isExtracting ? 'Please wait' : 'Choose File'}
                            </button>
                        </div>

                        {/* Create from Scratch Section */}
                        <Link href="/profile/create" className="border-2 border-dashed border-purple-200 bg-white rounded-xl p-6 text-center hover:border-purple-400 transition-all flex flex-col items-center justify-center group cursor-pointer">
                            <Sparkles className="w-8 h-8 mb-3 text-purple-400 group-hover:text-purple-600 transition-colors" />
                            <h3 className="text-md font-semibold text-primary mb-1">Create from Scratch</h3>
                            <p className="text-xs text-slate-500 mb-3">
                                Don't have a CV?
                            </p>
                            <button type="button" className="px-4 py-2 rounded-lg bg-slate-50 group-hover:bg-purple-50 text-purple-600 text-xs font-medium transition-all border border-purple-100 group-hover:border-purple-200">
                                Open Builder
                            </button>
                        </Link>
                    </div>

                    {/* Text Area Section */}
                    <div className="space-y-3 relative">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold flex items-center gap-2 text-primary">
                                <FileText className="w-4 h-4" />
                                CV Content
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleClean}
                                    disabled={isCleaning || !cvText}
                                    type="button"
                                    className={`text-[10px] font-bold px-2 py-1 rounded border transition-all flex items-center gap-1.5 ${isCleaning ? 'bg-blue-50 text-blue-400 border-blue-100' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300'} disabled:opacity-50`}
                                >
                                    {isCleaning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                    {isCleaning ? "Polishing..." : "Clean & Format with AI"}
                                </button>
                                {cvText && (
                                    <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-100 animate-pulse">
                                        Extracted Content
                                    </span>
                                )}
                            </div>
                        </div>

                        <textarea
                            value={cvText}
                            onChange={(e) => setCvText(e.target.value)}
                            placeholder="Paste your CV text here or use the options above..."
                            className="w-full h-80 bg-white border-2 border-slate-200 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all placeholder:text-slate-400 font-mono leading-relaxed"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            type="button"
                            className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <Save className="w-4 h-4" />
                            Save Master CV
                        </button>
                        <button
                            onClick={() => setCvText("")}
                            type="button"
                            className="px-6 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-primary transition-all border border-slate-200 text-sm"
                        >
                            Clear
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 text-sm text-slate-700">
                        <strong className="text-primary">💡 Tip:</strong> Include all your skills, experiences, projects, and achievements. This is your master document that you can reference when building your structured profile.
                    </div>
                </div>
            </div>
        </main>
    );
}
