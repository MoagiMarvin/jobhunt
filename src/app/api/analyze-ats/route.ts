import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";



// Heuristic analysis for when AI is unavailable
function basicAnalyze(cvText: string, jobRequirements: string[]) {
    // 1. Pre-clean the CV text (fix S O F T W A R E type spacing)
    const cleanedCv = cvText.replace(/([A-Za-z])\s{1,2}([A-Za-z])\s{1,2}([A-Za-z])/g, (match) => match.replace(/\s+/g, ''));
    const lowercaseCv = cleanedCv.toLowerCase();

    const matches: string[] = [];
    const missing: string[] = [];
    const internalAlerts: string[] = [];

    // Stop words to ignore when extracting keywords
    const stopWords = new Set(['and', 'the', 'with', 'for', 'skills', 'experience', 'ability', 'knowledge', 'understanding', 'required', 'excellent', 'strong', 'good', 'must', 'have', 'years', 'level', 'will', 'responsibilities', 'duties']);

    // 2. Extract significant keywords from requirements
    const allKeywords = new Set<string>();
    let detectedJobTitle = "";

    jobRequirements.forEach((req, idx) => {
        if (req.startsWith("SECTION:")) return;

        // Assume the first few requirements or the one with specific keywords contains the job title
        if (idx < 3 && req.length > 5 && req.length < 50) {
            detectedJobTitle = req;
        }

        // Split into words, remove punctuation, and filter
        const words = req.toLowerCase()
            .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
            .split(/\s+/)
            .filter(w => w.length > 3 && !stopWords.has(w));

        words.forEach(w => allKeywords.add(w));
    });

    // 3. Match keywords against CV
    const foundKeywords: string[] = [];
    allKeywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        if (regex.test(cleanedCv)) {
            foundKeywords.push(kw);
        }
    });

    // 4. ADVANCED RECRUITER LOGIC: Sections & Formatting
    const sections = {
        experience: /experience|employment|work|history/i.test(cleanedCv),
        skills: /skills|competencies|technologies|stack/i.test(cleanedCv),
        education: /education|qualifications|academic|matric|degree/i.test(cleanedCv)
    };

    const hasContactEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(cleanedCv);
    const hasPhone = /(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(cleanedCv);
    const hasBullets = /[•\-*]/.test(cleanedCv);

    if (!sections.experience) internalAlerts.push("Work Experience section not clearly labeled");
    if (!sections.skills) internalAlerts.push("Skills section missing or poorly labeled");
    if (!hasContactEmail) internalAlerts.push("No email address detected");
    if (!hasPhone) internalAlerts.push("No phone number detected");
    if (!hasBullets) internalAlerts.push("Poor formatting: Use bullet points for readability");

    // 5. Title Relevance
    let titleMatchBonus = 0;
    if (detectedJobTitle) {
        const titleWords = detectedJobTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const titleMatchCount = titleWords.filter(w => lowercaseCv.includes(w)).length;
        if (titleMatchCount > 0) titleMatchBonus = (titleMatchCount / titleWords.length) * 15;
    }

    // 6. Calculate Match Score
    jobRequirements.forEach(req => {
        if (req.startsWith("SECTION:")) return;
        const cleanReq = req.toLowerCase().trim();
        const reqWords = cleanReq.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
        const matchingWords = reqWords.filter(w => lowercaseCv.includes(w));

        if (lowercaseCv.includes(cleanReq) || (reqWords.length > 0 && matchingWords.length / reqWords.length > 0.6)) {
            if (!matches.includes(req)) matches.push(req);
        } else {
            if (cleanReq.length > 5 && cleanReq.length < 50 && !missing.includes(req)) missing.push(req);
        }
    });

    const totalPossibleKeywords = allKeywords.size || 1;
    const keywordRatio = foundKeywords.length / totalPossibleKeywords;

    // Legacy Score Breakdown:
    // Keyword Depth: 50%
    // Title Relevance: 15%
    // Sections & Basic Info: 20%
    // Formatting & Contact: 15%
    const keywordScore = keywordRatio * 50;
    const basicInfoScore = (Object.values(sections).filter(Boolean).length / 3) * 20;
    const contactScore = (hasContactEmail ? 5 : 0) + (hasPhone ? 5 : 0) + (hasBullets ? 5 : 0);

    const finalScore = Math.min(100, Math.round(keywordScore + titleMatchBonus + basicInfoScore + contactScore + 10));

    return {
        legacyScore: finalScore,
        score: finalScore,
        summary: `Legacy Check: ${foundKeywords.length} key terms found. ${internalAlerts.length > 0 ? "Some vital CV sections or contact details are missing." : "Strong section mapping and professional formatting detected."}`,
        matches: matches.slice(0, 5),
        missing: missing.slice(0, 5),
        alerts: [...internalAlerts, lowercaseCv.includes("matric") || lowercaseCv.includes("grade 12") ? null : "Matric/Grade 12 not clearly mentioned"].filter(Boolean),
        version: "basic-turbo"
    };
}

export async function POST(req: Request) {
    console.log("ATS Analysis: Dual-Mode Request received");
    try {
        const { jobRequirements, cvText } = await req.json();

        if (!cvText || !jobRequirements) {
            return NextResponse.json(
                { error: "CV text and Job requirements are required." },
                { status: 400 }
            );
        }

        // 1. ALWAYS calculate Legacy Score (Keyword-based)
        const legacyAnalysis = basicAnalyze(cvText, jobRequirements);

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "" || apiKey === "your_api_key_here") {
            console.log("ATS Analysis: No AI key. Returning Legacy results only.");
            return NextResponse.json({
                ...legacyAnalysis,
                legacyScore: legacyAnalysis.score,
                semanticScore: null,
                isAiAvailable: false
            });
        }

        // 2. Perform AI Semantic Analysis
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
          You are an elite Applicant Tracking System (ATS) Expert.
          Analyze this CV against the job requirements.
          
          CANDIDATE CV:
          \"\"\"
          ${cvText}
          \"\"\"

          JOB REQUIREMENTS:
          \"\"\"
          ${jobRequirements.join("\n")}
          \"\"\"

          INSTRUCTIONS:
          1. Calculate a semantic match score (0-100) based on context, experience, and suitability.
          2. Identify top 5 matching skills.
          3. Identify top 5 missing key skills/reqs.
          4. Look for South African specific critical gaps (Matrix/Grade 12).
          
          RETURN ONLY RAW JSON (no markdown):
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

            if (text.startsWith("```json")) text = text.replace(/```json|```/g, "");
            if (text.startsWith("```")) text = text.replace(/```/g, "");

            const aiData = JSON.parse(text);

            return NextResponse.json({
                legacyScore: legacyAnalysis.score,
                semanticScore: aiData.score,
                summary: aiData.summary,
                matches: aiData.matches,
                missing: aiData.missing,
                alerts: aiData.alerts,
                isAiAvailable: true,
                version: "dual"
            });

        } catch (aiError: any) {
            console.error("ATS Analysis Semantic Mode Failed:", aiError.message);
            return NextResponse.json({
                ...legacyAnalysis,
                legacyScore: legacyAnalysis.score,
                semanticScore: null,
                isAiAvailable: false,
                version: "dual-fallback"
            });
        }

    } catch (error: any) {
        console.error("ATS Analysis Critical Error:", error);
        return NextResponse.json(
            { error: "Failed to perform ATS analysis.", details: error.message },
            { status: 500 }
        );
    }
}
