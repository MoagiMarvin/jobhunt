"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Sparkles, User, Mail, Phone, LogOut, Edit2, Save, X, Loader2, Briefcase, GraduationCap, FolderKanban, Plus } from "lucide-react";
import Link from "next/link";
import ProfileHeader from "@/components/talent/ProfileHeader";
import ProjectCard from "@/components/talent/ProjectCard";
import CredentialCard from "@/components/talent/CredentialCard";
import EditProfileModal from "@/components/talent/EditProfileModal";
import AddSkillModal from "@/components/talent/AddSkillModal";
import AddCredentialModal from "@/components/talent/AddCredentialModal";
import AddProjectModal from "@/components/talent/AddProjectModal";

export default function ProfilePage() {
    const [cvText, setCvText] = useState("");
    const [activeTab, setActiveTab] = useState<"cv" | "talent">("talent");

    const [user, setUser] = useState({
        name: "Moagi Marvin",
        email: "moagi@example.com",
        phone: "+27 61 234 5678",
        avatar: "MM",
        headline: "Computer Science Graduate | Full-Stack Developer",
        location: "Johannesburg, South Africa",
        availabilityStatus: "Actively Looking" as "Actively Looking" | "Open to Offers" | "Not Looking"
    });

    const [skills, setSkills] = useState(["React", "TypeScript", "Python", "Google Cloud", "AWS", "Node.js", "TailwindCSS"]);

    // Mock Talent Profile Data
    const [projects] = useState([
        {
            title: "AI CV Optimizer",
            description: "Built with Next.js and Gemini AI to help students optimize their career paths.",
            technologies: ["Next.js", "Gemini AI", "Tailwind"],
            github_url: "https://github.com",
            image_url: "/mock/cv-project.jpg"
        },
        {
            title: "Talent Marketplace",
            description: "A platform for connecting verified graduates with recruiters in South Africa.",
            technologies: ["React", "Supabase", "TypeScript"],
            link_url: "https://talent.example.com",
            image_url: "/mock/talent-project.jpg"
        },
        {
            title: "Portfolio Website",
            description: "Personal portfolio showcasing modern design and clean animations.",
            technologies: ["Framer Motion", "React", "PostCSS"],
            github_url: "https://github.com"
        },
        {
            title: "E-commerce App",
            description: "Mobile-first electronics store for local businesses.",
            technologies: ["ReactNative", "Stripe", "Firebase"],
            image_url: "/mock/shop.jpg"
        }
    ]);

    const [education] = useState([
        {
            title: "BSc Computer Science",
            issuer: "University of Johannesburg",
            date: "2021 - 2024",
            grade: "Distinction (85%)",
            document_url: "/mock/degree.pdf",
            isVerified: true
        }
    ]);

    const [certifications] = useState([
        {
            title: "Google Cloud Professional Developer",
            issuer: "Google Cloud",
            date: "January 2024",
            credential_url: "https://cloud.google.com/certification",
            document_url: "/mock/google-cert.pdf",
            isVerified: true
        },
        {
            title: "AWS Certified Solutions Architect",
            issuer: "Amazon Web Services",
            date: "November 2023",
            credential_url: "https://aws.amazon.com/certification",
            document_url: "/mock/aws-cert.pdf",
            isVerified: true
        }
    ]);

    const [isEditing, setIsEditing] = useState(false);
    const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
    const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
    const [isAddCredentialOpen, setIsAddCredentialOpen] = useState<{ open: boolean, type: "education" | "certification" }>({ open: false, type: "education" });

    const [isExtracting, setIsExtracting] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);
    const [editedUser, setEditedUser] = useState(user);

    // Education State
    const [educationList, setEducationList] = useState(education);
    // Certs State
    const [certificationsList, setCertificationsList] = useState(certifications);
    // Projects State
    const [projectsList, setProjectsList] = useState(projects);
    const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);

    // Load user and CV text on mount
    useEffect(() => {
        const savedCv = localStorage.getItem("master_cv_text");
        if (savedCv) setCvText(savedCv);

        const savedUser = localStorage.getItem("user_details");
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
            setEditedUser(parsed);
        }
    }, []);

    const handleSave = () => {
        setUser(editedUser);
        setIsEditing(false);
        // Persist to localStorage
        localStorage.setItem("master_cv_text", cvText);
        localStorage.setItem("user_details", JSON.stringify(editedUser));
        alert("Profile and Master CV saved successfully!");
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
            if (data.error) throw new Error(`${data.error} (${data.details || 'No details'})`);

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
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* New Profile Header */}
                <div className="mb-8">
                    <ProfileHeader
                        name={user.name}
                        headline={user.headline}
                        email={user.email}
                        phone={user.phone}
                        location={user.location}
                        avatar={user.avatar}
                        availabilityStatus={user.availabilityStatus}
                        onEdit={() => setIsEditing(true)}
                        onDownloadResume={() => alert("Downloading formatted resume... (This will be PDF generation)")}
                        isOwner={true}
                    />
                </div>

                {/* Tab Navigation & Logout */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 flex gap-2 bg-white rounded-xl p-2 border-2 border-blue-100 shadow-sm">
                        <button
                            onClick={() => setActiveTab("talent")}
                            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === "talent"
                                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                                : "text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            <Briefcase className="w-4 h-4" />
                            Talent Profile
                        </button>
                        <button
                            onClick={() => setActiveTab("cv")}
                            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === "cv"
                                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                                : "text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            Master CV
                        </button>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-3 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 border-2 border-slate-100 hover:border-red-100 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>

                {/* Talent Profile Tab */}
                {activeTab === "talent" && (
                    <div className="space-y-8">
                        {/* Projects Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FolderKanban className="w-6 h-6 text-blue-600" />
                                    <h2 className="text-2xl font-bold text-primary">Projects</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        if (projectsList.length >= 4) {
                                            alert("Maximum of 4 projects allowed for a focused profile.");
                                        } else {
                                            setIsAddProjectOpen(true);
                                        }
                                    }}
                                    disabled={projectsList.length >= 4}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${projectsList.length >= 4
                                        ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                                        : "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                                        }`}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Project {projectsList.length >= 4 && "(Limit Reached)"}
                                </button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {projectsList.slice(0, isProjectsExpanded ? undefined : 2).map((project, idx) => (
                                    <ProjectCard
                                        key={idx}
                                        {...project}
                                        onDelete={() => setProjectsList(projectsList.filter((_, i) => i !== idx))}
                                        isOwner={true}
                                    />
                                ))}
                            </div>
                            {projectsList.length > 2 && (
                                <button
                                    onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                                    className="w-full py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                >
                                    {isProjectsExpanded ? "Show Less" : `Show More (${projectsList.length - 2} more)`}
                                </button>
                            )}
                        </div>

                        {/* Skills Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-purple-600" />
                                    <h2 className="text-2xl font-bold text-primary">Skills</h2>
                                </div>
                                <button
                                    onClick={() => setIsAddSkillOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 text-xs font-bold hover:bg-purple-100 transition-all border border-purple-200"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Skill
                                </button>
                            </div>
                            <div className="bg-white rounded-xl border-2 border-slate-100 p-6 shadow-sm">
                                <div className="flex flex-wrap gap-3">
                                    {skills.map((skill, idx) => (
                                        <div
                                            key={idx}
                                            className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-primary text-sm font-semibold rounded-xl border border-blue-100 flex items-center gap-2 group cursor-default"
                                        >
                                            {skill}
                                            <button
                                                onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Education Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="w-6 h-6 text-blue-600" />
                                    <h2 className="text-2xl font-bold text-primary">Education</h2>
                                </div>
                                <button
                                    onClick={() => setIsAddCredentialOpen({ open: true, type: "education" })}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-all border border-blue-200"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Education
                                </button>
                            </div>
                            <div className="space-y-4">
                                {educationList.map((edu, idx) => (
                                    <CredentialCard
                                        key={idx}
                                        type="education"
                                        title={edu.title}
                                        issuer={edu.issuer}
                                        date={edu.date}
                                        grade={edu.grade}
                                        document_url={edu.document_url}
                                        isVerified={edu.isVerified}
                                        viewerRole="owner"
                                        onDelete={() => setEducationList(educationList.filter((_, i) => i !== idx))}
                                        isOwner={true}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Certifications Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-6 h-6 text-blue-600" />
                                    <h2 className="text-2xl font-bold text-primary">Certifications</h2>
                                </div>
                                <button
                                    onClick={() => setIsAddCredentialOpen({ open: true, type: "certification" })}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-all border border-blue-200"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Certification
                                </button>
                            </div>
                            <div className="space-y-4">
                                {certificationsList.map((cert, idx) => (
                                    <CredentialCard
                                        key={idx}
                                        type="certification"
                                        title={cert.title}
                                        issuer={cert.issuer}
                                        date={cert.date}
                                        credential_url={cert.credential_url}
                                        document_url={cert.document_url}
                                        isVerified={cert.isVerified}
                                        viewerRole="owner"
                                        onDelete={() => setCertificationsList(certificationsList.filter((_, i) => i !== idx))}
                                        isOwner={true}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Master CV Tab */}
                {activeTab === "cv" && (
                    <div className="space-y-8">
                        {/* Master CV Section */}
                        <div className="space-y-6">
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
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleClean}
                                            disabled={isCleaning || !cvText}
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
                )}
            </div>

            <EditProfileModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                onSave={(newData) => {
                    setUser(newData);
                    setIsEditing(false);
                    // Mock persist
                    localStorage.setItem("user_details", JSON.stringify(newData));
                    alert("Profile updated successfully!");
                }}
                initialData={user}
            />
            <AddSkillModal
                isOpen={isAddSkillOpen}
                onClose={() => setIsAddSkillOpen(false)}
                onAdd={(skill) => {
                    setSkills([...skills, skill]);
                    setIsAddSkillOpen(false);
                }}
            />

            <AddCredentialModal
                isOpen={isAddCredentialOpen.open}
                type={isAddCredentialOpen.type}
                onClose={() => setIsAddCredentialOpen({ ...isAddCredentialOpen, open: false })}
                onAdd={(newCredential) => {
                    if (isAddCredentialOpen.type === "education") {
                        setEducationList([...educationList, newCredential]);
                    } else {
                        setCertificationsList([...certificationsList, newCredential]);
                    }
                    setIsAddCredentialOpen({ ...isAddCredentialOpen, open: false });
                }}
            />

            <AddProjectModal
                isOpen={isAddProjectOpen}
                onClose={() => setIsAddProjectOpen(false)}
                onAdd={(newProject) => {
                    setProjectsList([...projectsList, newProject]);
                    setIsAddProjectOpen(false);
                }}
            />
        </main>
    );
}
