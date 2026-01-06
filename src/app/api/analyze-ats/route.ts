import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
    console.log("ATS Analysis: Request received");
    try {
        const { jobRequirements, cvText } = await req.json();

        if (!cvText || !jobRequirements) {
            console.error("ATS Analysis: Missing CV text or requirements");
            return NextResponse.json(
                { error: "CV text and Job requirements are required." },
                { status: 400 }
            );
        }

        console.log(`ATS Analysis: Comparing CV (${cvText.length} chars) with ${jobRequirements.length} requirements`);

        const prompt = `
      You are an elite Applicant Tracking System (ATS) and Career Optimization Expert.
      Your task is to analyze a candidate's CV against a set of job requirements.
      
      CANDIDATE CV:
      """
      ${cvText}
      """

      JOB REQUIREMENTS:
      """
      ${jobRequirements.join("\n")}
      """

      INSTRUCTIONS:
      1. Perform a semantic comparison between the CV and the job requirements.
      2. Calculate an overall match score from 0 to 100 based on skills, experience, and keywords.
      3. Identify specific matching skills found in the CV.
      4. Identify missing keywords or requirements that were in the job ad but NOT in the CV.
      5. Look specifically for South African requirements like "Matric" or "Grade 12" and flag as "ALERTS" if missing.
      6. Provide a short, professional summary of the match.

      RETURN ONLY A JSON OBJECT (no markdown, no backticks):
      {
        "score": 85,
        "summary": "Full sentence summary here...",
        "matches": ["Skill 1", "Skill 2"],
        "missing": ["Skill 3", "Skill 4"],
        "alerts": ["Alert 1"]
      }
    `;

        console.log("ATS Analysis: Sending to Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        console.log("ATS Analysis: Response received from Gemini");

        // Clean up potential markdown formatting from AI
        if (text.startsWith("```json")) text = text.replace(/```json|```/g, "");
        if (text.startsWith("```")) text = text.replace(/```/g, "");

        const analysis = JSON.parse(text);
        console.log("ATS Analysis: Success!");

        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error("ATS Analysis Error DETAIL:", error);
        return NextResponse.json(
            {
                error: "Failed to analyze CV match.",
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
