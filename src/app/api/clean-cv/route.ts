import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

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

export async function POST(req: Request) {
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
                cleanedText,
                version: "basic",
                note: "Using basic cleaning because GEMINI_API_KEY is not set."
            });
        }

        console.log(`CV Cleaning: Processing ${cvText.length} characters with Gemini`);

        // Initialize AI only if key is present
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      You are an expert Resume/CV Formatting Specialist. 
      I will provide you with a CV that has been extracted from a PDF. 
      The extraction process has created formatting artifacts like:
      - Extra spaces between letters (e.g., "S O F T W A R E" instead of "Software")
      - Broken lines
      - Jumbled contact information
      
      YOUR TASK:
      1. Fix all formatting issues.
      2. Join split words back together.
      3. Organize the text into logical sections: PROFESSIONAL SUMMARY, SKILLS, EXPERIENCE, EDUCATION, PROJECTS, CONTACT.
      4. Ensure the text is clean, professional, and easily readable by even the simplest "dumb" Applicant Tracking Systems (ATS).
      5. Do NOT add new information or remove existing experience—only fix the formatting and structure.
      
      INPUT TEXT:
      """
      ${cvText}
      """

      RETURN ONLY THE CLEANED TEXT. Do not add any conversational filler.
    `;

        try {
            console.log("CV Cleaning: Sending to Gemini...");
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const cleanedText = response.text().trim();

            console.log(`CV Cleaning: AI Success! Cleaned text length: ${cleanedText.length}`);
            return NextResponse.json({ cleanedText, version: "ai" });
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
