import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { text, goal, instructions } = await req.json();

        if (!text) {
            return NextResponse.json(
                { error: "Content is required for rewriting." },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "AI Service Unavailable (Missing Key)" },
                { status: 503 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let prompt = "";

        switch (goal) {
            case "summary":
                prompt = `
          You are an expert Resume Writer.
          Rewrite the following professional summary to be more punchy, impactful, and professional.
          
          USER INSTRUCTIONS: ${instructions || "Make it professional and concise."}
          
          ORIGINAL TEX:
          "${text}"
          
          OUTPUT INSTRUCTIONS:
          - Return ONLY the rewritten paragraph.
          - Do not add quotes or markdown.
          - Keep it under 4 sentences.
        `;
                break;

            case "experience":
                prompt = `
          You are an expert Resume Writer. 
          Rewrite the following job description into 3-5 punchy, results-oriented bullet points using the STAR method (Situation, Task, Action, Result).
          
          USER INSTRUCTIONS: ${instructions || "Focus on leadership and technical impact."}
          
          ORIGINAL TEXT:
          "${text}"
          
          OUTPUT INSTRUCTIONS:
          - Return ONLY the bullet points.
          - Each bullet point must be on a new line.
          - Do not use markdown or symbols like '- ' or '* ' at the start (I will add them in UI).
          - Focus on strong action verbs (e.g., "Led", "Developed", "Achieved").
        `;
                break;

            case "project":
                prompt = `
          You are a Senior Tech Recruiter.
          Rewrite this project description to sound technically impressive and impactful.
          
          USER INSTRUCTIONS: ${instructions || "Highlight the tech stack and problem solved."}
          
          ORIGINAL TEXT:
          "${text}"
          
          OUTPUT INSTRUCTIONS:
          - Return a concise 2-3 sentence description.
          - Emphasize the technologies used and the outcome.
          - Return ONLY the text.
        `;
                break;

            default:
                return NextResponse.json({ error: "Invalid goal specified." }, { status: 400 });
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const revampedText = response.text().trim();

        return NextResponse.json({ revampedText });

    } catch (error: any) {
        console.error("AI Revamp Error:", error);
        return NextResponse.json(
            { error: "Failed to rewrite text.", details: error.message },
            { status: 500 }
        );
    }
}
