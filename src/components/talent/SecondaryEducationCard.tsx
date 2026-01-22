import { School, Trash2 } from "lucide-react";

interface SecondaryEducationCardProps {
    schoolName: string;
    completionYear: number;
    onDelete?: () => void;
    isOwner?: boolean;
}

export default function SecondaryEducationCard({
    schoolName,
    completionYear,
    onDelete,
    isOwner = true
}: SecondaryEducationCardProps) {
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
