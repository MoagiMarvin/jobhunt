import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
    try {
        const { summary, experiences, projects, skills, instructions } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "AI Service Unavailable (Missing Key)" },
                { status: 503 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
        You are an expert Career Coach and Resume Writer. 
        Analyze the following candidate profile and provide an optimized version.

        CURRENT PROFILE:
        Summary: ${summary || "None"}
        Experience: ${JSON.stringify(experiences)}
        Projects: ${JSON.stringify(projects)}
        Skills: ${JSON.stringify(skills)}

        ${instructions ? `USER INSTRUCTIONS: ${instructions}` : ''}

        YOUR TASK:
        1. Revamp Summary: Write a punchy, professional summary (3-4 sentences) highlighting key strengths.
        2. Revamp Experience: For each role, rewrite the description into 3-5 strong STAR-method bullet points.
        3. Revamp Projects: Rewrite descriptions to be concise (2-3 sentences) and technically impressive.
        4. Suggest Skills: Identify 5-10 missing technical or soft skills based on the experience/projects.

        OUTPUT FORMAT (JSON):
        {
            "revampedSummary": "string",
            "revampedExperiences": [
                { "id": "original_id", "description": "bullet points string (use \\n for new lines)" }
            ],
            "revampedProjects": [
                { "id": "original_id", "description": "string" }
            ],
            "suggestedSkills": ["skill1", "skill2"]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse JSON response:", text);
            return NextResponse.json({ error: "AI returned invalid format" }, { status: 500 });
        }

        return NextResponse.json(jsonResponse);

    } catch (error: any) {
        console.error("Master Revamp Error:", error);
        return NextResponse.json(
            { error: "Failed to revamp profile.", details: error.message },
            { status: 500 }
        );
    }
}
