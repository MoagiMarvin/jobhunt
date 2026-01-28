import React from 'react';

interface MinimalistCVPreviewProps {
    cv?: any;
    profileData?: any;
    data?: any;
}

export default function MinimalistCVPreview({ cv, profileData, data }: MinimalistCVPreviewProps) {
    // Standardize data source
    const info = data || profileData || {};
    const resume = data || cv || {};

    // Standardize individual sections
    const user = info.user || info.personalInfo || resume.personalInfo || {};
    const summary = resume.summary || user.summary || "";
    const skills = resume.skills || info.skills || [];
    const experiences = resume.experiences || resume.experience || info.experiences || info.experience || [];
    const educationArr = info.educationList || resume.education || [];
    const certs = info.certificationsList || (info.credentials?.filter((c: any) => c.type === 'certification')) || [];
    const languagesArr = info.languages || [];
    const referencesArr = info.references || [];
    const projectsArr = info.projectsList || info.projects || [];
    const matricData = info.matricData || info.matric;

    return (
        <div className="w-full max-w-[210mm] bg-white text-black shadow-2xl rounded-sm border border-slate-300 p-10 space-y-4 text-left">
            {/* Header */}
            <div className="border-b border-slate-300 pb-4">
                <h1 className="text-2xl font-bold text-black uppercase tracking-wide">
                    {user.name || user.fullName || "Your Name"}
                </h1>
                <p className="text-sm text-black font-bold uppercase tracking-wide mt-1">
                    {user.headline || user.title || "Professional"}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-black mt-2">
                    <span>{user.email}</span>
                    {user.phone && (
                        <>
                            <span>•</span>
                            <span>{user.phone}</span>
                        </>
                    )}
                    {user.location && (
                        <>
                            <span>•</span>
                            <span>{user.location}</span>
                        </>
                    )}
                </div>
                {(user.haveLicense || user.haveCar) && (
                    <div className="flex gap-2 text-xs text-black mt-1">
                        {user.haveLicense && (
                            <span>Driver's License: {user.licenseCode || 'Yes'}</span>
                        )}
                        {user.haveLicense && user.haveCar && <span>•</span>}
                        {user.haveCar && <span>Own Transport: Yes</span>}
                    </div>
                )}
            </div>

            {/* Professional Summary */}
            {summary && (
                <div>
                    <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2 tracking-wide text-black">
                        Professional Summary
                    </h2>
                    <p className="text-xs leading-relaxed text-black">{summary}</p>
                </div>
            )}


            {/* Technical Skills - Grouped by Category */}
            {skills.filter((s: any) => !(s.isSoftSkill || s.category === 'Soft Skills')).length > 0 && (
                <div>
                    <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2 tracking-wide text-black">
                        Technical Skills
                    </h2>
                    <div className="space-y-1">
                        {Object.entries(skills
                            .filter((s: any) => !(s.isSoftSkill || s.category === 'Soft Skills'))
                            .reduce((acc: any, skill: any) => {
                                // Normalize skill object
                                const skillObj = typeof skill === 'string'
                                    ? { name: skill, category: "Other" }
                                    : skill;

                                const category = skillObj.category || "Other";
                                if (!acc[category]) acc[category] = [];
                                acc[category].push(skillObj.name || skillObj.skill);
                                return acc;
                            }, {})).map(([category, categorySkills]: [string, any], i: number) => (
                                <div key={i} className="text-xs text-black">
                                    <span className="font-bold">{category}: </span>
                                    <span>{categorySkills.join(", ")}</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Soft Skills - Separated */}
            {skills.filter((s: any) => s.isSoftSkill || s.category === 'Soft Skills').length > 0 && (
                <div>
                    <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2 tracking-wide text-black">
                        Soft Skills
                    </h2>
                    <div className="space-y-1">
                        {skills
                            .filter((s: any) => s.isSoftSkill || s.category === 'Soft Skills')
                            .map((s: any, i: number) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-black">
                                    <span className="w-2">•</span>
                                    <span className="flex-1">{typeof s === 'string' ? s : (s.name || s.skill)}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}


            {/* Experience */}
            {experiences.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2 tracking-wide text-black">
                        Professional Experience
                    </h2>
                    {experiences.map((exp: any, i: number) => {
                        // Determine bullets: prefer bulletPoints array, fallback to description split by newline
                        const bullets = (exp.bulletPoints && exp.bulletPoints.length > 0)
                            ? exp.bulletPoints
                            : (exp.description ? exp.description.split('\n').filter((line: string) => line.trim().length > 0) : []);

                        return (
                            <div key={i} className="mb-3">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold text-xs text-black">{exp.role || exp.title}</h3>
                                    <span className="text-xs font-bold text-black">{exp.duration || exp.dates}</span>
                                </div>
                                <p className="text-xs text-black mb-1">{exp.company}</p>
                                <ul className="list-none space-y-1">
                                    {bullets.map((bullet: string, j: number) => (
                                        <li key={j} className="text-xs text-black leading-normal flex items-start gap-2 ml-2">
                                            <span>•</span>
                                            <span className="flex-1">{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            )}


            {/* Projects */}
            {projectsArr.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2 tracking-wide text-black">
                        Key Projects
                    </h2>
                    {projectsArr.slice(0, 3).map((project: any, i: number) => (
                        <div key={i} className="mb-2">
                            <h3 className="font-bold text-xs text-black">{project.title}</h3>
                            <p className="text-xs text-black flex items-start gap-2 ml-2">
                                <span>•</span>
                                <span className="flex-1">{project.description}</span>
                            </p>
                            {project.technologies && project.technologies.length > 0 && (
                                <p className="text-xs font-bold text-black ml-4 mt-0.5">
                                    Tools Used: {Array.isArray(project.technologies) ? project.technologies.join(", ") : project.technologies}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}


            {/* Education */}
            <div>
                <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2 tracking-wide text-black">
                    Education
                </h2>
                {educationArr.map((edu: any, i: number) => (
                    <div key={i} className="mb-2">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-bold text-xs text-black">{edu.degree || edu.title}</h3>
                            <span className="text-xs font-bold text-black">{edu.year || edu.date}</span>
                        </div>
                        <p className="text-xs text-black">{edu.school || edu.issuer}</p>
                    </div>
                ))}
                {matricData && (
                    <div className="mb-2">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-bold text-xs text-black">Matric</h3>
                            <span className="text-xs font-bold text-black">
                                Class of {matricData.completionYear}
                            </span>
                        </div>
                        <p className="text-xs text-black">{matricData.schoolName}</p>
                    </div>
                )}
            </div>


            {/* Certifications */}
            {certs.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2 tracking-wide text-black">
                        Certifications &amp; Awards
                    </h2>
                    {certs.map((cert: any, i: number) => (
                        <div key={i} className="mb-2">
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-xs text-black">{cert.title || cert.name}</h3>
                                <span className="text-xs font-bold text-black">{cert.date}</span>
                            </div>
                            <p className="text-xs text-black">{cert.issuer}</p>
                        </div>
                    ))}
                </div>
            )}


            {/* Languages */}
            {languagesArr.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2 tracking-wide text-black">
                        Languages
                    </h2>
                    <div className="flex flex-wrap gap-2 text-xs text-black">
                        {languagesArr.map((lang: any, i: number) => (
                            <span key={i}>
                                {typeof lang === 'string' ? lang : (lang.language || lang.name)}
                                {(lang.proficiency || lang.level) && ` (${lang.proficiency || lang.level})`}
                                {i < languagesArr.length - 1 ? ' •' : ''}
                            </span>
                        ))}
                    </div>
                </div>
            )}


            {/* References */}
            {referencesArr.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2 tracking-wide text-black">
                        Professional References
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {referencesArr.map((ref: any, i: number) => (
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
