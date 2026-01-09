"use client";

import { Award, GraduationCap, FileCheck, ExternalLink } from "lucide-react";

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
    viewerRole = "owner"
}: CredentialCardProps) {
    const Icon = type === "education" ? GraduationCap : Award;
    const canViewDocument = viewerRole === "recruiter" || viewerRole === "owner";

    return (
        <div className="bg-white rounded-xl border-2 border-slate-100 hover:border-blue-200 transition-all shadow-sm p-6 group">
            <div className="flex gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${type === "education"
                        ? "bg-gradient-to-br from-blue-500 to-purple-600"
                        : "bg-gradient-to-br from-amber-500 to-orange-600"
                    }`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-primary">{title}</h3>
                            <p className="text-sm text-slate-600 font-medium">{issuer}</p>
                        </div>
                        {isVerified && document_url && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                                <FileCheck className="w-3.5 h-3.5" />
                                Verified
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
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
