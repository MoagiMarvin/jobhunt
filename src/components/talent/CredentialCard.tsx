import { Award, GraduationCap, FileCheck, ExternalLink, Trash2 } from "lucide-react";

interface CredentialCardProps {
    type: "education" | "certification";
    title: string;
    issuer: string;
    date: string;
    grade?: string;
    qualification_level?: string;
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
    qualification_level,
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
            <div className="flex gap-3">
                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-500 to-blue-700`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1.5">
                    <div className="flex items-start justify-between gap-4 pr-8">
                        <div>
                            <h3 className="text-sm font-bold text-primary leading-tight">{title}</h3>
                            <p className="text-[11px] text-slate-600 font-medium">{issuer}</p>
                        </div>
                        {/* Removed Verified Badge */}
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span>{date}</span>
                        {grade && <span className="font-semibold text-blue-600">{grade}</span>}
                        {qualification_level && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-bold text-[9px]">
                                {qualification_level}
                            </span>
                        )}
                    </div>

                    {/* Action Links */}
                    <div className="flex gap-3 pt-1">
                        {/* Removed Verify Online Link */}
                        {document_url && canViewDocument && (
                            <button
                                onClick={() => window.open(document_url, '_blank')}
                                className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <FileCheck className="w-3 h-3" />
                                View Document
                            </button>
                        )}
                        {document_url && !canViewDocument && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600">
                                <FileCheck className="w-3 h-3" />
                                Document Verified
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
