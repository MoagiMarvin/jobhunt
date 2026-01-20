import { User, Building2, Phone, Mail, Trash2 } from "lucide-react";

interface ReferenceCardProps {
    name: string;
    relationship: string;
    company: string;
    phone?: string;
    email?: string;
    onDelete?: () => void;
    isOwner?: boolean;
}

export default function ReferenceCard({
    name,
    relationship,
    company,
    phone,
    email,
    onDelete,
    isOwner = true
}: ReferenceCardProps) {
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
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <User className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-2">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">{name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{relationship} at <span className="text-blue-600">{company}</span></p>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-1">
                        {phone && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-semibold">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {phone}
                            </div>
                        )}
                        {email && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-semibold">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {email}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
