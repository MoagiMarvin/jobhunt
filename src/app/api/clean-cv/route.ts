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
1. Extract the candidate's personal info, summary, skills, experience, education, projects, languages, and references.
2. Return a CLEAN JSON OBJECT only (no markdown, no backticks, no code fences).
3. Map the data to this EXACT structure with these EXACT field names.

IMPORTANT RULES:
- For dates: Use "YYYY-MM" format (e.g., "2020-01") or "YYYY" only. If only year is known, use "YYYY".
- For "is_current": Set to true if the job/education is ongoing (e.g., "Present", "Current").
- For skills: Extract individual skills as separate items in the array, not categories.
- For education type: Use "high_school" for Matric/High School, "tertiary" for University/College degrees, "certification" for certifications/courses.
- For experience bullets: Split descriptions by periods (.) or bullet points into separate items. Each item should be a complete achievement/responsibility.
- For languages: Extract all languages with proficiency levels (Basic, Intermediate, Fluent, Native).
- For references: Extract name, relationship, company, phone, email if available.

JSON STRUCTURE:
{
  "personalInfo": {
    "name": "Full Name",
    "headline": "Professional Title/Headline",
    "email": "email@example.com",
    "phone": "+27123456789",
    "location": "City, Country"
  },
  "summary": "Professional summary paragraph highlighting key achievements and expertise...",
  "skills": [
    {
      "name": "Skill Name",
      "category": "Technical Skills" or "Soft Skills",
      "minYears": 2
    }
  ],
  "experiences": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "start_date": "2020-01",
      "end_date": "2022-12" or null if current,
      "is_current": false,
      "bullets": [
        "Achievement or responsibility statement 1",
        "Achievement or responsibility statement 2"
      ]
    }
  ],
  "education": [
    {
      "type": "tertiary",
      "title": "Degree Name (e.g., Bachelor of Science)",
      "institution": "University/School Name",
      "qualification_level": "Bachelor" or "Diploma" or "Certificate",
      "start_date": "2016-01",
      "end_date": "2019-12",
      "year": 2019
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "description": "Brief project description",
      "technologies": ["Tech1", "Tech2"],
      "link": "https://github.com/..."
    }
  ],
  "languages": [
    {
      "language": "English",
      "proficiency": "Native" or "Fluent" or "Intermediate" or "Basic"
    }
  ],
  "references": [
    {
      "name": "Reference Name",
      "relationship": "Manager" or "Colleague" or "Professor",
      "company": "Company Name",
      "phone": "+27...",
      "email": "email@example.com"
    }
  ]
}

INPUT TEXT:
"""
${cvText}
"""

RETURN ONLY THE JSON OBJECT. DO NOT include any explanations, markdown formatting, or code fences.
    `;

    try {
      console.log("CV Parsing: Sending to Gemini...");
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      console.log("CV Parsing: Raw AI Response:", text.substring(0, 500)); // Log first 500 chars

      // Clean up markdown code fences
      if (text.startsWith("```json")) text = text.replace(/```json|```/g, "");
      if (text.startsWith("```")) text = text.replace(/```/g, "");
      text = text.trim();

      console.log("CV Parsing: Cleaned Response:", text.substring(0, 500));

      let parsedCv;
      try {
        parsedCv = JSON.parse(text);
      } catch (parseError: any) {
        console.error("CV Parsing: JSON Parse Error:", parseError.message);
        console.error("CV Parsing: Problematic JSON:", text);
        throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
      }

      console.log("CV Parsing: AI Success!");
      return NextResponse.json({ parsedCv, version: "ai" });
    } catch (aiError: any) {
      console.error("CV Cleaning: AI Failed, falling back to empty structure.", aiError.message);
      console.error("CV Cleaning: Full Error:", aiError);
      // Return empty structure so Auto-fill button still appears
      return NextResponse.json({
        parsedCv: {
          personalInfo: {
            name: "",
            headline: "",
            email: "",
            phone: "",
            location: ""
          },
          summary: "",
          skills: [],
          experiences: [],
          education: []
        },
        version: "fallback",
        note: `AI parsing failed: ${aiError.message}. Please check server logs for details.`
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
