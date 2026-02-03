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

        console.log("Profile Fill: All data synced successfully!");
        return NextResponse.json({
            success: true,
            message: "Profile filled successfully!",
            stats: {
                skills: parsedCv.skills?.length || 0,
                experiences: parsedCv.experiences?.length || 0,
                education: parsedCv.education?.length || 0
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
