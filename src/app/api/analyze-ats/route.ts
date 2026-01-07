import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Heuristic analysis for when AI is unavailable
function basicAnalyze(cvText: string, jobRequirements: string[]) {
    const lowercaseCv = cvText.toLowerCase();
    const matches: string[] = [];
    const missing: string[] = [];

    // Simple keyword matching for requirements
    jobRequirements.forEach(req => {
        // Skip SECTION headers
        if (req.startsWith("SECTION:")) return;

        const cleanReq = req.toLowerCase().trim();
        if (lowercaseCv.includes(cleanReq)) {
            matches.push(req);
        } else {
            // Only add to missing if it looks like a real requirement (short-ish)
            if (cleanReq.length > 5 && cleanReq.length < 40) {
                missing.push(req);
            }
        }
    });

    // Heuristic score
    const totalPossible = jobRequirements.filter(r => !r.startsWith("SECTION:")).length || 1;
    const matchRatio = matches.length / totalPossible;
    const score = Math.min(100, Math.round(matchRatio * 100 + 20)); // Base 20% + matches

    return {
        score,
        summary: "Basic matching performed using keyword detection. For a deeper semantic analysis, please set up your Gemini API Key.",
        matches: matches.slice(0, 5),
        missing: missing.slice(0, 5),
        alerts: lowercaseCv.includes("matric") || lowercaseCv.includes("grade 12") ? [] : ["Matric/Grade 12 not clearly mentioned"],
        version: "basic"
    };
}

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

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "" || apiKey === "your_api_key_here") {
            console.log("ATS Analysis: No API key. Using Basic Heuristic Analysis.");
            return NextResponse.json(basicAnalyze(cvText, jobRequirements));
        }

        console.log(`ATS Analysis: Comparing CV (${cvText.length} chars) with ${jobRequirements.length} requirements with Gemini`);

        // Initialize AI
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are an elite Applicant Tracking System (ATS) and Career Optimization Expert.
      Your task is to analyze a candidate's CV against a set of job requirements.
      
      CANDIDATE CV:
      \"\"\"
      ${cvText}
      \"\"\"

      JOB REQUIREMENTS:
      \"\"\"
      ${jobRequirements.join("\n")}
      \"\"\"

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

        try {
            console.log("ATS Analysis: Sending to Gemini...");
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text().trim();

            if (text.startsWith("```json")) text = text.replace(/```json|```/g, "");
            if (text.startsWith("```")) text = text.replace(/```/g, "");

            const analysis = JSON.parse(text);
            return NextResponse.json({ ...analysis, version: "ai" });
        } catch (aiError: any) {
            console.error("ATS Analysis AI Failed:", aiError.message);
            return NextResponse.json(basicAnalyze(cvText, jobRequirements));
        }

    } catch (error: any) {
        console.error("ATS Analysis Error DETAIL:", error);
        return NextResponse.json(
            {
                error: "Failed to analyze CV match.",
                details: error.message
            },
            { status: 500 }
        );
    }
}
