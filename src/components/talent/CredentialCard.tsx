import { Award, GraduationCap, FileCheck } from "lucide-react";
import ItemActionMenu from "./ItemActionMenu";

interface CredentialCardProps {
    type: "education" | "certification";
    title: string;
    issuer: string;
    date: string;
    qualification_level?: string;
    document_url?: string;
    viewerRole?: "public" | "recruiter" | "owner";
    onDelete?: () => void;
    onEdit?: () => void;
    isOwner?: boolean;
}

export default function CredentialCard({
    type,
    title,
    issuer,
    date,
    qualification_level,
    document_url,
    viewerRole = "owner",
    onDelete,
    onEdit,
    isOwner = true
}: CredentialCardProps) {
    const Icon = type === "education" ? GraduationCap : Award;
    const canViewDocument = viewerRole === "recruiter" || viewerRole === "owner";

    return (
        <div className="bg-white rounded-xl border border-slate-200 hover:border-blue-200 transition-all shadow-sm p-4 md:p-5 group relative">
            <div className="flex gap-3 md:gap-4">
                {/* Icon */}
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0 bg-blue-500 shadow-sm mt-1">
                    <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-[13px] md:text-sm font-semibold text-slate-800 leading-tight">{title}</h3>
                                {qualification_level && (
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md font-bold text-[9px] border border-blue-100 whitespace-nowrap">
                                        {qualification_level}
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">{issuer}</p>
                        </div>
                        {isOwner && (
                            <div className="shrink-0 -mt-1 -mr-1">
                                <ItemActionMenu
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest pt-1">
                        <span>{date}</span>
                    </div>

                    {/* Action Links */}
                    {document_url && (
                        <div className="flex gap-3 pt-1">
                            {canViewDocument ? (
                                <button
                                    onClick={() => window.open(document_url, '_blank')}
                                    className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    <FileCheck className="w-3 h-3" />
                                    View Document
                                </button>
                            ) : (
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600">
                                    <FileCheck className="w-3 h-3" />
                                    Document Verified
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
