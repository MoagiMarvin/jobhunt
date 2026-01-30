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
        <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 p-4 md:p-6 shadow-sm group relative hover:border-blue-200 transition-all">
            <div className="flex gap-3 md:gap-4">
                {/* Icon */}
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-700 flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                    <School className="w-4 h-4 md:w-5 md:h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h3 className="text-[13px] md:text-sm font-semibold text-slate-800 uppercase tracking-tight leading-tight">{schoolName}</h3>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">Class of {completionYear}</p>
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
