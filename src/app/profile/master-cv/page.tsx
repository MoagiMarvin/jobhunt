"use client";

import { useState } from "react";
import { Upload, Loader2, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function UploadCVPage() {
    const [cvText, setCvText] = useState("");
    const [isExtracting, setIsExtracting] = useState(false);
    const [isFilling, setIsFilling] = useState(false);
    const [parsedCvData, setParsedCvData] = useState<any>(null);
    const [extractedFileName, setExtractedFileName] = useState("");

    const handleFileUpload = async (event: any) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsExtracting(true);
        setExtractedFileName(file.name);
        setParsedCvData(null); // Reset previous data

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
                fullText += pageText + "\\n\\n";
            }

            if (!fullText.trim()) {
                throw new Error("Could not extract any text from this PDF. It might be a scanned image.");
            }

            setCvText(fullText.trim());

            // Automatically parse with AI after extraction
            await parseWithAI(fullText.trim());

        } catch (error: any) {
            console.error('PDF Extraction failed:', error);
            alert('Failed to extract PDF: ' + error.message);
            setIsExtracting(false);
        } finally {
            event.target.value = '';
        }
    };

    const parseWithAI = async (text: string) => {
        try {
            const res = await fetch('/api/clean-cv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cvText: text }),
            });

            const data = await res.json();
            if (data.error) throw new Error(`${data.error} (${data.details || 'No details'})`);

            console.log("CV Clean Response:", data);

            // Check if we have parsed CV data
            if (data.parsedCv) {
                setParsedCvData(data.parsedCv);
                console.log("Parsed CV Data:", data.parsedCv);

                if (data.version === 'ai') {
                    // Success - show ready state
                } else if (data.version === 'fallback') {
                    alert('⚠️ AI parsing had issues: ' + (data.note || 'Unknown error') + '\\n\\nSome data may be missing.');
                }
            }
        } catch (error: any) {
            console.error('Parsing failed:', error);
            alert('Failed to parse CV: ' + error.message);
        } finally {
            setIsExtracting(false);
        }
    };

    const handleAutoFill = async () => {
        if (!parsedCvData) {
            alert("No CV data available. Please upload a PDF first.");
            return;
        }

        const confirmFill = confirm(
            "This will replace your current profile data with the information from your CV.\\n\\nAre you sure you want to continue?"
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
            const accessToken = session.access_token;

            const res = await fetch('/api/profile/fill', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ parsedCv: parsedCvData, userId }),
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            alert(
                `Profile filled successfully!\n\n` +
                `✓ ${data.stats.skills} skills added\n` +
                `✓ ${data.stats.experiences} work experiences added\n` +
                `✓ ${data.stats.education} education entries added\n` +
                `✓ ${data.stats.projects} projects added\n` +
                `✓ ${data.stats.languages} languages added\n` +
                `✓ ${data.stats.references} references added\n\n` +
                `Redirecting to your profile...`
            );

            // Redirect to profile
            window.location.href = '/profile';
        } catch (error: any) {
            console.error('Auto-fill failed:', error);
            alert('Failed to auto-fill profile: ' + error.message);
        } finally {
            setIsFilling(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Header with Back Button */}
                <div className="mb-8">
                    <Link href="/profile" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-semibold text-sm transition-all">
                        ← Back to Profile
                    </Link>
                </div>

                {/* Main Upload Section */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-12">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload Your CV</h1>
                        <p className="text-slate-600">
                            Upload your existing CV and we'll automatically fill your profile
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

                    {/* Upload State */}
                    {!parsedCvData && !isExtracting && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Upload className="w-10 h-10 text-blue-600" />
                            </div>
                            <button
                                onClick={() => document.getElementById('pdf-upload')?.click()}
                                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold shadow-lg transition-all text-lg"
                            >
                                Choose PDF File
                            </button>
                            <p className="text-sm text-slate-500 mt-4">
                                Supported format: PDF only
                            </p>
                        </div>
                    )}

                    {/* Extracting State */}
                    {isExtracting && (
                        <div className="text-center py-12">
                            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Processing Your CV...</h3>
                            <p className="text-slate-600 text-sm">
                                {extractedFileName && `Extracting data from ${extractedFileName}`}
                            </p>
                        </div>
                    )}

                    {/* Ready to Auto-fill State */}
                    {parsedCvData && !isExtracting && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">CV Processed Successfully!</h3>
                            <p className="text-slate-600 mb-8">
                                Ready to fill your profile with extracted data
                            </p>

                            <div className="space-y-4 max-w-md mx-auto">
                                <button
                                    onClick={handleAutoFill}
                                    disabled={isFilling}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isFilling ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Filling Profile...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5" />
                                            🚀 Auto-fill My Profile
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => {
                                        setParsedCvData(null);
                                        setCvText("");
                                        setExtractedFileName("");
                                    }}
                                    className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all"
                                >
                                    Upload Different CV
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-slate-700">
                    <strong className="text-blue-700">💡 How it works:</strong> Upload your CV → AI extracts your information → Click Auto-fill to populate your profile instantly
                </div>
            </div>
        </main>
    );
}
