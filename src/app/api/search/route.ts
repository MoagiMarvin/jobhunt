import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const source = searchParams.get('source'); // Optional parameter to fetch only one source

    if (!query) {
        return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    // If a specific source is requested, only run that one (for background loading)
    if (source) {
        let jobs: any[] = [];
        switch (source.toLowerCase()) {
            case 'pnet': jobs = await scrapePNet(query); break;
            case 'linkedin': jobs = await scrapeLinkedIn(query); break;
            case 'careers24': jobs = await scrapeCareers24(query); break;
            case 'adzuna': jobs = await scrapeAdzuna(query); break;
            case 'indeed': jobs = await scrapeAdzuna(query); break; // Legacy fallback
        }
        return NextResponse.json({ jobs });
    }

    // Default: Run all in parallel (for legacy support or thorough searches)
    const [pnetJobs, linkedinJobs, careersJobs, adzunaJobs] = await Promise.all([
        scrapePNet(query).catch(() => []),
        scrapeLinkedIn(query).catch(() => []),
        scrapeCareers24(query).catch(() => []),
        scrapeAdzuna(query).catch(() => [])
    ]);

    return NextResponse.json({ jobs: [...pnetJobs, ...linkedinJobs, ...careersJobs, ...adzunaJobs] });
}

// Scrape Adzuna SA (Now replaces Indeed)
async function scrapeAdzuna(query: string) {
    try {
        console.log(`[Scraper] Starting Adzuna for: ${query}`);
        const url = `https://www.adzuna.co.za/search?q=${encodeURIComponent(query)}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            },
            cache: 'no-store'
        });

        if (!response.ok) return [];

        const html = await response.text();
        const $ = cheerio.load(html);
        const jobs: any[] = [];

        $('[data-ad-id]').each((i, el) => {
            const titleEl = $(el).find('h2 a').first();
            const title = titleEl.text().trim();
            const link = titleEl.attr('href');
            const fullLink = link ? (link.startsWith('http') ? link : `https://www.adzuna.co.za${link}`) : '';

            const company = $(el).find('.ui-job-card-company, .company').first().text().trim() || "Adzuna Employer";
            const location = $(el).find('.ui-job-card-location, .location').first().text().trim() || "South Africa";

            if (title && fullLink) {
                jobs.push({
                    id: `adzuna-${Date.now()}-${i}`,
                    title,
                    company,
                    location,
                    link: fullLink,
                    source: 'Adzuna (Indeed Alternative)',
                    date: 'Recently'
                });
            }
        });

        return jobs.slice(0, 15);
    } catch (e) {
        return [];
    }
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
            },
            cache: 'no-store'
        });

        if (!response.ok) return [];

        const html = await response.text();
        const $ = cheerio.load(html);
        const jobs: any[] = [];

        $('[data-at="job-item"]').each((i, el) => {
            const title = $(el).find('[data-at="job-item-title"]').first().text().trim() || $(el).find('h2').first().text().trim();
            const link = $(el).find('a').first().attr('href');
            const fullLink = link ? (link.startsWith('http') ? link : `https://www.pnet.co.za${link}`) : '';
            const company = $(el).find('[data-at="job-item-company-name"]').first().text().trim() || "PNet Employer";
            const location = $(el).find('[data-at="job-item-location"]').first().text().trim() || "South Africa";

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

        return jobs;
    } catch (e) {
        return [];
    }
}

// Scrape LinkedIn
async function scrapeLinkedIn(query: string) {
    try {
        console.log(`[Scraper] Starting LinkedIn for: ${query}`);
        const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(query)}&location=South%20Africa&f_TPR=r604800&position=1&pageNum=0`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-GB,en;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cache-Control': 'max-age=0',
            },
            cache: 'no-store'
        });

        if (!response.ok) return [];

        const html = await response.text();
        const $ = cheerio.load(html);
        const jobs: any[] = [];

        $('.base-card, .job-search-card, .base-search-card').each((i, el) => {
            const title = $(el).find('.base-search-card__title').first().text().trim() || $(el).find('h3').first().text().trim();
            const company = $(el).find('.base-search-card__subtitle').first().text().trim() || $(el).find('h4').first().text().trim();
            const location = $(el).find('.job-search-card__location').first().text().trim() || $(el).find('.base-search-card__metadata').first().text().trim();
            const link = $(el).find('a.base-card__full-link').attr('href') || $(el).find('a').attr('href');

            if (title && link && title.length < 150) {
                jobs.push({
                    id: `li-${Date.now()}-${i}`,
                    title,
                    company,
                    location,
                    link,
                    source: 'LinkedIn',
                    date: 'Recently'
                });
            }
        });

        return jobs.slice(0, 3); // STRICT LIMIT TO 3 AS REQUESTED
    } catch (e) {
        return [];
    }
}

// Scrape Careers24
async function scrapeCareers24(query: string) {
    try {
        console.log(`[Scraper] Starting Careers24 for: ${query}`);
        const url = `https://www.careers24.com/jobs/search/?q=${encodeURIComponent(query)}&searchtype=keyword`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.1 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Referer': 'https://www.careers24.com/',
            },
            cache: 'no-store'
        });

        if (!response.ok) return [];

        const html = await response.text();
        const $ = cheerio.load(html);
        const jobs: any[] = [];

        $('.job-card, div.c24-full-job-card, div.job-search-listing, article.job-card').each((i, el) => {
            const titleEl = $(el).find('h2, .job-title, a[data-job-id], .c24-job-title').first();
            const title = titleEl.text().trim();
            const link = titleEl.attr('href') || $(el).find('a').first().attr('href');
            const fullLink = link ? (link.startsWith('http') ? link : `https://www.careers24.com${link}`) : '';

            const company = $(el).find('.company-name, .job-card__company, .c24-company-name').first().text().trim() || "Careers24 Employer";
            const location = $(el).find('.location, .job-card__location, .c24-location').first().text().trim() || "South Africa";

            if (title && fullLink && title.length < 150) {
                // Heuristic check to ensure it's not a generic sidebar
                if (title.length > 5) {
                    jobs.push({
                        id: `c24-${Date.now()}-${i}`,
                        title,
                        company,
                        location,
                        link: fullLink,
                        source: 'Careers24',
                        date: 'Recently'
                    });
                }
            }
        });

        return jobs.slice(0, 15);
    } catch (e) {
        return [];
    }
}
