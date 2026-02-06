import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { jobTitle, jobDescription, questionCount, userProfile } = await req.json();

        if (!jobTitle || !jobDescription) {
            return NextResponse.json(
                { error: "Job title and description are required" },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // Mock response for dev without API key
            return NextResponse.json({
                questions: Array(questionCount).fill(0).map((_, i) => ({
                    id: i + 1,
                    type: i % 2 === 0 ? "behavioral" : "technical",
                    text: `Mock Question ${i + 1} for ${jobTitle}: Tell me about a time you handled a difficult situation?`,
                    category: "General"
                }))
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are a senior executive recruiter conducting a high-stakes interview for the role of ${jobTitle}.
            
            TARGET JOB DESCRIPTION:
            """
            ${jobDescription.slice(0, 5000)}
            """

            CANDIDATE PROFILE:
            """
            ${JSON.stringify(userProfile).slice(0, 5000)}
            """

            Generate ${questionCount} challenging interview questions.
            - FOCUS: How the candidate's specific background (from their PROFILE) qualifies them for the new ROLE.
            - REFERENCE: Mention specific companies, roles, or skills from the PROFILE when asking behavioral questions.
            - SCENARIOS: Ask about specific South African industry scenarios (e.g., SA Labour Law, CCMA, B-BBEE, or local logistics routes like the N3) if applicable to the role.
            - STAR: Use the STAR method for behavioral questions.
            - LEVEL: These should be questions that separate top-tier candidates from average ones.
            - STYLE: Professional, direct, and conversational (like a real recruiter).
            - Keep questions under 30 words.
            
            RETURN ONLY A JSON OBJECT (no markdown) with this structure:
            {
                "questions": [
                    {
                        "id": 1,
                        "type": "behavioral" | "technical",
                        "text": "The challenging question...",
                        "category": "Experience" | "Technical" | "Strategy" | "Problem Solving"
                    }
                ]
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Clean markdown
        if (text.startsWith("```json")) text = text.replace(/```json|```/g, "");
        if (text.startsWith("```")) text = text.replace(/```/g, "");

        try {
            const data = JSON.parse(text);

            // Add standard opening questions at the beginning
            const openingQuestions = [
                {
                    id: 0,
                    type: "behavioral",
                    text: "Tell me about yourself and your background.",
                    category: "Introduction"
                }
            ];

            // Prepend opening questions and renumber everything
            const allQuestions = [
                ...openingQuestions,
                ...data.questions.map((q: any, idx: number) => ({
                    ...q,
                    id: idx + 1
                }))
            ];

            return NextResponse.json({ questions: allQuestions });
        } catch (e) {
            console.error("Failed to parse Gemini response:", text);
            return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Question Generation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
