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

        // --- SOURCE SPECIFIC SELECTORS ---

        if (url.includes('pnet.co.za')) {
            // PNet Specific - More aggressive selectors
            $('[data-at="job-ad-content"], .listing-content, .job-description, .details-section, .at-section-text-description-content, .card-content')
                .find('li, p, div').each((i, el) => {
                    const text = $(el).text().trim();
                    if (text.length > 25 && text.length < 600 && !text.includes('Apply')) {
                        requirements.push(text);
                    }
                });
        }
        else if (url.includes('careers24.com')) {
            // Careers24 Specific
            $('.job-description, .vacancy-details, #job-description, .c24-vacancy-details').find('li, p').each((i, el) => {
                const text = $(el).text().trim();
                if (text.length > 20 && text.length < 500) requirements.push(text);
            });
        }
        else if (url.includes('linkedin.com')) {
            // LinkedIn Specific
            $('.description__text, .show-more-less-html__markup, .jobs-description-content__text').find('li, p').each((i, el) => {
                const text = $(el).text().trim();
                if (text.length > 20 && text.length < 500) requirements.push(text);
            });
        }
        else {
            // Generic Fallback - Search for sections that look like requirements
            $('article, main, #main-content, .content').find('li, p').each((i, el) => {
                const text = $(el).text().trim();
                if (text.length > 30 && text.length < 500) {
                    const lower = text.toLowerCase();
                    if (lower.includes('requirement') || lower.includes('must') || lower.includes('experience') || lower.includes('skills')) {
                        requirements.push(text);
                    }
                }
            });
        }

        // Final cleanup: remove duplicates and very short lines
        let uniqueReqs = Array.from(new Set(requirements))
            .filter(r => r.length > 15)
            .slice(0, 15); // Limit to top 15 requirements

        if (uniqueReqs.length === 0) {
            // Ultimate fallback: Just get all decent-sized paragraphs in the main body
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
