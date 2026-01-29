import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Basic cleaning function for when AI is unavailable
function basicClean(text: string) {
    // 1. Fix "S O F T W A R E" or "M a r v i n" type spacing
    // This looks for letters separated by 1 or 2 spaces, repeating at least 3 times
    let cleaned = text.replace(/([A-Za-z])\s{1,2}([A-Za-z])\s{1,2}([A-Za-z])(?:\s{1,2}([A-Za-z]))*/g, (match) => {
        // Only join if it looks like a word (more spaces than letters would be a normal sentence)
        return match.replace(/\s+/g, '');
    });

    // 2. Fix excessive spaces between words
    cleaned = cleaned.replace(/[ \t]+/g, ' ');

    // 3. Fix excessive newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // 4. Trim lines and remove empty ones at start/end
    cleaned = cleaned.split('\n').map(line => line.trim()).join('\n').trim();

    return cleaned;
}

export async function POST(req: NextRequest) {
    console.log("CV Cleaning: Request received");
    try {
        const { cvText } = await req.json();

        if (!cvText) {
            console.warn("CV Cleaning: Empty text provided");
            return NextResponse.json({ error: "CV text is required." }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        // If no API key, use basic cleaning
        if (!apiKey || apiKey === "your_api_key_here") {
            console.log("CV Cleaning: No API key found. Using Basic Regex Clean.");
            const cleanedText = basicClean(cvText);
            return NextResponse.json({
                parsedCv: {
                    personalInfo: { name: "Candidate Name", headline: "Professional", email: "", phone: "", location: "" },
                    summary: "Profile details found in CV.",
                    skills: [],
                    experiences: [],
                    education: []
                },
                version: "basic",
                note: "Using basic parsing because GEMINI_API_KEY is not set."
            });
        }

        console.log(`CV Cleaning: Processing ${cvText.length} characters with Gemini`);

        // Initialize AI only if key is present
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      You are an expert Resume/CV Parser. 
      I will provide you with a CV that has been extracted from a PDF. 
      The extraction process has created formatting artifacts, but your goal is to extract the core professional information into a structured JSON format.
      
      YOUR TASK:
      1. Extract the candidate's personal info, summary, skills, experience, and education.
      2. Return a CLEAN JSON OBJECT only (no markdown, no backticks).
      3. Map the data to this EXACT structure:

      JSON STRUCTURE:
      {
        "personalInfo": {
          "name": "Full Name",
          "headline": "Professional Title/Headline",
          "email": "Email",
          "phone": "Phone",
          "location": "City, Country"
        },
        "summary": "Professional summary paragraph...",
        "skills": ["Skill 1", "Skill 2", ...],
        "experiences": [
          {
            "role": "Job Title",
            "company": "Company Name",
            "duration": "Date Range",
            "description": "Short summary of responsibilities"
          }
        ],
        "education": [
          {
            "title": "Degree Name",
            "issuer": "University/Institution",
            "date": "Year range/completion"
          }
        ]
      }

      INPUT TEXT:
      """
      ${cvText}
      """

      RETURN ONLY THE JSON OBJECT.
    `;

        try {
            console.log("CV Parsing: Sending to Gemini...");
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text().trim();

            if (text.startsWith("```json")) text = text.replace(/```json|```/g, "");
            if (text.startsWith("```")) text = text.replace(/```/g, "");

            const parsedCv = JSON.parse(text);

            console.log("CV Parsing: AI Success!");
            return NextResponse.json({ parsedCv, version: "ai" });
        } catch (aiError: any) {
            console.error("CV Cleaning: AI Failed, falling back to basic clean.", aiError.message);
            return NextResponse.json({
                cleanedText: basicClean(cvText),
                version: "fallback",
                note: "AI failed, using basic cleaning."
            });
        }

    } catch (error: any) {
        console.error("CV Cleaning Error DETAIL:", error);
        return NextResponse.json(
            {
                error: "Failed to clean CV text.",
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
