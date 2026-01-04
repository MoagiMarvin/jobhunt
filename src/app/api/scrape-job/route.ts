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
        const headingKeywords = ['requirement', 'duty', 'responsibility', 'qualification', 'education', 'key responsibility', 'what you will need', 'minimum requirement', 'skills', 'skilled'];

        // --- 1. MANDATORY KEYWORDS (Grade 10 / Matric) ---
        $('p, li, div, span').each((i, el) => {
            const text = $(el).text().trim();
            const lower = text.toLowerCase();
            if ((lower.includes('matric') || lower.includes('grade 10') || lower.includes('grad 10') || lower.includes('matrixc')) && text.length < 500) {
                if (!requirements.includes(text)) requirements.push(text);
            }
        });

        // --- 2. HEADING-BASED SECTION EXTRACTION ---
        // We look for headings and grab siblings until the next heading
        $('h1, h2, h3, h4, h5, h6, strong, b, .at-section-text-description-title').each((i, el) => {
            const headingText = $(el).text().trim();
            const lowerHeading = headingText.toLowerCase();

            if (headingKeywords.some(kw => lowerHeading.includes(kw))) {
                // Add the heading itself for context
                requirements.push(`SECTION: ${headingText}`);

                // Grab siblings until next header or container end
                let next = $(el).next();
                let limit = 0;
                while (next.length > 0 && limit < 15) {
                    if (next.is('h1, h2, h3, h4, h5, h6, strong, b')) break;

                    const siblingText = next.text().trim();
                    if (siblingText.length > 15 && siblingText.length < 1000) {
                        // If it has children (like a list), grab those specifically
                        const listItems = next.find('li');
                        if (listItems.length > 0) {
                            listItems.each((j, li) => {
                                const liText = $(li).text().trim();
                                if (liText) requirements.push(liText);
                            });
                        } else {
                            requirements.push(siblingText);
                        }
                    }
                    next = next.next();
                    limit++;
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
