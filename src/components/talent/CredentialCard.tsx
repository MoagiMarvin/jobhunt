import { Award, GraduationCap, FileCheck, ExternalLink, Trash2 } from "lucide-react";

interface CredentialCardProps {
    type: "education" | "certification";
    title: string;
    issuer: string;
    date: string;
    grade?: string;
    credential_url?: string;
    document_url?: string;
    isVerified?: boolean;
    viewerRole?: "public" | "recruiter" | "owner";
    onDelete?: () => void;
    isOwner?: boolean;
}

export default function CredentialCard({
    type,
    title,
    issuer,
    date,
    grade,
    credential_url,
    document_url,
    isVerified = false,
    viewerRole = "owner",
    onDelete,
    isOwner = true
}: CredentialCardProps) {
    const Icon = type === "education" ? GraduationCap : Award;
    const canViewDocument = viewerRole === "recruiter" || viewerRole === "owner";

    return (
        <div className="bg-white rounded-xl border border-slate-200 hover:border-blue-200 transition-all shadow-sm p-5 group relative">
            {isOwner && onDelete && (
                <button
                    onClick={onDelete}
                    className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
            <div className="flex gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${type === "education"
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                    : "bg-gradient-to-br from-amber-500 to-orange-600"
                    }`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4 pr-8">
                        <div>
                            <h3 className="text-base font-bold text-primary">{title}</h3>
                            <p className="text-sm text-slate-600 font-medium">{issuer}</p>
                        </div>
                        {isVerified && document_url && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-200 shrink-0">
                                <FileCheck className="w-3 h-3" />
                                Verified
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500">
                        <span>{date}</span>
                        {grade && <span className="font-semibold text-blue-600">{grade}</span>}
                    </div>

                    {/* Action Links */}
                    <div className="flex gap-3 pt-2">
                        {credential_url && (
                            <a
                                href={credential_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Verify Online
                            </a>
                        )}
                        {document_url && canViewDocument && (
                            <button
                                onClick={() => window.open(document_url, '_blank')}
                                className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                            >
                                <FileCheck className="w-3.5 h-3.5" />
                                View Document
                            </button>
                        )}
                        {document_url && !canViewDocument && (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                                <FileCheck className="w-3.5 h-3.5" />
                                Document Verified
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
