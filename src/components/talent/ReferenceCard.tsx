import { User, Phone, Mail } from "lucide-react";
import ItemActionMenu from "./ItemActionMenu";

interface ReferenceCardProps {
    name: string;
    relationship: string;
    company: string;
    phone?: string;
    email?: string;
    onDelete?: () => void;
    onEdit?: () => void;
    isOwner?: boolean;
}

export default function ReferenceCard({
    name,
    relationship,
    company,
    phone,
    email,
    onDelete,
    onEdit,
    isOwner = true
}: ReferenceCardProps) {
    return (
        <div className="group relative bg-white rounded-xl border border-slate-100 p-5 hover:border-blue-200 hover:shadow-md transition-all">
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-1">
                    <User className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 leading-tight">{name}</h3>
                            <p className="text-xs text-slate-500 font-medium">{relationship} at <span className="text-blue-600">{company}</span></p>
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
