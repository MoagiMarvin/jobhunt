import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Search API for JobHunt (v3.0 - Integrated with User Reference Logic)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const source = searchParams.get('source');

    if (!query) {
        return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    console.log(`[SEARCH] Query: "${query}", Source: ${source || 'ALL'}`);

    if (source) {
        let jobs: any[] = [];
        try {
            console.log(`[SEARCH] Targeting single source: ${source}`);
            switch (source.toLowerCase()) {
                case 'pnet': jobs = await scrapePNet(query); break;
                case 'linkedin': jobs = await scrapeLinkedIn(query); break;
                case 'careers24': jobs = await scrapeCareers24(query); break;
                case 'vodacom': jobs = await scrapeVodacom(query); break;
                case 'mtn': jobs = await scrapeMTN(query); break;
                case 'adzuna':
                case 'indeed': jobs = await scrapeAdzuna(query); break;
                case 'standardbank': jobs = await scrapeStandardBank(query); break;
                case 'fnb': jobs = await scrapeFNB(query); break;
            }
            console.log(`[SEARCH] Source ${source} returned ${jobs.length} jobs`);
        } catch (e) {
            console.error(`[API] Source error (${source}):`, e);
        }
        return NextResponse.json({ jobs });
    }

    const results = await Promise.all([
        scrapePNet(query).catch(e => { console.error("[PNET] Fail:", e.message); return []; }),
        scrapeLinkedIn(query).catch(e => { console.error("[LINKEDIN] Fail:", e.message); return []; }),
        scrapeCareers24(query).catch(e => { console.error("[C24] Fail:", e.message); return []; }),
        scrapeAdzuna(query).catch(e => { console.error("[ADZUNA] Fail:", e.message); return []; }),
        scrapeVodacom(query).catch(e => { console.error("[VODA] Fail:", e.message); return []; }),
        scrapeMTN(query).catch(e => { console.error("[MTN] Fail:", e.message); return []; }),
        scrapeStandardBank(query).catch(e => { console.error("[SB] Fail:", e.message); return []; }),
        scrapeFNB(query).catch(e => { console.error("[FNB] Fail:", e.message); return []; })
    ]);

    let allJobs = results.flat();

    // --- ENHANCED SHADOW SEARCH ---
    const companyTargets = ['vodacom', 'mtn', 'standard bank', 'fnb', 'standardbank', 'capitec', 'absa', 'nedbank', 'firstrand', 'telkom'];
    const isCompanyQuery = companyTargets.some(c => query.toLowerCase().includes(c));

    // If it's a company query and we have less than 15 results (we want deep index for companies), search LI and PNet specifically
    if (isCompanyQuery && allJobs.length < 15) {
        console.log(`[FALLBACK] Deep Indexing for company: "${query}"...`);
        const fbPromise = scrapePNet(query + " South Africa");
        const liPromise = scrapeLinkedIn(query + " South Africa");

        const fallbacks = await Promise.all([fbPromise, liPromise]);
        const fallbackJobs = fallbacks.flat().map(j => ({
            ...j,
            source: `${j.source} (Direct Index)`,
            isNiche: true
        }));

        allJobs = [...allJobs, ...fallbackJobs];
    }

    // De-duplicate results by title and company to keep it clean
    const seen = new Set();
    const finalJobs = allJobs.filter(j => {
        const key = `${j.title.toLowerCase()}-${j.company.toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    console.log(`[SEARCH] Final de-duplicated jobs: ${finalJobs.length}`);
    return NextResponse.json({ jobs: finalJobs });
}

/**
 * RELEVANCE GUARD: Ensures the job title actually contains the search query.
 * Prevents "Junior Accountant" for "Driver" searches.
 */
/**
 * TECH-ONLY GUARD: Ensures the role is actually in the Tech Industry.
 */
function isRelevant(title: string, company: string, query: string): boolean {
    const titleLower = title.toLowerCase();
    const queryLower = query.toLowerCase();
    const companyLower = company.toLowerCase();

    // 1. Tech Mandatory Keywords
    const techKeywords = [
        'software', 'developer', 'engineer', 'technician', 'it support',
        'data', 'cyber', 'network', 'cloud', 'sap', 'oracle', 'pc',
        'computer', 'hardware', 'voip', 'telecom', 'systems', 'infrastructure',
        'tester', 'qa', 'analyst', 'security'
    ];

    // 2. Tech Companies (Priority)
    const techCompanies = ['vodacom', 'mtn', 'telkom', 'dimension data', 'eoh', 'liquid', 'altron', 'standard bank', 'fnb', 'nedbank'];

    // 3. Technical Consultant Check
    const isTechConsultant = titleLower.includes('consultant') &&
        (techKeywords.some(k => titleLower.includes(k)) || titleLower.includes('technical'));

    // 4. Exclusion List
    const nonTechKeywords = ['nurse', 'hospitality', 'waiter', 'retail', 'doctor', 'teacher', 'driver'];
    if (nonTechKeywords.some(k => titleLower.includes(k))) return false;

    // Logic: Must match query AND be tech-related
    // SPECIAL BYPASS: If the user is specifically searching for a Tech Company, allow ALL results from that company.
    const isQueryATechCompany = techCompanies.some(c => queryLower === c);
    if (isQueryATechCompany && companyLower.includes(queryLower)) {
        return true;
    }

    const isSearchingForTechCompany = techCompanies.some(c => queryLower.includes(c));
    if (isSearchingForTechCompany && (companyLower.includes(queryLower) || titleLower.includes(queryLower))) {
        return true;
    }

    const matchesQuery = queryLower.split(/\s+/).some(word => word.length >= 2 && (titleLower.includes(word) || companyLower.includes(word)));

    // Allow everything for now to avoid missing results during debugging
    const isTechRelated = techKeywords.some(k => titleLower.includes(k)) ||
        techCompanies.some(c => companyLower.includes(c) || titleLower.includes(c)) ||
        isTechConsultant ||
        queryLower.length < 3;

    return matchesQuery && isTechRelated;
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
        console.log(`[PNET] Status: ${res.status}`);
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

            if (title && link && company && location && isRelevant(title, company, query)) {
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
                if (title.length > 5 && link && isRelevant(title, "PNet Listing", query) && !title.includes('Login')) {
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
            const company = companyEl.text().trim() || "Careers24";

            if (title && link && isRelevant(title, company, query)) {
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
        // Use the auth-less guest search API endpoint if possible or public search
        const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(query)}&location=South%20Africa&start=0`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            cache: 'no-store',
            signal: AbortSignal.timeout(10000)
        });
        if (!res.ok) return [];

        const html = await res.text();
        const $ = cheerio.load(html);
        const jobs: any[] = [];

        $('.base-card, .job-search-card, .base-search-card').each((i, el) => {
            const title = $(el).find('.base-search-card__title, h3').first().text().trim();
            const company = $(el).find('.base-search-card__subtitle').text().trim() || "LinkedIn Employer";

            // DEEP LINK LOGIC: Target the hidden full-link that contains the ad ID
            const linkEl = $(el).find('a.base-card__full-link, a.base-search-card__full-link, a').first();
            const link = linkEl.attr('href');

            if (title && link && isRelevant(title, company, query)) {
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
            const company = $(el).find('.ui-job-card-company, .company').first().text().trim() || "Indeed Professional";

            if (title && link && isRelevant(title, company, query)) {
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
async function scrapeVodacom(query: string) {
    try {
        // SuccessFactors Career site - Using the SEO-friendly results page first
        const url = `https://jobs.vodacom.co.za/search/?q=${encodeURIComponent(query)}&locationsearch=South+Africa`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0' },
            signal: AbortSignal.timeout(12000)
        });
        console.log(`[VODA] Status: ${res.status}`);

        const html = await res.text();
        const $ = cheerio.load(html);
        const jobs: any[] = [];

        // SuccessFactors refined selectors
        $('.job-tile, .job-row, .table-row, [data-row-id]').each((i, el) => {
            const titleEl = $(el).find('.job-title a, h3 a, .title a').first();
            const title = titleEl.text().trim();
            const link = titleEl.attr('href');
            const company = "Vodacom";

            if (title && link && isRelevant(title, company, query)) {
                jobs.push({
                    id: `voda-${Date.now()}-${i}`,
                    title,
                    company: "Vodacom",
                    location: $(el).find('.location').text().trim() || "South Africa",
                    link: link.startsWith('http') ? link : `https://jobs.vodacom.co.za${link}`,
                    source: 'Vodacom Portal',
                    isNiche: true
                });
            }
        });

        if (jobs.length === 0) {
            console.log(`[VODA] No direct results. Attempting fallback...`);
            const fallback = await scrapeLinkedIn("Vodacom South Africa");
            return fallback.map(j => ({ ...j, company: "Vodacom", source: 'Vodacom (via LinkedIn)' }));
        }

        return jobs;
    } catch {
        return scrapeLinkedIn("Vodacom South Africa").then(js => js.map(j => ({ ...j, company: "Vodacom", source: 'Vodacom (via LinkedIn)' })));
    }
}

async function scrapeMTN(query: string) {
    try {
        const url = `https://mtn.wd3.myworkdayjobs.com/wday/cxs/mtn_careers/jobs`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Accept-Language': 'en-US',
                'Origin': 'https://mtn.wd3.myworkdayjobs.com',
                'Referer': `https://mtn.wd3.myworkdayjobs.com/mtn_careers`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0'
            },
            body: JSON.stringify({ appliedFacets: {}, limit: 20, offset: 0, searchText: query }),
            signal: AbortSignal.timeout(10000)
        });

        if (!res.ok) {
            console.error(`[MTN] API Error: ${res.status}`);
            return scrapeLinkedIn("MTN South Africa").then(js => js.map(j => ({ ...j, company: "MTN", source: 'MTN (via LinkedIn)' })));
        }

        const data = await res.json();
        const jobs: any[] = [];
        (data.jobPostings || []).forEach((p: any, i: number) => {
            const title = p.title;
            const company = "MTN";
            const link = `https://mtn.wd3.myworkdayjobs.com/mtn_careers${p.externalPath}`;
            if (title && isRelevant(title, company, query)) {
                jobs.push({
                    id: `mtn-${Date.now()}-${i}`,
                    title,
                    company: "MTN",
                    location: p.locationsText || "South Africa",
                    link,
                    source: 'MTN Career Site',
                    isNiche: true
                });
            }
        });

        if (jobs.length === 0) {
            console.log(`[MTN] No direct jobs. Falling back...`);
            const fallback = await scrapeLinkedIn("MTN South Africa");
            return fallback.map(j => ({ ...j, company: "MTN", source: 'MTN (Backup)' }));
        }

        return jobs;
    } catch (e) {
        return scrapeLinkedIn("MTN South Africa").then(js => js.map(j => ({ ...j, company: "MTN", source: 'MTN (Backup)' })));
    }
}

async function scrapeStandardBank(query: string) {
    try {
        const url = `https://standardbank.wd3.myworkdayjobs.com/wday/cxs/standardbank_careers/StandardBank_SouthAfrica/jobs`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': 'https://standardbank.wd3.myworkdayjobs.com',
                'Referer': `https://standardbank.wd3.myworkdayjobs.com/standardbank_careers`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0'
            },
            body: JSON.stringify({ appliedFacets: {}, limit: 15, offset: 0, searchText: query }),
            signal: AbortSignal.timeout(10000)
        });
        if (!res.ok) {
            return scrapeLinkedIn("Standard Bank South Africa").then(js => js.map(j => ({ ...j, company: "Standard Bank", source: 'Standard Bank (Backup)' })));
        }
        const data = await res.json();
        const jobs: any[] = [];
        (data.jobPostings || []).forEach((p: any, i: number) => {
            const title = p.title;
            const company = "Standard Bank";
            const link = `https://standardbank.wd3.myworkdayjobs.com/standardbank_careers${p.externalPath}`;
            if (title && isRelevant(title, company, query)) {
                jobs.push({
                    id: `sb-${Date.now()}-${i}`,
                    title,
                    company,
                    location: p.locationsText || "South Africa",
                    link,
                    source: 'Standard Bank',
                    isNiche: true
                });
            }
        });

        if (jobs.length === 0) {
            const fallback = await scrapeLinkedIn("Standard Bank South Africa");
            return fallback.map(j => ({ ...j, company: "Standard Bank", source: 'Standard Bank (Backup)' }));
        }
        return jobs;
    } catch {
        return scrapeLinkedIn("Standard Bank South Africa").then(js => js.map(j => ({ ...j, company: "Standard Bank", source: 'Standard Bank (Backup)' })));
    }
}

async function scrapeFNB(query: string) {
    try {
        const url = `https://firstrand.wd3.myworkdayjobs.com/wday/cxs/firstrand/FirstRand/jobs`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': 'https://firstrand.wd3.myworkdayjobs.com',
                'Referer': `https://firstrand.wd3.myworkdayjobs.com/firstrand`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0'
            },
            body: JSON.stringify({ appliedFacets: {}, limit: 15, offset: 0, searchText: query }),
            signal: AbortSignal.timeout(10000)
        });
        if (!res.ok) {
            return scrapeLinkedIn("FNB South Africa").then(js => js.map(j => ({ ...j, company: "FNB", source: 'FNB (Backup)' })));
        }
        const data = await res.json();
        const jobs: any[] = [];
        (data.jobPostings || []).forEach((p: any, i: number) => {
            const title = p.title;
            const company = "FNB";
            const link = `https://firstrand.wd3.myworkdayjobs.com/firstrand${p.externalPath}`;
            if (title && isRelevant(title, company, query)) {
                jobs.push({
                    id: `fnb-${Date.now()}-${i}`,
                    title,
                    company,
                    location: p.locationsText || "South Africa",
                    link,
                    source: 'FirstRand Group',
                    isNiche: true
                });
            }
        });
        if (jobs.length === 0) {
            const fallback = await scrapeLinkedIn("FNB South Africa");
            return fallback.map(j => ({ ...j, company: "FNB", source: 'FNB (Backup)' }));
        }
        return jobs;
    } catch {
        return scrapeLinkedIn("FNB South Africa").then(js => js.map(j => ({ ...j, company: "FNB", source: 'FNB (Backup)' })));
    }
}
