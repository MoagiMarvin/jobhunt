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
                // Add pnet case explicitly to match source param
                case 'pnet': jobs = await scrapePNet(query); break;
                case 'local':
                    const ind = searchParams.get('industry');
                    const lvl = searchParams.get('level');
                    jobs = await searchLocalJobs(query, ind, lvl);
                    break;
                // Discovery Volume Sources (External only to avoid local duplicates)
                case 'discovery':
                    const discResults = await Promise.all([
                        scrapeStandardBank(query).catch(() => []),
                        scrapeCapitecLive(query).catch(() => []),
                        scrapeShoprite(query).catch(() => [])
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
        scrapePNet(query).catch(() => []),
        scrapeLinkedIn(query).catch(() => []),
        scrapeCareers24(query).catch(() => []),
        scrapeAdzuna(query).catch(() => [])
    ]);

    return NextResponse.json({ jobs: results.flat() });
}

/**
 * RELEVANCE GUARD: Ensures the job title actually contains the search query.
 * Prevents "Junior Accountant" for "Driver" searches.
 */
/**
 * RELEVANCE GUARD: Ensures the job title actually contains the search query.
 * For external sources, we trust their engine more, so we relax this.
 */
function isRelevant(title: string, query: string, relax = false): boolean {
    if (relax) return true; // Trust the source's own search engine

    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length >= 2);
    if (keywords.length === 0) return true;
    const titleLower = title.toLowerCase();

    // Check for direct matches
    if (keywords.some(keyword => titleLower.includes(keyword))) return true;

    // Synonyms for Software / IT
    const techSynonyms = ['dev', 'engineer', 'technician', 'programmer', 'coder', 'architect', 'analyst', 'systems', 'data', 'cloud', 'digital', 'it'];
    const isTechSearch = keywords.some(k => ['software', 'dev', 'code', 'program', 'tech', 'it', 'web', 'app', 'computer', 'digital'].includes(k));
    const isTechJob = techSynonyms.some(s => titleLower.includes(s));

    if (isTechSearch && isTechJob) return true;

    return false;
}

// --- SCRAPERS ---

async function scrapePNet(query: string) {
    try {
        // REVERTED to SEO URL Pattern - It's more resistant to 403 blocks than the search engine URL
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
        const articles = $('article, .job-item, .res-card, [data-at="job-item"], .job-ad-component');

        articles.each((i, el) => {
            const titleEl = $(el).find('h2, h3, [data-at="job-item-title"], .job-title, .res-card__title, .job-ad-title').first();

            // TARGETED LINK EXTRACTION
            const titleLink = titleEl.find('a').first().length > 0 ? titleEl.find('a').first() : (titleEl.is('a') ? titleEl : $(el).find('a').first());

            const directLinkEl = $(el).find('a[href*="/job-ad/"]').first();
            const linkEl = titleLink || directLinkEl;

            const companyEl = $(el).find('[data-at="job-item-company-name"], .res-card__subtitle, .company, .job-ad-company').first();
            const locationEl = $(el).find('[data-at="job-item-location"], .res-card__metadata--location, .location, .job-ad-location').first();

            const title = titleEl.text().trim();
            const link = linkEl ? linkEl.attr('href') : null;
            const company = companyEl.text().trim();
            const location = locationEl.text().trim();

            if (title && link && company && isRelevant(title, query, true)) {
                const fullLink = link.startsWith('http') ? link : `https://www.pnet.co.za${link}`;

                jobs.push({
                    id: `pnet-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
                    title,
                    company,
                    location: location || "South Africa",
                    link: fullLink,
                    source: 'PNet'
                });
            }
        });

        console.log(`[PNet Scraper] Found ${jobs.length} jobs via Primary Plan`);

        // "Plan B" Fallback Strategy from reference - only if standard cards fail
        if (jobs.length === 0) {
            console.log(`[PNet Scraper] Triggering Plan B...`);
            $('a[href*="/job-ad/"]').each((i, el) => {
                const title = $(el).find('span, div, h2, h3').length > 0 ? $(el).find('span, div, h2, h3').first().text().trim() : $(el).text().trim();
                const link = $(el).attr('href');
                if (title.length > 5 && link && isRelevant(title, query, true) && !title.includes('Login')) {
                    const fullLink = link.startsWith('http') ? link : `https://www.pnet.co.za${link}`;
                    jobs.push({
                        id: `pnet-fb-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
                        title,
                        company: "PNet Listing",
                        location: "South Africa",
                        link: fullLink,
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

            if (title && link && isRelevant(title, query, true)) {
                // Ensure link is a direct vacancy page
                const fullLink = link.startsWith('http') ? link : `https://www.careers24.com${link}`;

                jobs.push({
                    id: `c24-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
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

            if (title && link && isRelevant(title, query, true)) {
                // Remove tracking parameters for cleaner scraping
                const cleanLink = link.split('?')[0];

                jobs.push({
                    id: `li-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
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

            if (title && link && isRelevant(title, query, true)) {
                const fullLink = link.startsWith('http') ? link : `https://www.adzuna.co.za${link}`;

                jobs.push({
                    id: `ind-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
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

async function searchLocalJobs(query: string, industry?: string | null, level?: string | null) {
    try {
        const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length >= 2);

        // Industry Expansion Map (Synonyms)
        const industryExpansion: Record<string, string> = {
            'drive': 'Logistics & Transport', 'truck': 'Logistics & Transport', 'courier': 'Logistics & Transport', 'deliver': 'Logistics & Transport',
            'nurse': 'Medical & Health', 'clinic': 'Medical & Health', 'medic': 'Medical & Health',
            'dev': 'IT & Tech', 'software': 'IT & Tech', 'tech': 'IT & Tech', 'code': 'IT & Tech', 'program': 'IT & Tech',
            'account': 'Finance & Accounting', 'bank': 'Finance & Accounting', 'finance': 'Finance & Accounting',
            'admin': 'Legal & Admin', 'clerk': 'Legal & Admin', 'secretary': 'Legal & Admin',
            'mechanic': 'Engineering & Industrial', 'electric': 'Engineering & Industrial', 'engineer': 'Engineering & Industrial'
        };

        let supabaseQuery = supabase
            .from('synced_jobs')
            .select(`
                id,
                title,
                description,
                location,
                application_url,
                recruiter_id,
                sync_metadata,
                recruiter_profiles (
                    company_name
                )
            `)
            .eq('is_active', true);

        // Advanced Relevance: Match any keyword in title 
        // OR Expand to Industry if keyword matches synonym map
        if (keywords.length > 0) {
            const orFilters: string[] = [];
            keywords.forEach(k => {
                orFilters.push(`title.ilike.%${k}%`);
                // Check if this keyword implies an industry
                for (const [key, ind] of Object.entries(industryExpansion)) {
                    if (k.includes(key) || key.includes(k)) {
                        orFilters.push(`sync_metadata->>industry.eq.${ind}`);
                        break;
                    }
                }
            });
            supabaseQuery = supabaseQuery.or(orFilters.join(','));
        }

        if (industry && industry !== 'All') {
            supabaseQuery = supabaseQuery.filter('sync_metadata->>industry', 'eq', industry);
        }
        if (level && level !== 'All') {
            supabaseQuery = supabaseQuery.filter('sync_metadata->>level', 'eq', level);
        }

        const { data, error } = await supabaseQuery.limit(50);

        if (error) throw error;

        return (data || []).map(job => {
            const metadata = (job.sync_metadata as any) || {};
            return {
                id: job.id,
                title: job.title,
                description: job.description,
                company: (job.recruiter_profiles as any)?.company_name || metadata.company || 'Verified Employer',
                location: job.location || 'South Africa',
                link: job.application_url,
                source: metadata.source || 'Discovery Engine',
                salary: metadata.salary,
                metadata: metadata
            };
        });
    } catch (e) {
        console.error("[Search] Local search failed:", e);
        return [];
    }
}

async function scrapeStandardBank(query: string) {
    const qLower = query.toLowerCase();
    const techKeywords = ['software', 'dev', 'tech', 'data', 'digital', 'it', 'engineer', 'program'];
    const isTechSearch = techKeywords.some(k => qLower.includes(k));

    if (!qLower.includes('bank') && !qLower.includes('grad') && !qLower.includes('intern') && !qLower.includes('learn') && !qLower.includes('bursary') && !isTechSearch) return [];
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
    const techKeywords = ['software', 'dev', 'tech', 'data', 'digital', 'it', 'engineer', 'program'];
    const isTechSearch = techKeywords.some(k => qLower.includes(k));

    if (!qLower.includes('capitec') && !qLower.includes('grad') && !qLower.includes('intern') && !qLower.includes('learn') && !isTechSearch) return [];
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
    const techKeywords = ['software', 'dev', 'tech', 'data', 'digital', 'it', 'engineer', 'program'];
    const isTechSearch = techKeywords.some(k => qLower.includes(k));

    if (!qLower.includes('shoprite') && !qLower.includes('grad') && !qLower.includes('intern') && !qLower.includes('learn') && !isTechSearch) return [];
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
