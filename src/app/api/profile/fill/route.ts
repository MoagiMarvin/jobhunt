import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
    console.log("Profile Fill: Request received");

    try {
        const { parsedCv, userId } = await req.json();

        if (!parsedCv || !userId) {
            return NextResponse.json({ error: "Missing parsed CV data or user ID." }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log("Profile Fill: Starting database sync for user:", userId);
        console.log("Profile Fill: Received parsedCv data:", JSON.stringify(parsedCv, null, 2));

        // 1. Update Basic Profile Info
        if (parsedCv.personalInfo || parsedCv.summary) {
            const profileUpdate: any = {};

            if (parsedCv.personalInfo) {
                if (parsedCv.personalInfo.name) profileUpdate.full_name = parsedCv.personalInfo.name;
                if (parsedCv.personalInfo.email) profileUpdate.email = parsedCv.personalInfo.email;
                if (parsedCv.personalInfo.phone) profileUpdate.phone = parsedCv.personalInfo.phone;
                if (parsedCv.personalInfo.headline) profileUpdate.headline = parsedCv.personalInfo.headline;
                if (parsedCv.personalInfo.location) profileUpdate.location = parsedCv.personalInfo.location;
            }

            if (parsedCv.summary) {
                profileUpdate.summary = parsedCv.summary;
            }

            if (Object.keys(profileUpdate).length > 0) {
                const { error: profileError } = await supabase
                    .from("profiles")
                    .update(profileUpdate)
                    .eq("id", userId);

                if (profileError) {
                    console.error("Profile update error:", profileError);
                    throw new Error("Failed to update profile info");
                }
                console.log("Profile Fill: Basic info updated");
            }
        }

        // 2. Insert Skills
        if (parsedCv.skills && Array.isArray(parsedCv.skills) && parsedCv.skills.length > 0) {
            // Delete existing skills first
            await supabase.from("skills").delete().eq("user_id", userId);

            const skillsData = parsedCv.skills.map((skill: any) => ({
                user_id: userId,
                name: typeof skill === 'string' ? skill : skill.name,
                category: typeof skill === 'object' ? skill.category : null,
                min_experience_years: typeof skill === 'object' ? skill.minYears : 0,
                is_soft_skill: typeof skill === 'object' ? skill.category === "Soft Skills" : false
            }));

            const { error: skillsError } = await supabase
                .from("skills")
                .insert(skillsData);

            if (skillsError) {
                console.error("Skills insert error:", skillsError);
                throw new Error("Failed to insert skills");
            }
            console.log(`Profile Fill: Inserted ${skillsData.length} skills`);
        }

        // 3. Insert Work Experiences
        if (parsedCv.experiences && Array.isArray(parsedCv.experiences) && parsedCv.experiences.length > 0) {
            // Delete existing experiences first
            await supabase.from("work_experiences").delete().eq("user_id", userId);

            // Helper to convert YYYY-MM to YYYY-MM-DD
            const normalizeDate = (dateStr: string | null): string | null => {
                if (!dateStr) return null;
                // If it's just YYYY-MM, add -01 to make it YYYY-MM-DD
                if (/^\d{4}-\d{2}$/.test(dateStr)) {
                    return `${dateStr}-01`;
                }
                // If it's just YYYY, add -01-01
                if (/^\d{4}$/.test(dateStr)) {
                    return `${dateStr}-01-01`;
                }
                return dateStr;
            };

            const experiencesData = parsedCv.experiences.map((exp: any) => ({
                user_id: userId,
                company: exp.company,
                position: exp.role,
                description: exp.description || "",
                start_date: normalizeDate(exp.start_date),
                end_date: exp.is_current ? null : normalizeDate(exp.end_date),
                is_current: exp.is_current || false
            }));

            const { error: experiencesError } = await supabase
                .from("work_experiences")
                .insert(experiencesData);

            if (experiencesError) {
                console.error("Experiences insert error:", experiencesError);
                throw new Error("Failed to insert work experiences");
            }
            console.log(`Profile Fill: Inserted ${experiencesData.length} work experiences`);
        }

        // 4. Insert Education/Qualifications
        if (parsedCv.education && Array.isArray(parsedCv.education) && parsedCv.education.length > 0) {
            // Delete existing qualifications first
            await supabase.from("qualifications").delete().eq("user_id", userId);

            // Helper to convert YYYY-MM to YYYY-MM-DD
            const normalizeDate = (dateStr: string | null): string | null => {
                if (!dateStr) return null;
                // If it's just YYYY-MM, add -01 to make it YYYY-MM-DD
                if (/^\d{4}-\d{2}$/.test(dateStr)) {
                    return `${dateStr}-01`;
                }
                // If it's just YYYY, add -01-01
                if (/^\d{4}$/.test(dateStr)) {
                    return `${dateStr}-01-01`;
                }
                return dateStr;
            };

            const educationData = parsedCv.education.map((edu: any) => ({
                user_id: userId,
                type: edu.type || 'tertiary',
                title: edu.title,
                institution: edu.institution,
                qualification_level: edu.qualification_level || null,
                year: edu.year || (edu.end_date ? parseInt(edu.end_date.substring(0, 4)) : null),
                start_date: normalizeDate(edu.start_date),
                end_date: normalizeDate(edu.end_date),
                is_verified: false
            }));

            const { error: educationError } = await supabase
                .from("qualifications")
                .insert(educationData);

            if (educationError) {
                console.error("Education insert error:", educationError);
                throw new Error("Failed to insert education");
            }
            console.log(`Profile Fill: Inserted ${educationData.length} education entries`);
        }

        // 5. Insert Experience Bullets (for each experience)
        if (parsedCv.experiences && Array.isArray(parsedCv.experiences) && parsedCv.experiences.length > 0) {
            for (const exp of parsedCv.experiences) {
                if (exp.bullets && Array.isArray(exp.bullets) && exp.bullets.length > 0) {
                    // Find the experience ID that was just created
                    const { data: experiences, error: fetchError } = await supabase
                        .from("work_experiences")
                        .select("id, company, position")
                        .eq("user_id", userId)
                        .eq("company", exp.company)
                        .eq("position", exp.role);

                    if (!fetchError && experiences && experiences.length > 0) {
                        const experienceId = experiences[0].id;

                        const bulletsData = exp.bullets.map((bullet: string) => ({
                            experience_id: experienceId,
                            content: bullet.trim()
                        }));

                        const { error: bulletsError } = await supabase
                            .from("experience_bullets")
                            .insert(bulletsData);

                        if (!bulletsError) {
                            console.log(`Profile Fill: Inserted ${bulletsData.length} bullets for ${exp.company}`);
                        }
                    }
                }
            }
        }

        // 6. Insert Projects
        if (parsedCv.projects && Array.isArray(parsedCv.projects) && parsedCv.projects.length > 0) {
            await supabase.from("projects").delete().eq("user_id", userId);

            const projectsData = parsedCv.projects.map((proj: any) => ({
                user_id: userId,
                title: proj.title,
                description: proj.description || "",
                technologies: proj.technologies || [],
                link: proj.link || null
            }));

            const { error: projectsError } = await supabase
                .from("projects")
                .insert(projectsData);

            if (projectsError) {
                console.error("Projects insert error:", projectsError);
                throw new Error("Failed to insert projects");
            }
            console.log(`Profile Fill: Inserted ${projectsData.length} projects`);
        }

        // 7. Insert Languages
        if (parsedCv.languages && Array.isArray(parsedCv.languages) && parsedCv.languages.length > 0) {
            await supabase.from("languages").delete().eq("user_id", userId);

            const languagesData = parsedCv.languages.map((lang: any) => ({
                user_id: userId,
                language: lang.language,
                proficiency: lang.proficiency
            }));

            const { error: languagesError } = await supabase
                .from("languages")
                .insert(languagesData);

            if (languagesError) {
                console.error("Languages insert error:", languagesError);
                throw new Error("Failed to insert languages");
            }
            console.log(`Profile Fill: Inserted ${languagesData.length} languages`);
        }

        // 8. Insert References
        if (parsedCv.references && Array.isArray(parsedCv.references) && parsedCv.references.length > 0) {
            await supabase.from("references").delete().eq("user_id", userId);

            const referencesData = parsedCv.references.map((ref: any) => ({
                user_id: userId,
                name: ref.name,
                relationship: ref.relationship || null,
                company: ref.company || null,
                phone: ref.phone || null,
                email: ref.email || null
            }));

            const { error: referencesError } = await supabase
                .from("references")
                .insert(referencesData);

            if (referencesError) {
                console.error("References insert error:", referencesError);
                throw new Error("Failed to insert references");
            }
            console.log(`Profile Fill: Inserted ${referencesData.length} references`);
        }

        console.log("Profile Fill: All data synced successfully!");
        return NextResponse.json({
            success: true,
            message: "Profile filled successfully!",
            stats: {
                skills: parsedCv.skills?.length || 0,
                experiences: parsedCv.experiences?.length || 0,
                education: parsedCv.education?.length || 0,
                projects: parsedCv.projects?.length || 0,
                languages: parsedCv.languages?.length || 0,
                references: parsedCv.references?.length || 0
            }
        });

    } catch (error: any) {
        console.error("Profile Fill Error:", error);
        return NextResponse.json(
            {
                error: "Failed to fill profile.",
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
