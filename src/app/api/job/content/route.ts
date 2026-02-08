import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log(`[JOB_CONTENT] Fetching: ${url}`);

        let response;
        let html;

        // Attempt 1: Stealth Mode (Google Bot / Chrome)
        try {
            response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                    'Referer': 'https://www.google.com/',
                    'Cache-Control': 'no-cache'
                },
                signal: AbortSignal.timeout(10000) // 10s timeout
            });
            if (!response.ok) throw new Error(`Status ${response.status}`);
            html = await response.text();

        } catch (e: any) {
            console.log(`[JOB_CONTENT] Stealth fetch failed (${e.message}). Retrying with minimal headers...`);

            // Attempt 2: Minimal / Native Fetch
            response = await fetch(url, {
                headers: {
                    'User-Agent': 'JobHunt/1.0 (Education/Research)'
                },
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                throw new Error(`Upstream Error: ${response.status} ${response.statusText}`);
            }
            html = await response.text();
        }
        const $ = cheerio.load(html);

        // --- SMART DEEP LINKING: EXTRACT DIRECT APPLY LINK ---
        let directApplyUrl: string | null = null;

        // Strategy 1: JSON-LD Schema (Most Reliable)
        try {
            $('script[type="application/ld+json"]').each((i, el) => {
                const jsonText = $(el).html();
                if (jsonText) {
                    try {
                        const data = JSON.parse(jsonText);
                        console.log(`[JOB_CONTENT] Found JSON-LD type: ${data['@type']}`);

                        // Check if it's a JobPosting and has a URL
                        if (data['@type'] === 'JobPosting') {
                            console.log(`[JOB_CONTENT] JobPosting URL: ${data.url}`);
                            if (data.url && !data.url.includes('linkedin.com') && !data.url.includes('pnet.co.za')) {
                                directApplyUrl = data.url;
                            }
                        }
                    } catch (jsonErr) {
                        console.log(`[JOB_CONTENT] JSON parse error: ${jsonErr}`);
                    }
                }
            });
        } catch (err) {
            console.log("JSON-LD parse error", err);
        }

        // Strategy 2: HTML Link Scan (Fallback)
        if (!directApplyUrl) {
            console.log("[JOB_CONTENT] No JSON-LD link. Scanning <a> tags...");
            $('a').each((i, el) => {
                const href = $(el).attr('href');
                if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
                    const lowerHref = href.toLowerCase();
                    // Log potentially interesting links for debugging
                    if (lowerHref.includes('apply') || lowerHref.includes('job') || lowerHref.includes('career')) {
                        // console.log(`[JOB_CONTENT] Potential Link: ${href}`);
                    }

                    // Prioritize known ATS domains (Vodacom/Eightfold, MTN/Workday, PNet specific)
                    if (lowerHref.includes('eightfold.ai') || lowerHref.includes('myworkdayjobs.com') || lowerHref.includes('breezy.hr') || lowerHref.includes('greenhouse.io') || lowerHref.includes('lever.co')) {
                        console.log(`[JOB_CONTENT] Found ATS Link: ${href}`);
                        if (!directApplyUrl) directApplyUrl = href;
                        // If we found a generic one but this is a specific ATS, upgrade
                        else if ((lowerHref.includes('eightfold.ai') || lowerHref.includes('myworkdayjobs.com')) && !directApplyUrl.includes('eightfold') && !directApplyUrl.includes('workday')) {
                            directApplyUrl = href;
                        }
                    }
                }
            });
        }

        // Aggressive Cleanup: Remove ALL media, scripts, styles, and interactive elements
        $('script, style, noscript, iframe, svg, img, picture, video, audio, canvas, map, object, form, input, button, select, textarea, nav, footer, header, aside, .ad, .advert, .cookie-banner, .popup, .modal, .social-share, .related-jobs').remove();

        // Unwrap links (keep text, remove <a>) to prevent user clicking away accidentally
        // $('a').contents().unwrap(); // Optional: decided to keep links but maybe target=_blank in frontend? For now, let's keep basic links but strip classes.

        // Remove empty tags
        $('div, span, p, li, ul, ol').each((i, el) => {
            if ($(el).text().trim().length === 0) $(el).remove();
        });

        // Attempt to find the main job content container
        let content = '';

        // PNet / LinkedIn / Generic Heuristics
        const selectors = [
            '[data-at="job-ad-content"]',
            '.bg-white.rounded-lg',
            '#job-details',
            '.job-description',
            '.description',
            'main',
            'article',
            '#content'
        ];

        for (const selector of selectors) {
            if ($(selector).length > 0) {
                // Get the longest container
                let bestMatch = '';
                $(selector).each((i, el) => {
                    const html = $(el).html() || '';
                    if (html.length > bestMatch.length && html.includes('<')) bestMatch = html;
                });

                if (bestMatch.length > 500) {
                    content = bestMatch;
                    break;
                }
            }
        }

        // Fallback: Body content (cleaned)
        if (!content) {
            // If no specific container, try to find the biggest block of text/p tags
            $('body').find('p, ul, ol').each((i, el) => {
                const html = $.html(el);
                if (html.length > 100) content += html;
            });
        }


        // Final cleanup of the extracted HTML
        // We want to preserve structure but remove dangerous/messy bits
        // For now, we return the raw HTML of the container
        // In a real app, strict sanitization is needed on the client

        return NextResponse.json({
            content: content,
            url: url,
            directApplyUrl: directApplyUrl
        });

    } catch (error: any) {
        console.error('[JOB_CONTENT] Error:', error);
        return NextResponse.json(
            { error: 'Failed to load job details. The site might be blocking our preview.', details: error.message },
            { status: 500 }
        );
    }
}
