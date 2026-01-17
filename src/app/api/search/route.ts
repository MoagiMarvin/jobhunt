import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { supabase } from '@/lib/supabase';

// Search API for JobHunt (v3.0 - Integrated with User Reference Logic)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const source = searchParams.get('source');

    if (!query) {
        return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    if (source) {
        let jobs: any[] = [];
        try {
            switch (source.toLowerCase()) {
                case 'pnet': jobs = await scrapePNet(query); break;
                case 'linkedin': jobs = await scrapeLinkedIn(query); break;
                case 'careers24': jobs = await scrapeCareers24(query); break;
                case 'adzuna':
                case 'indeed': jobs = await scrapeAdzuna(query); break;
                case 'local': jobs = await searchLocalJobs(query); break;
                // Discovery Volume Sources
                case 'discovery':
                    const discResults = await Promise.all([
                        scrapeStandardBank(query).catch(() => []),
                        scrapeCapitecLive(query).catch(() => []),
                        searchLocalJobs(query).catch(() => [])
                    ]);
                    jobs = discResults.flat();
                    break;
            }
        } catch (e) {
            console.error(`[API] Source error (${source}):`, e);
        }
        return NextResponse.json({ jobs });
    }

    // Parallel fetch fallback (including everything)
    const results = await Promise.all([
        searchLocalJobs(query).catch(() => []),
        scrapePNet(query).catch(() => []),
        scrapeLinkedIn(query).catch(() => []),
        scrapeCareers24(query).catch(() => []),
        scrapeAdzuna(query).catch(() => []),
        scrapeStandardBank(query).catch(() => []),
        scrapeCapitecLive(query).catch(() => [])
    ]);

    return NextResponse.json({ jobs: results.flat() });
}

/**
 * RELEVANCE GUARD: Ensures the job title actually contains the search query.
 * Prevents "Junior Accountant" for "Driver" searches.
 */
function isRelevant(title: string, query: string): boolean {
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length >= 2);
    if (keywords.length === 0) return true;
    const titleLower = title.toLowerCase();
    return keywords.some(keyword => titleLower.includes(keyword));
}

// --- SCRAPERS ---

async function scrapePNet(query: string) {
    try {
        // Optimized SEO URL Pattern from reference
        const keyword = query.trim().replace(/\s+/g, '-').toLowerCase();
        const url = `https://www.pnet.co.za/jobs/${keyword}`;

        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                'Referer': 'https://www.pnet.co.za/',
            },
            signal: AbortSignal.timeout(12000)
        });
        if (!res.ok) return [];

        const html = await res.text();
        const $ = cheerio.load(html);
        const jobs: any[] = [];

        // Broad Selectors focusing on the job cards
        const articles = $('article, .job-item, .res-card, [data-at="job-item"]');

        articles.each((i, el) => {
            const titleEl = $(el).find('h2, h3, [data-at="job-item-title"], .job-title, .res-card__title').first();

            // TARGETED LINK EXTRACTION: Find the link INSIDE the title or the title itself if it's an <a>
            const titleLink = titleEl.find('a').first().length > 0 ? titleEl.find('a').first() : (titleEl.is('a') ? titleEl : null);

            // FALLBACK: Look for direct job-ad links elsewhere in the card if title link is missing
            const directLinkEl = $(el).find('a[href*="/job-ad/"]').first();
            const linkEl = titleLink || directLinkEl;

            const companyEl = $(el).find('[data-at="job-item-company-name"], .res-card__subtitle, .company').first();
            const locationEl = $(el).find('[data-at="job-item-location"], .res-card__metadata--location, .location').first();

            const title = titleEl.text().trim();
            const link = linkEl ? linkEl.attr('href') : null;
            const company = companyEl.text().trim();
            const location = locationEl.text().trim();

            // Quality Filter: MUST have Title, Link, Company, and Location to be valid.
            // Banners and "Top Jobs" headers usually fail this check.
            if (title && link && company && location && isRelevant(title, query)) {
                // Ensure link is direct to the job-ad if possible
                const fullLink = link.startsWith('http') ? link : `https://www.pnet.co.za${link}`;

                jobs.push({
                    id: `pnet-${Date.now()}-${i}`,
                    title,
                    company,
                    location,
                    link: fullLink,
                    source: 'PNet'
                });
            }
        });

        // "Plan B" Fallback Strategy from reference - only if standard cards fail
        if (jobs.length === 0) {
            $('a[href*="/job-ad/"]').each((i, el) => {
                const title = $(el).text().trim();
                const link = $(el).attr('href');
                if (title.length > 5 && link && isRelevant(title, query) && !title.includes('Login')) {
                    const fullLink = link.startsWith('http') ? link : `https://www.pnet.co.za${link}`;
                    jobs.push({
                        id: `pnet-fb-${Date.now()}-${i}`,
                        title,
                        company: "PNet Listing",
                        location: "South Africa",
                        link: link.startsWith('http') ? link : `https://www.pnet.co.za${link}`,
                        source: 'PNet'
                    });
                }
            });
        }

        return jobs.slice(0, 15);
    } catch (e) { return []; }
}

async function scrapeCareers24(query: string) {
    try {
        // Optimized URL Pattern from reference
        const q = query.trim().replace(/\s+/g, '-').toLowerCase();
        const url = `https://www.careers24.com/jobs/kw-${q}/m-true/`;

        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.1 Safari/537.36',
                'Referer': 'https://www.careers24.com/',
            },
            signal: AbortSignal.timeout(12000)
        });
        if (!res.ok) return [];

        const html = await res.text();
        const $ = cheerio.load(html);
        const jobs: any[] = [];

        // Generic Bootstrap-like selectors from reference
        const jobRows = $('.job-card, .c24-job-card, .job_search_results .row');

        jobRows.each((i, el) => {
            const titleEl = $(el).find('h2, h3, .job-title, .c24-job-title').first();

            // DEEP LINK LOGIC: Prioritize the link attached to the title
            const titleLink = titleEl.find('a').first().length > 0 ? titleEl.find('a').first() : (titleEl.is('a') ? titleEl : $(el).find('a').first());

            const companyEl = $(el).find('.company-name, .job-card-company, .c24-company-name').first();
            const locationEl = $(el).find('.location, .job-card-location, .c24-location').first();

            const title = titleEl.text().trim();
            const link = titleLink.attr('href');

            if (title && link && isRelevant(title, query)) {
                // Ensure link is a direct vacancy page
                const fullLink = link.startsWith('http') ? link : `https://www.careers24.com${link}`;

                jobs.push({
                    id: `c24-${Date.now()}-${i}`,
                    title,
                    company: companyEl.text().trim() || "Careers24",
                    location: locationEl.text().trim() || "South Africa",
                    link: fullLink,
                    source: 'Careers24'
                });
            }
        });

        return jobs.slice(0, 15);
    } catch (e) { return []; }
}

async function scrapeLinkedIn(query: string) {
    try {
        const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(query)}&location=South%20Africa&f_TPR=r604800`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' },
            cache: 'no-store',
            signal: AbortSignal.timeout(10000)
        });
        if (!res.ok) return [];

        const html = await res.text();
        const $ = cheerio.load(html);
        const jobs: any[] = [];

        $('.base-card, .job-search-card, .base-search-card').each((i, el) => {
            const title = $(el).find('.base-search-card__title, h3').first().text().trim();

            // DEEP LINK LOGIC: Target the hidden full-link that contains the ad ID
            const linkEl = $(el).find('a.base-card__full-link, a.base-search-card__full-link, a').first();
            const link = linkEl.attr('href');

            if (title && link && isRelevant(title, query)) {
                // Remove tracking parameters for cleaner scraping
                const cleanLink = link.split('?')[0];

                jobs.push({
                    id: `li-${Date.now()}-${i}`,
                    title,
                    company: $(el).find('.base-search-card__subtitle').text().trim() || "LinkedIn Employer",
                    location: $(el).find('.job-search-card__location').text().trim() || "South Africa",
                    link: cleanLink,
                    source: 'LinkedIn'
                });
            }
        });
        return jobs.slice(0, 3);
    } catch (e) { return []; }
}

async function scrapeAdzuna(query: string) {
    try {
        const url = `https://www.adzuna.co.za/search?q=${encodeURIComponent(query)}`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' },
            signal: AbortSignal.timeout(12000)
        });
        if (!res.ok) return [];

        const html = await res.text();
        const $ = cheerio.load(html);
        const jobs: any[] = [];

        $('[data-ad-id]').each((i, el) => {
            const titleEl = $(el).find('h2 a').first();
            const title = titleEl.text().trim();
            const link = titleEl.attr('href');

            if (title && link && isRelevant(title, query)) {
                const fullLink = link.startsWith('http') ? link : `https://www.adzuna.co.za${link}`;

                jobs.push({
                    id: `ind-${Date.now()}-${i}`,
                    title,
                    company: $(el).find('.ui-job-card-company, .company').first().text().trim() || "Indeed Professional",
                    location: $(el).find('.ui-job-card-location, .location').first().text().trim() || "South Africa",
                    link: fullLink,
                    source: 'Indeed'
                });
            }
        });
        return jobs.slice(0, 10);
    } catch (e) { return []; }
}

async function searchLocalJobs(query: string) {
    try {
        const { data, error } = await supabase
            .from('synced_jobs')
            .select(`
                id,
                title,
                location,
                application_url,
                recruiter_id,
                recruiter_profiles (
                    company_name
                )
            `)
            .ilike('title', `%${query}%`)
            .eq('is_active', true)
            .limit(20);

        if (error) throw error;

        return (data || []).map(job => ({
            id: job.id,
            title: job.title,
            company: (job.recruiter_profiles as any)?.company_name || 'Verified Employer',
            location: job.location || 'South Africa',
            link: job.application_url,
            source: 'Discovery Engine'
        }));
    } catch (e) {
        console.error("[Search] Local search failed:", e);
        return [];
    }
}

async function scrapeStandardBank(query: string) {
    const qLower = query.toLowerCase();
    if (!qLower.includes('bank') && !qLower.includes('grad') && !qLower.includes('intern') && !qLower.includes('learn') && !qLower.includes('bursary')) return [];
    try {
        const url = "https://www.standardbank.com/sbg/standard-bank-group/careers/early-careers";
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' },
            signal: AbortSignal.timeout(8000)
        });
        if (!res.ok) return [];
        const html = await res.text();
        const $ = cheerio.load(html);
        const results: any[] = [];
        $('a').each((i, el) => {
            const title = $(el).text().trim();
            const href = $(el).attr('href');
            if (title.length > 5 && href && (href.includes('graduate') || href.includes('intern')) && isRelevant(title, query)) {
                results.push({
                    id: `sb-${Date.now()}-${i}`,
                    title,
                    company: "Standard Bank",
                    location: "South Africa",
                    link: href.startsWith('http') ? href : `https://www.standardbank.com${href}`,
                    source: 'Discovery Engine (Live)'
                });
            }
        });
        if (results.length === 0 && (query.toLowerCase().includes('bank') || query.toLowerCase().includes('grad'))) {
            results.push({ id: `sb-p-${Date.now()}`, title: "Standard Bank Early Careers Portal", company: "Standard Bank", location: "South Africa", link: url, source: 'Discovery Engine (Live)' });
        }
        return results;
    } catch (e) { return []; }
}

async function scrapeCapitecLive(query: string) {
    const qLower = query.toLowerCase();
    if (!qLower.includes('capitec') && !qLower.includes('grad') && !qLower.includes('intern') && !qLower.includes('learn')) return [];
    try {
        const url = "https://www.capitecbank.co.za/about-us/careers/";
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' },
            signal: AbortSignal.timeout(8000)
        });
        if (!res.ok) return [];
        const html = await res.text();
        const $ = cheerio.load(html);
        const results: any[] = [];
        $('a').each((i, el) => {
            const text = $(el).text().trim();
            const href = $(el).attr('href');
            if (href && (href.includes('career') || href.includes('job') || href.includes('graduate')) && isRelevant(text, query)) {
                results.push({
                    id: `cap-${Date.now()}-${i}`,
                    title: text || "Capitec Careers",
                    company: "Capitec Bank",
                    location: "South Africa",
                    link: href.startsWith('http') ? href : `https://www.capitecbank.co.za${href}`,
                    source: 'Discovery Engine (Live)'
                });
            }
        });
        return results;
    } catch (e) { return []; }
}

async function scrapeShoprite(query: string) {
    const qLower = query.toLowerCase();
    if (!qLower.includes('shoprite') && !qLower.includes('grad') && !qLower.includes('intern') && !qLower.includes('learn')) return [];
    try {
        const url = "https://www.shopriteholdings.co.za/careers.html";
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) });
        if (!res.ok) return [];
        const html = await res.text();
        const $ = cheerio.load(html);
        const results: any[] = [];
        $('a').each((i, el) => {
            const text = $(el).text().trim();
            const href = $(el).attr('href');
            if (href && (href.includes('graduate') || href.includes('careers') || href.includes('programme')) && isRelevant(text, query)) {
                results.push({
                    id: `shop-${Date.now()}-${i}`,
                    title: text || "Shoprite Careers",
                    company: "Shoprite Group",
                    location: "South Africa",
                    link: href.startsWith('http') ? href : `https://www.shopriteholdings.co.za/${href}`,
                    source: 'Discovery Engine (Live)'
                });
            }
        });
        return results;
    } catch (e) { return []; }
}
