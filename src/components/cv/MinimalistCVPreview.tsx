import React from 'react';

interface MinimalistCVPreviewProps {
    cv: any;
    profileData: any;
}

export default function MinimalistCVPreview({ cv, profileData }: MinimalistCVPreviewProps) {
    return (
        <div className="w-full max-w-[210mm] bg-white text-black shadow-2xl rounded-sm overflow-hidden border border-slate-300 p-10 space-y-4 text-left">
            {/* Header */}
            <div className="border-b border-slate-300 pb-4">
                <h1 className="text-2xl font-bold text-black uppercase tracking-wide">
                    {cv.personalInfo?.name || profileData?.personalInfo?.fullName || profileData?.personalInfo?.name}
                </h1>
                <p className="text-sm text-black font-bold uppercase tracking-wide mt-1">
                    {cv.personalInfo?.title || profileData?.personalInfo?.headline || "Professional"}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-black mt-2">
                    <span>{cv.personalInfo?.email || profileData?.personalInfo?.email}</span>
                    <span>•</span>
                    <span>{cv.personalInfo?.phone || profileData?.personalInfo?.phone}</span>
                    <span>•</span>
                    <span>{cv.personalInfo?.location || profileData?.personalInfo?.location}</span>
                </div>
                {(profileData?.personalInfo?.haveLicense || profileData?.personalInfo?.haveCar) && (
                    <div className="flex gap-2 text-xs text-black mt-1">
                        {profileData?.personalInfo?.haveLicense && (
                            <span>Driver's License: {profileData?.personalInfo?.licenseCode || 'Yes'}</span>
                        )}
                        {profileData?.personalInfo?.haveLicense && profileData?.personalInfo?.haveCar && <span>•</span>}
                        {profileData?.personalInfo?.haveCar && <span>Own Transport: Yes</span>}
                    </div>
                )}
            </div>

            {/* Professional Summary */}
            {cv.summary && (
                <div>
                    <h2 className="text-sm font-bold uppercase bg-slate-50 px-2 py-1 border-l-[3px] border-black text-black tracking-wide mb-2">
                        Professional Summary
                    </h2>
                    <p className="text-xs leading-relaxed text-black">{cv.summary}</p>
                </div>
            )}

            {/* Skills */}
            {cv.skills?.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold uppercase bg-slate-50 px-2 py-1 border-l-[3px] border-black text-black tracking-wide mb-2">
                        Skills &amp; Expertise
                    </h2>
                    <div className="space-y-1">
                        {cv.skills.map((skill: string, i: number) => (
                            <div key={i} className="flex items-start gap-2">
                                <span className="text-xs text-black w-2">•</span>
                                <span className="text-xs text-black flex-1">{skill}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Experience */}
            {cv.experience?.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold uppercase bg-slate-50 px-2 py-1 border-l-[3px] border-black text-black tracking-wide mb-2">
                        Professional Experience
                    </h2>
                    {cv.experience.map((exp: any, i: number) => (
                        <div key={i} className="mb-3">
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-xs text-black">{exp.role}</h3>
                                <span className="text-xs font-bold text-black">{exp.dates}</span>
                            </div>
                            <p className="text-xs text-black mb-1">{exp.company}</p>
                            <ul className="list-none space-y-1">
                                {exp.bulletPoints?.map((bullet: string, j: number) => (
                                    <li key={j} className="text-xs text-black leading-normal flex items-start gap-2 ml-2">
                                        <span>•</span>
                                        <span className="flex-1">{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {/* Projects */}
            {profileData?.projects?.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold uppercase bg-slate-50 px-2 py-1 border-l-[3px] border-black text-black tracking-wide mb-2">
                        Key Projects
                    </h2>
                    {profileData.projects.slice(0, 3).map((project: any, i: number) => (
                        <div key={i} className="mb-2">
                            <h3 className="font-bold text-xs text-black">{project.title}</h3>
                            <p className="text-xs text-black flex items-start gap-2 ml-2">
                                <span>•</span>
                                <span className="flex-1">{project.description}</span>
                            </p>
                            <p className="text-xs font-bold text-black ml-4 mt-0.5">
                                Built with: {project.technologies?.join(", ")}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Education */}
            <div>
                <h2 className="text-sm font-bold uppercase bg-slate-50 px-2 py-1 border-l-[3px] border-black text-black tracking-wide mb-2">
                    Education
                </h2>
                {cv.education?.map((edu: any, i: number) => (
                    <div key={i} className="mb-2">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-bold text-xs text-black">{edu.degree}</h3>
                            <span className="text-xs font-bold text-black">{edu.year}</span>
                        </div>
                        <p className="text-xs text-black">{edu.school}</p>
                    </div>
                ))}
                {profileData?.matric && (
                    <div className="mb-2">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-bold text-xs text-black">Matric</h3>
                            <span className="text-xs font-bold text-black">
                                Class of {profileData.matric.completionYear}
                            </span>
                        </div>
                        <p className="text-xs text-black">{profileData.matric.schoolName}</p>
                    </div>
                )}
            </div>

            {/* Certifications */}
            {profileData?.credentials?.filter((c: any) => c.type === 'certification').length > 0 && (
                <div>
                    <h2 className="text-sm font-bold uppercase bg-slate-50 px-2 py-1 border-l-[3px] border-black text-black tracking-wide mb-2">
                        Certifications &amp; Awards
                    </h2>
                    {profileData.credentials.filter((c: any) => c.type === 'certification').map((cert: any, i: number) => (
                        <div key={i} className="mb-2">
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-xs text-black">{cert.title}</h3>
                                <span className="text-xs font-bold text-black">{cert.date}</span>
                            </div>
                            <p className="text-xs text-black">{cert.issuer}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Languages */}
            {profileData?.languages?.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold uppercase bg-slate-50 px-2 py-1 border-l-[3px] border-black text-black tracking-wide mb-2">
                        Languages
                    </h2>
                    <div className="flex flex-wrap gap-2 text-xs text-black">
                        {profileData.languages.map((lang: any, i: number) => (
                            <span key={i}>
                                {lang.language} ({lang.proficiency}){i < profileData.languages.length - 1 ? ' •' : ''}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* References */}
            {profileData?.references?.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold uppercase bg-slate-50 px-2 py-1 border-l-[3px] border-black text-black tracking-wide mb-2">
                        Professional References
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {profileData.references.map((ref: any, i: number) => (
                            <div key={i}>
                                <p className="text-xs font-bold text-black">{ref.name}</p>
                                <p className="text-xs text-slate-800">{ref.relationship} at {ref.company}</p>
                                <p className="text-xs text-slate-800">{ref.email} | {ref.phone}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
