import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                'Referer': 'https://www.google.com/',
                'Cache-Control': 'no-cache'
            },
            signal: AbortSignal.timeout(15000)
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        let requirements: string[] = [];
        const headingKeywords = [
            'requirement', 'requirements', 'duty', 'duties', 'responsibility', 'responsibilities',
            'qualification', 'qualifications', 'education', 'key responsibility', 'key responsibilities',
            'what you will need', 'minimum requirement', 'minimum requirements', 'skills', 'skilled',
            'experience', 'desired', 'criteria', 'advantage', 'prefer', 'knowledge', 'competency', 'competencies',
            'key outputs'
        ];

        const skipKeywords = ['introduction', 'about us', 'company overview', 'our mission', 'about the company', 'about the role', 'similar jobs', 'join our list'];

        const trashKeywords = [
            'share this job', 'follow us', 'cookie policy', 'privacy policy', 'all rights reserved',
            'sign up', 'sign in', 'forgot password', 'view similar', 'notify me', 'send me jobs',
            'get in touch', 'contact us', 'apply now', 'back to search', 'log in', 'create account',
            'saved jobs', 'terms of use', 'help center', 'social media', 'facebook', 'twitter', 'linkedin'
        ];

        // --- 1. MANDATORY KEYWORDS (Grade 10 / Matric) ---
        $('p, li, div, span').each((i, el) => {
            const text = $(el).text().trim();
            const lower = text.toLowerCase();
            if ((lower.includes('matric') || lower.includes('grade 10') || lower.includes('grad 10') || lower.includes('matrixc')) && text.length < 500) {
                if (!requirements.includes(text)) requirements.push(text);
            }
        });

        // --- 2. HEADING-BASED "SNIPER" EXTRACTION ---
        $('h1, h2, h3, h4, h5, h6, strong, b, .at-section-text-description-title').each((i, el) => {
            const headingText = $(el).text().trim();
            if (headingText.length < 3 || headingText.length > 80) return;

            const lowerHeading = headingText.toLowerCase();

            // SKIP IF IT'S AN INTRODUCTION OR TRASH
            if (skipKeywords.some(kw => lowerHeading.includes(kw))) return;

            // CHECK IF IT'S A VALID JOB SECTION
            if (headingKeywords.some(kw => lowerHeading.includes(kw)) || headingText.endsWith(':')) {
                let category = "REQUIRED";
                if (lowerHeading.includes('duty') || lowerHeading.includes('responsibilit') || lowerHeading.includes('output')) category = "DUTIES";
                else if (lowerHeading.includes('desired') || lowerHeading.includes('advantage') || lowerHeading.includes('prefer')) category = "PREFERRED";

                let sectionBullets: string[] = [];
                let next = $(el).next();
                let limit = 0;

                while (next.length > 0 && limit < 20) {
                    if (next.is('h1, h2, h3, h4, h5, h6, strong, b')) break;

                    const listItems = next.find('li');
                    if (listItems.length > 0) {
                        listItems.each((j, li) => {
                            const liText = $(li).text().trim();
                            if (liText && liText.length > 5) sectionBullets.push(liText);
                        });
                    } else if (next.is('li')) {
                        const liText = next.text().trim();
                        if (liText && liText.length > 5) sectionBullets.push(liText);
                    } else {
                        const siblingText = next.text().trim();
                        if (siblingText.length > 15 && siblingText.length < 500 && !trashKeywords.some(tk => siblingText.toLowerCase().includes(tk))) {
                            const lines = siblingText.split(/\n|•| \- /).filter(l => l.trim().length > 10);
                            lines.forEach(line => sectionBullets.push(line.trim()));
                        }
                    }
                    next = next.next();
                    limit++;
                }

                if (sectionBullets.length > 0) {
                    requirements.push(`SECTION: [${category}] ${headingText}`);
                    sectionBullets.forEach(bullet => {
                        if (!requirements.includes(bullet)) requirements.push(bullet);
                    });
                }
            }
        });

        // --- 3. SOURCE SPECIFIC "SNIPER" FALLBACKS ---
        if (requirements.length < 6) {
            console.log("Scraper: Heuristic count low, triggering Sniper selectors...");
            const selectors = [
                '[data-at="job-ad-content"] li',
                '.listing-content li',
                '.job-description li',
                '.description__text li',
                '.show-more-less-html__markup li',
                '.c24-vacancy-details li',
                '#job-description p',
                '.job-ad-content p'
            ];

            $(selectors.join(', ')).each((i, el) => {
                const text = $(el).text().trim();
                if (text.length > 15 && text.length < 500 && !trashKeywords.some(tk => text.toLowerCase().includes(tk))) {
                    requirements.push(text);
                }
            });
        }

        // Final Filter: Trash Removal
        let cleanReqs = Array.from(new Set(requirements))
            .filter(r => r.length > 5 && !trashKeywords.some(tk => r.toLowerCase().includes(tk)))
            .slice(0, 30);

        // --- 4. ULTIMATE AI FALLBACK (For messy pages) ---
        const apiKey = process.env.GEMINI_API_KEY;
        if (cleanReqs.length < 6 && apiKey && apiKey !== "" && apiKey !== "your_api_key_here") {
            console.log("Scraper: Extremely low requirements count. Invoking AI Extractor...");
            try {
                // Get all text from body to feed AI (limited to avoid token issues)
                const pageBody = $('body').text().replace(/\s+/g, ' ').substring(0, 5000);
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                const prompt = `
                    Extract a clean list of job requirements, duties, and qualifications from this job posting text.
                    Rules:
                    1. ONLY return a JSON array of strings.
                    2. Ignore headers, footers, website UI, and "About the Company" fluff.
                    3. Focus on specific skills, duties, and education.
                    
                    Text:
                    ${pageBody}
                `;

                const result = await model.generateContent(prompt);
                const aiResponse = await result.response;
                let aiText = aiResponse.text().trim();

                if (aiText.startsWith("```json")) aiText = aiText.replace(/```json|```/g, "");
                else if (aiText.startsWith("```")) aiText = aiText.replace(/```/g, "");

                const aiList = JSON.parse(aiText);
                if (Array.isArray(aiList) && aiList.length > 0) {
                    cleanReqs = aiList.map(item => item.toString()).slice(0, 20);
                }
            } catch (aiErr) {
                console.error("AI Scraper Fallback failed:", aiErr);
            }
        }

        return NextResponse.json({
            requirements: cleanReqs.length > 0 ? cleanReqs : ["Could not automatically extract requirements. Please paste the job description manually."]
        });

    } catch (error: any) {
        console.error("[Scrape API] Error:", error);
        return NextResponse.json({ error: "Failed to scrape job details. The site might be blocking robots." }, { status: 500 });
    }
}
