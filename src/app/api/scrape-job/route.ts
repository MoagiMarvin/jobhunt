import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

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
                'Referer': 'https://www.pnet.co.za/',
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
        const skipKeywords = ['introduction', 'about us', 'company overview', 'our mission', 'about the company', 'about the role'];

        // --- 1. MANDATORY KEYWORDS (Grade 10 / Matric) ---
        $('p, li, div, span').each((i, el) => {
            const text = $(el).text().trim();
            const lower = text.toLowerCase();
            if ((lower.includes('matric') || lower.includes('grade 10') || lower.includes('grad 10') || lower.includes('matrixc')) && text.length < 500) {
                if (!requirements.includes(text)) requirements.push(text);
            }
        });

        // --- 2. HEADING-BASED "SANDWICH" EXTRACTION ---
        $('h1, h2, h3, h4, h5, h6, strong, b, .at-section-text-description-title').each((i, el) => {
            const headingText = $(el).text().trim();
            if (headingText.length < 3 || headingText.length > 80) return;

            const lowerHeading = headingText.toLowerCase();

            // SKIP IF IT'S AN INTRODUCTION OR FLUFF
            if (skipKeywords.some(kw => lowerHeading.includes(kw))) return;

            // CHECK IF IT'S A VALID JOB SECTION
            if (headingKeywords.some(kw => lowerHeading.includes(kw)) || headingText.endsWith(':')) {

                // Determine Category for AI/UI context
                let category = "REQUIRED"; // Default: Requirements, Qualifications, Education
                if (lowerHeading.includes('duty') || lowerHeading.includes('responsibilit') || lowerHeading.includes('output') || lowerHeading.includes('role')) {
                    category = "DUTIES";
                } else if (lowerHeading.includes('desired') || lowerHeading.includes('advantage') || lowerHeading.includes('prefer')) {
                    category = "PREFERRED";
                }

                // Temporary storage for this section's bullets
                let sectionBullets: string[] = [];

                // Grab siblings until next header
                let next = $(el).next();
                let limit = 0;
                while (next.length > 0 && limit < 15) {
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
                        // If it's a long paragraph, it might be a description, but we prefer bullets
                        if (siblingText.length > 20 && siblingText.length < 500 && !siblingText.includes('Apply')) {
                            // Split by standard bullet characters if present
                            const lines = siblingText.split(/\n|•| \- /).filter(l => l.trim().length > 10);
                            lines.forEach(line => sectionBullets.push(line.trim()));
                        }
                    }
                    next = next.next();
                    limit++;
                }

                // If we found bullets, add the section
                if (sectionBullets.length > 0) {
                    requirements.push(`SECTION: [${category}] ${headingText}`);
                    sectionBullets.forEach(bullet => {
                        if (!requirements.includes(bullet)) requirements.push(bullet);
                    });
                }
            }
        });

        // --- 3. SOURCE SPECIFIC FALLBACKS (If sections didn't catch enough) ---
        if (requirements.length < 5) {
            if (url.includes('pnet.co.za')) {
                $('[data-at="job-ad-content"], .listing-content, .job-description, .details-section, .at-section-text-description-content, .card-content')
                    .find('li, p').each((i, el) => {
                        const text = $(el).text().trim();
                        if (text.length > 25 && text.length < 600 && !text.includes('Apply')) {
                            requirements.push(text);
                        }
                    });
            }
            else if (url.includes('careers24.com')) {
                $('.job-description, .vacancy-details, #job-description, .c24-vacancy-details').find('li, p').each((i, el) => {
                    const text = $(el).text().trim();
                    if (text.length > 20 && text.length < 500) requirements.push(text);
                });
            }
            else if (url.includes('linkedin.com')) {
                $('.description__text, .show-more-less-html__markup, .jobs-description-content__text').find('li, p').each((i, el) => {
                    const text = $(el).text().trim();
                    if (text.length > 20 && text.length < 500) requirements.push(text);
                });
            }
        }

        // Final cleanup: remove duplicates and very short lines
        let uniqueReqs = Array.from(new Set(requirements))
            .filter(r => r.length > 5)
            .slice(0, 25);

        if (uniqueReqs.length === 0) {
            // Ultimate fallback
            $('article, main, .job-ad-content').find('p, li').each((i, el) => {
                const text = $(el).text().trim();
                if (text.length > 50 && text.length < 400 && !text.includes('cookie')) {
                    uniqueReqs.push(text);
                }
            });
            uniqueReqs = Array.from(new Set(uniqueReqs)).slice(0, 10);
        }

        return NextResponse.json({
            requirements: uniqueReqs.length > 0 ? uniqueReqs : ["Could not automatically extract requirements. Please paste the job description manually."]
        });

    } catch (error: any) {
        console.error("[Scrape API] Error:", error);
        return NextResponse.json({ error: "Failed to scrape job details. The site might be blocking robots." }, { status: 500 });
    }
}
