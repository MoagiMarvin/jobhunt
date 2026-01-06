"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Sparkles, User, Mail, Phone, LogOut, Edit2, Save, X, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    const [cvText, setCvText] = useState("");

    // Mock user state
    const [user, setUser] = useState({
        name: "Moagi Marvin", // Default mock name
        email: "moagi@example.com", // Default mock email
        phone: "+27 61 234 5678", // Default mock phone
        avatar: "MM"
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [editedUser, setEditedUser] = useState(user);

    // Load CV text on mount
    useEffect(() => {
        const saved = localStorage.getItem("master_cv_text");
        if (saved) setCvText(saved);
    }, []);

    const handleSave = () => {
        setUser(editedUser);
        setIsEditing(false);
        // Persist CV text to localStorage
        localStorage.setItem("master_cv_text", cvText);
        alert("Profile and Master CV saved successfully!");
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file.');
            return;
        }

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
            alert('CV text extracted successfully! Please review it below.');
        } catch (error: any) {
            console.error('PDF Extraction failed:', error);
            alert('Failed to extract PDF: ' + error.message);
        } finally {
            setIsExtracting(false);
            // Reset input
            event.target.value = '';
        }
    };

    const handleCancel = () => {
        setEditedUser(user);
        setIsEditing(false);
    };

    const handleLogout = () => {
        // Mock logout - in real app this would clear tokens and redirect
        console.log("Logging out...");
        alert("Logged out successfully (Mock)");
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="space-y-2 mb-8">
                    <h1 className="text-3xl font-bold text-primary">Your Profile</h1>
                    <p className="text-slate-600">
                        Manage your personal details and master CV.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* User Details Card */}
                    <div className="bg-white rounded-xl p-8 border-2 border-blue-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <button
                                onClick={handleLogout}
                                className="text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Avatar */}
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shrink-0">
                                {user.avatar}
                            </div>

                            {/* Details Form */}
                            <div className="flex-1 space-y-4 w-full">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-primary">Personal Information</h2>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="text-accent hover:text-blue-700 text-sm font-semibold flex items-center gap-1"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                            Edit Details
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleCancel}
                                                className="text-slate-500 hover:text-slate-700 text-sm font-semibold flex items-center gap-1 p-1 px-2 rounded hover:bg-slate-100"
                                            >
                                                <X className="w-3 h-3" />
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                className="text-green-600 hover:text-green-700 text-sm font-semibold flex items-center gap-1 p-1 px-2 rounded hover:bg-green-50"
                                            >
                                                <Save className="w-3 h-3" />
                                                Save
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid gap-4">
                                    {/* Name */}
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Full Name
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedUser.name}
                                                onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-primary"
                                            />
                                        ) : (
                                            <p className="text-lg font-semibold text-primary">{user.name}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            Email Address
                                        </label>
                                        <p className="text-lg font-semibold text-slate-700 opacity-80 cursor-not-allowed" title="Email cannot be changed">
                                            {user.email}
                                        </p>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            WhatsApp Number
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={editedUser.phone}
                                                onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                                                placeholder="+27..."
                                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-primary"
                                            />
                                        ) : (
                                            <p className="text-lg font-semibold text-primary">{user.phone}</p>
                                        )}
                                        <p className="text-xs text-slate-400">Used for WhatsApp notifications</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Master CV Section */}
                    <div className="space-y-6 pt-6 border-t border-slate-200">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-primary">Master CV Profile</h2>
                            <p className="text-slate-600 text-sm">
                                Upload an existing CV, create one from scratch, or paste your details.
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
                                <button className="px-4 py-2 rounded-lg bg-slate-50 group-hover:bg-blue-50 text-blue-600 text-xs font-medium transition-all border border-blue-100 group-hover:border-blue-200">
                                    {isExtracting ? 'Please wait' : 'Choose File'}
                                </button>
                            </div>

                            {/* Create from Scratch Section */}
                            {/* Create from Scratch Section */}
                            <Link href="/profile/create" className="border-2 border-dashed border-purple-200 bg-white rounded-xl p-6 text-center hover:border-purple-400 transition-all flex flex-col items-center justify-center group cursor-pointer">
                                <Sparkles className="w-8 h-8 mb-3 text-purple-400 group-hover:text-purple-600 transition-colors" />
                                <h3 className="text-md font-semibold text-primary mb-1">Create from Scratch</h3>
                                <p className="text-xs text-slate-500 mb-3">
                                    Don't have a CV?
                                </p>
                                <button className="px-4 py-2 rounded-lg bg-slate-50 group-hover:bg-purple-50 text-purple-600 text-xs font-medium transition-all border border-purple-100 group-hover:border-purple-200">
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
                                {cvText && (
                                    <span className="text-xs text-green-600 font-medium animate-pulse">
                                        Content active
                                    </span>
                                )}
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
                                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <Save className="w-4 h-4" />
                                Save Master Profile
                            </button>
                            <button
                                onClick={() => setCvText("")}
                                className="px-6 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-primary transition-all border border-slate-200 text-sm"
                            >
                                Clear
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 text-sm text-slate-700">
                            <strong className="text-primary">💡 Tip:</strong> Include all your skills, experiences, projects, and achievements. The AI will select the most relevant ones for each job application.
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
