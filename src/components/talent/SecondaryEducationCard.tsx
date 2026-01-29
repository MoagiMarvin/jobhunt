import { School } from "lucide-react";
import ItemActionMenu from "./ItemActionMenu";

interface SecondaryEducationCardProps {
    schoolName: string;
    completionYear: number;
    onDelete?: () => void;
    onEdit?: () => void;
    isOwner?: boolean;
}

export default function SecondaryEducationCard({
    schoolName,
    completionYear,
    onDelete,
    onEdit,
    isOwner = true
}: SecondaryEducationCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm group relative hover:border-blue-200 transition-all">
            <div className="flex gap-4">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-lg mt-1">
                    <School className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight leading-tight">{schoolName}</h3>
                            <p className="text-[11px] text-slate-900 font-bold mt-1">Class of {completionYear}</p>
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
                </div>
            </div>
        </div>
    );
}
