import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Basic optimization for when AI is unavailable
function basicOptimize(cvText: string, profileDataObj: any) {
  // Very simple parsing for mock-up replacement
  const lines = cvText.split('\n').filter(l => l.trim().length > 0);

  return {
    personalInfo: {
      name: profileDataObj?.personalInfo?.fullName || "Candidate Name",
      title: "Professional", // Default
      email: profileDataObj?.personalInfo?.email || "",
      phone: profileDataObj?.personalInfo?.phone || "",
      location: "South Africa",
      links: []
    },
    summary: lines[0] || "Professional with experience in multiple domains. Seeking new opportunities.",
    experience: [
      {
        role: "Relevant Experience",
        company: "Previous Organization",
        dates: "Period",
        bulletPoints: lines.slice(1, 5).length > 0 ? lines.slice(1, 5) : ["Experience details found in Master CV."]
      }
    ],
    skills: ["Teamwork", "Problem Solving", "Communication"],
    education: [
      {
        degree: "Qualification",
        school: "Institution",
        year: "Year"
      }
    ],
    version: "basic",
    note: "Basic mode: Structured your master profile into a professional layout. Add your AI Key for full skill-tailored rewriting."
  };
}

export async function POST(req: NextRequest) {
  console.log("CV Optimization: Request received");
  try {
    const { profileData, jobRequirements } = await req.json();

    if (!profileData || !jobRequirements) {
      return NextResponse.json(
        { error: "Profile data and Job requirements are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "" || apiKey === "your_api_key_here") {
      console.log("CV Optimization: No API key. Using Basic Template.");
      return NextResponse.json(basicOptimize(JSON.stringify(profileData), profileData));
    }

    console.log("CV Optimization: Processing with Gemini");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert Career Coach and Resume Writer. 
      Your goal is to tailor a candidate's profile to a specific job description.

      CANDIDATE MASTER PROFILE (JSON):
      \"\"\"
      ${JSON.stringify(profileData)}
      \"\"\"

      JOB REQUIREMENTS:
      \"\"\"
      ${jobRequirements.join("\n")}
      """

      INSTRUCTIONS:
      1. Analyze the Job Requirements to identify the most important skills and keywords.
      2. Rewrite the "Professional Summary" to specifically target this job.
      3. For "experience", select the most relevant roles and rewrite bullet points using strong action verbs and matching job keywords.
      4. Ensure you include South African cultural markers if relevant (like "Matric").
      5. Identify the top 10-15 TECHNICAL SKILLS from the master profile that match the job. Skills must be actual job skills (tools, technologies, methodologies) — NEVER include degrees, diplomas, qualifications, or certifications in the skills array. Those belong in educationList only.
      6. CRITICAL - PRESERVE ALL THESE SECTIONS EXACTLY AS-IS from the master profile (copy them verbatim, do NOT omit or modify them):
         - "educationList": copy from profileData.educationList
         - "matricData": copy from profileData.matricData
         - "languages": copy from profileData.languages
         - "references": copy from profileData.references
         - "projectsList": copy from profileData.projectsList
      7. Return a CLEAN JSON OBJECT only (no markdown, no backticks, no code fences).

      REQUIRED JSON STRUCTURE (fill every field, never use null or empty arrays for the preserved sections):
      {
        "personalInfo": {
          "name": "Full name from master profile",
          "title": "Desired Job Title tailored to the job",
          "email": "Email from master profile",
          "phone": "Phone from master profile",
          "location": "Location from master profile",
          "links": []
        },
        "summary": "Tailored professional summary targeting the job...",
        "experience": [
          {
            "role": "Job Title",
            "company": "Company Name",
            "dates": "Date Range",
            "bulletPoints": [
              "Tailored achievement 1",
              "Tailored achievement 2"
            ]
          }
        ],
        "skills": [
          { "name": "Skill Name", "category": "Category" }
        ],
        "educationList": [ /* COPY VERBATIM from profileData.educationList */ ],
        "matricData": { /* COPY VERBATIM from profileData.matricData */ },
        "languages": [ /* COPY VERBATIM from profileData.languages */ ],
        "references": [ /* COPY VERBATIM from profileData.references */ ],
        "projectsList": [ /* COPY VERBATIM from profileData.projectsList */ ]
      }
    `;

    try {
      console.log("CV Optimization: Sending to Gemini...");
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      if (text.startsWith("```json")) text = text.replace(/```json|```/g, "");
      if (text.startsWith("```")) text = text.replace(/```/g, "");

      const optimizedCv = JSON.parse(text);

      // Safety net: Always preserve these sections from the master profile
      // even if the AI forgets to include them or returns empty arrays.
      const preserved = {
        educationList: profileData.educationList || [],
        matricData: profileData.matricData || null,
        languages: profileData.languages || [],
        references: profileData.references || [],
        projectsList: profileData.projectsList || [],
      };

      // Only override if AI returned empty / missing
      if (!optimizedCv.educationList || optimizedCv.educationList.length === 0) {
        optimizedCv.educationList = preserved.educationList;
      }
      if (!optimizedCv.matricData) {
        optimizedCv.matricData = preserved.matricData;
      }
      if (!optimizedCv.languages || optimizedCv.languages.length === 0) {
        optimizedCv.languages = preserved.languages;
      }
      if (!optimizedCv.references || optimizedCv.references.length === 0) {
        optimizedCv.references = preserved.references;
      }
      if (!optimizedCv.projectsList || optimizedCv.projectsList.length === 0) {
        optimizedCv.projectsList = preserved.projectsList;
      }

      return NextResponse.json({ ...optimizedCv, version: "ai" });
    } catch (aiError: any) {
      console.error("CV Optimization AI Failed:", aiError.message);
      return NextResponse.json(basicOptimize(JSON.stringify(profileData), profileData));
    }

  } catch (error: any) {
    console.error("CV Optimization Error DETAIL:", error);
    return NextResponse.json(
      {
        error: "Failed to optimize CV.",
        details: error.message
      },
      { status: 500 }
    );
  }
}
