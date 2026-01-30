import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import ItemActionMenu from "./ItemActionMenu";

interface ProjectCardProps {
    title: string;
    description: string;
    technologies: string[];
    link_url?: string;
    github_url?: string;
    image_url?: string;
    onDelete?: () => void;
    onEdit?: () => void;
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
    onEdit,
    isOwner = true
}: ProjectCardProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md overflow-hidden group flex flex-col sm:flex-row">
            {/* Project Image - More compact side-by-side on desktop */}
            {image_url && (
                <div className="relative w-full sm:w-1/3 h-28 sm:h-auto min-h-[100px] sm:min-h-[120px] bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden shrink-0">
                    <Image
                        src={image_url}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                </div>
            )}

            {/* Content */}
            <div className={`p-3 sm:p-5 flex-1 flex flex-col justify-between relative ${!image_url ? "w-full" : ""}`}>
                <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <h3 className="text-[13px] md:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{title}</h3>
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
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight">{description}</p>
                </div>

                <div className="mt-3 space-y-2.5">
                    {/* Tech Stack - More compact */}
                    <div className="flex flex-wrap gap-1">
                        {technologies.slice(0, 4).map((tech, idx) => (
                            <span
                                key={idx}
                                className="px-1.5 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-semibold rounded border border-slate-100"
                            >
                                {tech}
                            </span>
                        ))}
                        {technologies.length > 4 && (
                            <span className="text-[9px] font-bold text-slate-400">+{technologies.length - 4}</span>
                        )}
                    </div>

                    {/* Links - Compact footer */}
                    {(link_url || github_url) && (
                        <div className="flex gap-3 items-center">
                            {link_url && (
                                <a
                                    href={link_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[9px] font-bold text-blue-600 hover:underline"
                                >
                                    <ExternalLink className="w-2.5 h-2.5" />
                                    LIVE
                                </a>
                            )}
                            {github_url && (
                                <a
                                    href={github_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[9px] font-bold text-blue-600 hover:underline"
                                >
                                    <Github className="w-2.5 h-2.5" />
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
