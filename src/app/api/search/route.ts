import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    // Run scrapers in parallel but handle errors gracefully
    const [pnetJobs, linkedinJobs] = await Promise.all([
        scrapePNet(query).catch(e => { console.error("PNet Parallel Error:", e); return []; }),
        scrapeLinkedIn(query).catch(e => { console.error("LinkedIn Parallel Error:", e); return []; })
    ]);

    const allJobs = [...pnetJobs, ...linkedinJobs];

    return NextResponse.json({ jobs: allJobs });
}

// Scrape PNET
async function scrapePNet(query: string) {
    try {
        console.log(`[Scraper] Starting PNet for: ${query}`);
        const url = `https://www.pnet.co.za/jobs?q=${encodeURIComponent(query)}&radius=30&sort=2`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                'Referer': 'https://www.pnet.co.za/',
                'DNT': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error(`[Scraper] PNet Error: ${response.status} ${response.statusText}`);
            return [];
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const jobs: any[] = [];

        // Use very specific selectors to avoid garbage text from parent containers
        $('[data-at="job-item"]').each((i, el) => {
            const title = $(el).find('[data-at="job-item-title"]').first().text().trim() ||
                $(el).find('h2').first().text().trim();

            const link = $(el).find('a').first().attr('href');
            const fullLink = link ? (link.startsWith('http') ? link : `https://www.pnet.co.za${link}`) : '';

            const company = $(el).find('[data-at="job-item-company-name"]').first().text().trim() ||
                "PNet Employer";

            const location = $(el).find('[data-at="job-item-location"]').first().text().trim() ||
                "South Africa";

            if (title && fullLink && title.length < 150) {
                jobs.push({
                    id: `pnet-${Date.now()}-${i}`,
                    title,
                    company,
                    location,
                    link: fullLink,
                    source: 'PNet',
                    date: 'Recently'
                });
            }
        });

        console.log(`[Scraper] PNet found ${jobs.length} jobs`);
        return jobs;
    } catch (e) {
        console.error("[Scraper] PNet Exception:", e);
        return [];
    }
}

// Scrape LinkedIn (Public Search)
async function scrapeLinkedIn(query: string) {
    try {
        console.log(`[Scraper] Starting LinkedIn for: ${query}`);
        const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(query)}&location=South%20Africa&f_TPR=r604800&position=1&pageNum=0`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-GB,en;q=0.9,en-US;q=0.8,en;q=0.7',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'max-age=0',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error(`[Scraper] LinkedIn Error: ${response.status} ${response.statusText}`);
            return [];
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const jobs: any[] = [];

        $('.base-card, .job-search-card, .base-search-card').each((i, el) => {
            const title = $(el).find('.base-search-card__title').first().text().trim() ||
                $(el).find('h3').first().text().trim();

            const company = $(el).find('.base-search-card__subtitle').first().text().trim() ||
                $(el).find('h4').first().text().trim();

            const location = $(el).find('.job-search-card__location').first().text().trim() ||
                $(el).find('.base-search-card__metadata').first().text().trim();

            const link = $(el).find('a.base-card__full-link').attr('href') ||
                $(el).find('a').attr('href');

            if (title && link && title.length < 150) {
                jobs.push({
                    id: `li-${Date.now()}-${i}`,
                    title,
                    company: company || "LinkedIn Employer",
                    location: location || "South Africa",
                    link: link,
                    source: 'LinkedIn',
                    date: 'Recently'
                });
            }
        });

        console.log(`[Scraper] LinkedIn found ${jobs.length} jobs`);
        return jobs;
    } catch (e) {
        console.error("[Scraper] LinkedIn Exception:", e);
        return [];
    }
}
