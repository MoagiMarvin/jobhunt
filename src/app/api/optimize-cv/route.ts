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
      3. For "Experience", select the most relevant roles and rewrite bullet points to use strong action verbs and match job keywords. 
      4. Ensure you include South African cultural markers if relevant (like "Matric").
      5. Identify the top 10-15 skills that match the job.
      6. CRITICAL: Do NOT modify the "references" section. Keep it exactly as it is in the master profile.
      7. Return a CLEAN JSON OBJECT only (no markdown, no backticks).

      JSON STRUCTURE:
      {
        "personalInfo": {
          "name": "User Name",
          "title": "Desired Job Title",
          "email": "Email",
          "phone": "Phone",
          "location": "Location (if found)",
          "links": ["link1", "link2"]
        },
        "summary": "Tailored professional summary here...",
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
        "skills": ["Skill 1", "Skill 2"],
        "education": [
          {
            "degree": "Degree/Certificate",
            "school": "Institution",
            "year": "Year"
          }
        ],
        "references": []
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
