import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { profileData, jobDescription } = await req.json();

    if (!profileData || !jobDescription) {
      return NextResponse.json(
        { error: "Profile data and Job description are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI API Key is not configured." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert career coach and professional writer. 
      Your task is to write a highly professional, persuasive, and tailored cover letter for the following job.
      
      JOB DESCRIPTION:
      ${jobDescription}
      
      CANDIDATE PROFILE:
      ${JSON.stringify(profileData)}
      
      INSTRUCTIONS:
      1. Use a formal and professional tone.
      2. Address the letter to "Hiring Manager" (unless a name is obvious in the job description).
      3. Focus on how the candidate's specific experiences and skills (from the profile) solve the problems mentioned in the job description.
      4. Highlight 2-3 key achievements that demonstrate a strong match.
      5. Include South African context/tone if appropriate (e.g., professional yet warm).
      6. Keep the length to about 300-400 words.
      7. Return ONLY the text of the cover letter.
      
      FORMAT:
      [Your Name]
      [Your Email] | [Your Phone]
      [Your Location]
      
      [Date]
      
      Hiring Manager
      [Company Name if known]
      
      Dear Hiring Manager,
      
      [Content of the letter]
      
      Sincerely,
      [Candidate Name]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ coverLetter: text });
  } catch (error: any) {
    console.error("Cover Letter Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
