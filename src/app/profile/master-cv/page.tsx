"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Sparkles, Save, LogOut, Loader2, Zap } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function MasterCVPage() {
    const [cvText, setCvText] = useState("");
    const [isCleaning, setIsCleaning] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isFilling, setIsFilling] = useState(false);
    const [parsedCvData, setParsedCvData] = useState<any>(null);

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

            console.log("CV Clean Response:", data);

            // Check if we have parsed CV data
            if (data.parsedCv) {
                setParsedCvData(data.parsedCv);
                console.log("Parsed CV Data:", data.parsedCv);

                if (data.version === 'ai') {
                    alert('✅ CV parsed successfully by AI! Click "Auto-fill Profile" below to sync to your profile.');
                } else if (data.version === 'basic') {
                    alert('⚠️ Using basic parsing (GEMINI_API_KEY not set). The Auto-fill will have limited data. Consider setting up your API key for better results.');
                } else if (data.version === 'fallback') {
                    alert('❌ AI parsing failed: ' + (data.note || 'Unknown error') + '\n\nThe Auto-fill button will appear but may not have any data. Please check the console for details.');
                }
            } else if (data.cleanedText) {
                setCvText(data.cleanedText);
                alert('CV text cleaned, but no structured data was extracted.');
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

    const handleAutoFill = async () => {
        if (!parsedCvData) {
            alert("Please clean & format your CV with AI first to enable auto-fill.");
            return;
        }

        const confirmFill = confirm(
            "This will replace your current profile data with the information from your CV.\n\nAre you sure you want to continue?"
        );

        if (!confirmFill) return;

        setIsFilling(true);
        try {
            // Get current user ID
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert("You must be logged in to auto-fill your profile.");
                return;
            }

            const userId = session.user.id;

            const res = await fetch('/api/profile/fill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parsedCv: parsedCvData, userId }),
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            alert(
                `Profile filled successfully!\n\n` +
                `✓ ${data.stats.skills} skills added\n` +
                `✓ ${data.stats.experiences} work experiences added\n` +
                `✓ ${data.stats.education} education entries added\n\n` +
                `Visit your profile to review and edit.`
            );

            // Optionally redirect to profile
            window.location.href = '/profile';
        } catch (error: any) {
            console.error('Auto-fill failed:', error);
            alert('Failed to auto-fill profile: ' + error.message);
        } finally {
            setIsFilling(false);
        }
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

                    {/* Hidden File Input */}
                    <input
                        type="file"
                        id="pdf-upload"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                    />

                    {/* Upload PDF Button */}
                    <div className="mb-4">
                        <button
                            onClick={() => document.getElementById('pdf-upload')?.click()}
                            disabled={isExtracting}
                            type="button"
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExtracting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Extracting CV Text...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    📄 Upload PDF CV
                                </>
                            )}
                        </button>
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            Upload your existing CV and we'll extract the text automatically
                        </p>
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
                        {parsedCvData && (
                            <button
                                onClick={handleAutoFill}
                                disabled={isFilling}
                                type="button"
                                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isFilling ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Filling Profile...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4" />
                                        🚀 Auto-fill My Profile
                                    </>
                                )}
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            type="button"
                            className={`${parsedCvData ? 'flex-none' : 'flex-1'} py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2 text-sm`}
                        >
                            <Save className="w-4 h-4" />
                            Save Master CV
                        </button>
                        <button
                            onClick={() => {
                                setCvText("");
                                setParsedCvData(null);
                            }}
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
