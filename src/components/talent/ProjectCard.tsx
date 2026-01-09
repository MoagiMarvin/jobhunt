import { ExternalLink, Github, Trash2 } from "lucide-react";
import Image from "next/image";

interface ProjectCardProps {
    title: string;
    description: string;
    technologies: string[];
    link_url?: string;
    github_url?: string;
    image_url?: string;
    onDelete?: () => void;
    isOwner?: boolean;
}

export default function ProjectCard({
    title,
    description,
    technologies,
    link_url,
    github_url,
    image_url,
    onDelete,
    isOwner = true
}: ProjectCardProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md overflow-hidden group flex flex-col sm:flex-row">
            {/* Project Image - More compact side-by-side on desktop */}
            {image_url && (
                <div className="relative w-full sm:w-1/3 h-32 sm:h-auto min-h-[120px] bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden shrink-0">
                    <Image
                        src={image_url}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                </div>
            )}

            {/* Content */}
            <div className={`p-4 sm:p-5 flex-1 flex flex-col justify-between ${!image_url ? "w-full" : ""}`}>
                <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-primary group-hover:text-blue-600 transition-colors line-clamp-1">{title}</h3>
                        {isOwner && onDelete && (
                            <button
                                onClick={onDelete}
                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete Project"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{description}</p>
                </div>

                <div className="mt-4 space-y-3">
                    {/* Tech Stack - More compact */}
                    <div className="flex flex-wrap gap-1.5">
                        {technologies.slice(0, 4).map((tech, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-md border border-slate-100"
                            >
                                {tech}
                            </span>
                        ))}
                        {technologies.length > 4 && (
                            <span className="text-[10px] font-bold text-slate-400">+{technologies.length - 4}</span>
                        )}
                    </div>

                    {/* Links - Compact footer */}
                    {(link_url || github_url) && (
                        <div className="flex gap-4 items-center">
                            {link_url && (
                                <a
                                    href={link_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    LIVE
                                </a>
                            )}
                            {github_url && (
                                <a
                                    href={github_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:underline"
                                >
                                    <Github className="w-3 h-3" />
                                    CODE
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
