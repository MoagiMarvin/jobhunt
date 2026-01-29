import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Heuristic analysis for when AI is unavailable
function basicAnalyze(cvText: string, jobRequirements: string[]) {
    // 1. Pre-clean the CV text (fix S O F T W A R E type spacing)
    const cleanedCv = cvText.replace(/([A-Za-z])\s{1,2}([A-Za-z])\s{1,2}([A-Za-z])/g, (match) => match.replace(/\s+/g, ''));
    const lowercaseCv = cleanedCv.toLowerCase();

    const matches: string[] = [];
    const missing: string[] = [];
    const internalAlerts: string[] = [];
    const insights: string[] = [];

    // 2. GOLD STANDARD DICTIONARY
    const actionVerbs = new Set(['spearheaded', 'orchestrated', 'negotiated', 'implemented', 'designed', 'developed', 'managed', 'led', 'transformed', 'optimized', 'achieved', 'increased', 'decreased', 'saved', 'architected', 'automated', 'streamlined']);
    const buzzwords = new Set(['team player', 'hard worker', 'self-starter', 'motivated', 'passionate', 'dynamic', 'detail-oriented', 'results-driven']);
    const stopWords = new Set(['and', 'the', 'with', 'for', 'skills', 'experience', 'ability', 'knowledge', 'understanding', 'required', 'excellent', 'strong', 'good', 'must', 'have', 'years', 'level', 'will', 'responsibilities', 'duties']);

    // 3. Extract keywords from requirements
    const allKeywords = new Set<string>();
    let detectedJobTitle = "";
    jobRequirements.forEach((req, idx) => {
        if (req.startsWith("SECTION:")) return;
        if (idx < 3 && req.length > 5 && req.length < 50) detectedJobTitle = req;
        const words = req.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
        words.forEach(w => allKeywords.add(w));
    });

    // 4. Content Analysis: Verbs & Impact
    const wordsInCv = cleanedCv.split(/\s+/);
    const foundVerbs = wordsInCv.filter(w => actionVerbs.has(w.toLowerCase().replace(/[.,]/g, "")));
    const foundBuzzwords = wordsInCv.filter(w => buzzwords.has(w.toLowerCase().replace(/[.,]/g, "")));

    // Impact Detection: Look for numbers (quantifiables)
    const impactCount = (cleanedCv.match(/\d+(?:\.\d+)?%|R\s?\d+|\$\s?\d+|\d+\s?years|\b\d{2,}\b/g) || []).length;

    // Readability: Average Sentence Length (rough)
    const sentences = cleanedCv.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const avgSentenceLength = sentences.length > 0 ? wordsInCv.length / sentences.length : 0;

    // 5. RECRUITER INSIGHTS
    if (foundVerbs.length >= 5) insights.push("✅ Strong use of action verbs detected");
    else internalAlerts.push("Use more action verbs (e.g., Spearheaded, Balanced, Delivered) to show impact");

    if (impactCount >= 3) insights.push("✅ Quantifiable impact detected (numbers/metrics)");
    else internalAlerts.push("Try to add more numbers or percentages to prove your results");

    if (foundBuzzwords.length > 4) internalAlerts.push("Remove generic buzzwords like 'team player' and show your skills instead");
    if (avgSentenceLength > 25) internalAlerts.push("Some sentences are very long. Aim for shorter, punchy bullet points.");

    // 6. Basic Matching & Logic
    const foundKeywords: string[] = [];
    allKeywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        if (regex.test(cleanedCv)) foundKeywords.push(kw);
    });

    const sections = {
        experience: /experience|employment|work|history/i.test(cleanedCv),
        skills: /skills|competencies|technologies|stack/i.test(cleanedCv),
        education: /education|qualifications|academic|matric|degree/i.test(cleanedCv)
    };

    const hasContactEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(cleanedCv);
    const hasPhone = /(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(cleanedCv);

    // 7. Calculate Match Score
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

    // Gold Score Breakdown:
    // Keyword Depth: 40%
    // Impact & Verbs: 20%
    // Sections & Basic Info: 20%
    // Contact & Title: 20%
    const keywordScore = keywordRatio * 40;
    const impactScore = Math.min(20, (impactCount * 4) + (foundVerbs.length * 2));
    const basicInfoScore = (Object.values(sections).filter(Boolean).length / 3) * 20;
    const contactScore = (hasContactEmail ? 10 : 0) + (hasPhone ? 10 : 0);

    const finalScore = Math.min(100, Math.round(keywordScore + impactScore + basicInfoScore + contactScore));

    return {
        legacyScore: finalScore,
        score: finalScore,
        summary: insights.length > 0 ? insights.join(". ") : "Heuristic check complete. Add more impact-driven bullet points for a better score.",
        matches: matches.slice(0, 5),
        missing: missing.slice(0, 5),
        alerts: [...internalAlerts, lowercaseCv.includes("matric") || lowercaseCv.includes("grade 12") ? null : "Matric/Grade 12 not clearly mentioned"].filter(Boolean),
        version: "gold-standard"
    };
}

export async function POST(req: NextRequest) {
    console.log("ATS Analysis: Request Received");

    // DEBUG: Check Environment Variable
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("DEBUG: Key Check ->", apiKey ? `Exists (${apiKey.length} chars)` : "MISSING");
    if (apiKey) console.log("DEBUG: Key Start ->", apiKey.substring(0, 5) + "...");

    try {
        const { jobRequirements, profileData } = await req.json();

        if (!profileData || !jobRequirements) {
            return NextResponse.json(
                { error: "Profile data and Job requirements are required." },
                { status: 400 }
            );
        }

        // Convert profileData to text for analysis
        const cvText = JSON.stringify(profileData);

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
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

            console.log("=== RAW AI RESPONSE ===");
            console.log(text.substring(0, 500)); // First 500 chars
            console.log("=== END RAW RESPONSE ===");

            if (text.startsWith("```json")) text = text.replace(/```json|```/g, "");
            if (text.startsWith("```")) text = text.replace(/```/g, "");

            console.log("=== CLEANED TEXT ===");
            console.log(text.substring(0, 300));
            console.log("=== ATTEMPTING JSON.parse ===");

            const aiData = JSON.parse(text);
            console.log("✅ JSON Parse Success! Score:", aiData.score);

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
            console.error("ATS Analysis Semantic Mode Failed!");
            console.error("Error Type:", aiError.constructor.name);
            console.error("Error Message:", aiError.message);
            console.error("Error Code:", aiError.code);
            console.error("Error Status:", aiError.status);
            console.error("Full Error:", JSON.stringify(aiError, null, 2));

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
