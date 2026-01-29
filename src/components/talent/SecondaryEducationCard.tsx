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
            {isOwner && (
                <div className="absolute top-4 right-4 z-10">
                    <ItemActionMenu
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                </div>
            )}
            <div className="flex gap-4 mt-4">
                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-lg">
                    <School className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{schoolName}</h3>
                            <p className="text-[11px] text-slate-900 font-bold">Class of {completionYear}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
