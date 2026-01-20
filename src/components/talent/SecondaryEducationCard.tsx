import { School, Award, Trash2, CheckCircle2 } from "lucide-react";

interface SecondaryEducationCardProps {
    schoolName: string;
    completionYear: number;
    subjects?: { subject: string; grade: string }[];
    distinctionsCount?: number;
    onDelete?: () => void;
    isOwner?: boolean;
}

export default function SecondaryEducationCard({
    schoolName,
    completionYear,
    subjects = [],
    distinctionsCount = 0,
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
                            <p className="text-[11px] text-slate-500 font-bold">Class of {completionYear} • {distinctionsCount} Distinctions</p>
                        </div>
                    </div>

                    {subjects.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {subjects.map((sub, idx) => (
                                <div key={idx} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-md flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-slate-700">{sub.subject}</span>
                                    <span className="text-[10px] font-black text-blue-600">{sub.grade}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
