"use client";

import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";

interface ProjectCardProps {
    title: string;
    description: string;
    technologies: string[];
    link_url?: string;
    github_url?: string;
    image_url?: string;
}

export default function ProjectCard({
    title,
    description,
    technologies,
    link_url,
    github_url,
    image_url
}: ProjectCardProps) {
    return (
        <div className="bg-white rounded-xl border-2 border-slate-100 hover:border-blue-200 transition-all shadow-sm hover:shadow-md overflow-hidden group">
            {/* Project Image */}
            {image_url && (
                <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
                    <Image
                        src={image_url}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            )}

            {/* Content */}
            <div className="p-6 space-y-4">
                <div>
                    <h3 className="text-lg font-bold text-primary mb-2">{title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-3">{description}</p>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2">
                    {technologies.map((tech, idx) => (
                        <span
                            key={idx}
                            className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100"
                        >
                            {tech}
                        </span>
                    ))}
                </div>

                {/* Links */}
                {(link_url || github_url) && (
                    <div className="flex gap-3 pt-2 border-t border-slate-100">
                        {link_url && (
                            <a
                                href={link_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Live Demo
                            </a>
                        )}
                        {github_url && (
                            <a
                                href={github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-700 transition-colors"
                            >
                                <Github className="w-3.5 h-3.5" />
                                Source Code
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
