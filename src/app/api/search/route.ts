import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXml = promisify(parseString);

/**
 * Robust URL resolver for scraped links (logos and job ads).
 * Handles relative (/path) and protocol-relative (//domain) URLs.
 */
function resolveUrl(link: string | undefined | null, baseUrl: string): string | undefined {
    if (!link) return undefined;
    const s = link.trim();
    if (s.startsWith('http')) return s;
    if (s.startsWith('//')) return `https:${s}`;

    try {
        const base = new URL(baseUrl);
        return new URL(s, base.origin).toString();
    } catch (e) {
        return s.startsWith('/') ? `${baseUrl.replace(/\/$/, '')}${s}` : s;
    }
}

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
            // 1. Fetch PRIMARY Sources (Direct Tech)
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
                case 'absa': jobs = await scrapeAbsa(query); break;
                case 'discovery': jobs = await scrapeDiscovery(query); break;
                case 'capitec': jobs = await scrapeCapitec(query); break;
                case 'goldman': jobs = await scrapeGoldmanTech(query); break;
                case 'emerge': jobs = await scrapeEMerge(query); break;
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
        scrapeFNB(query).catch(e => { console.error("[FNB] Fail:", e.message); return []; }),
        scrapeAbsa(query).catch(e => { console.error("[ABSA] Fail:", e.message); return []; }),
        scrapeDiscovery(query).catch(e => { console.error("[DISC] Fail:", e.message); return []; }),
        scrapeCapitec(query).catch(e => { console.error("[CAPITEC] Fail:", e.message); return []; }),
        scrapeGoldmanTech(query).catch(e => { console.error("[GOLDMAN] Fail:", e.message); return []; }),
        scrapeEMerge(query).catch(e => { console.error("[EMERGE] Fail:", e.message); return []; })
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
// 2. Tech Companies (Priority)
const techCompanies = ['vodacom', 'mtn', 'telkom', 'dimension data', 'eoh', 'liquid', 'altron', 'standard bank', 'fnb', 'nedbank', 'absa', 'discovery', 'capitec', 'goldman tech'];

/**
 * TECH-ONLY GUARD: Ensures the role is actually in the Tech Industry.
 */
function isRelevant(title: string, company: string, query: string, job?: any): boolean {
    // BYPASS: Recruiter jobs are pre-vetted by the recruiter search
    if (job && job.bypassTechGuard) {
        return true;
    }

    const titleLower = title.toLowerCase();
    const queryLower = query.toLowerCase();
    const companyLower = company.toLowerCase();

    // 1. Tech Mandatory Keywords
    const techKeywords = [
        // Core Tech
        'software', 'developer', 'engineer', 'technician', 'architect', 'consultant',
        'programmer', 'coding', 'scripting', 'application', 'platform', 'integration',

        // Infrastructure & Support
        'support', 'network', 'systems', 'infrastructure', 'server', 'admin', 'administrator',
        'desktop', 'helpdesk', 'service desk', 'computer', 'pc', 'hardware',
        'telecom', 'voip', 'wireless', 'connectivity',

        // Data & Analytics
        'data', 'analyst', 'analytics', 'bi', 'business intelligence', 'science', 'scientist',
        'sql', 'database', 'warehouse', 'etl', 'reporting', 'modeling',

        // Cyber & Security
        'cyber', 'security', 'infosec', 'risk', 'compliance', 'audit', 'penetration',

        // Cloud & DevOps
        'cloud', 'aws', 'azure', 'gcp', 'devops', 'sre', 'site reliability', 'automation',
        'docker', 'kubernetes', 'linux', 'unix', 'windows',

        // Product & Design
        'product', 'owner', 'manager', 'scrum', 'agile', 'kanban', 'design', 'ui', 'ux',
        'interface', 'experience', 'graphic', 'digital',

        // Enterprise Systems
        'sap', 'oracle', 'erp', 'crm', 'salesforce', 'dynamics', 'sage',

        // Modern Tech
        'ai', 'artificial intelligence', 'ml', 'machine learning', 'robotics', 'iot',
        'blockchain', 'crypto', 'fintech', 'mobile', 'android', 'ios', 'web',
        'frontend', 'backend', 'fullstack',

        // Academic & Graduate
        'technology', 'ict', 'computer science', 'information systems', 'stem',
        'informatics', 'information technology', 'engineering'
    ];


    // 3. Technical Consultant Check
    const isTechConsultant = titleLower.includes('consultant') &&
        (techKeywords.some(k => titleLower.includes(k)) || titleLower.includes('technical'));

    // 4. Exclusion List (ONLY block obvious non-tech)
    const nonTechKeywords = ['nurse', 'hospitality', 'waiter', 'retail', 'doctor', 'teacher', 'driver', 'cleaner', 'security guard', 'cashier'];
    if (nonTechKeywords.some(k => titleLower.includes(k))) return false;

    // SPECIAL BYPASS: If the user is specifically searching for a Tech Company, allow ALL results from that company.
    const isQueryATechCompany = techCompanies.some(c => queryLower === c);
    if (isQueryATechCompany && companyLower.includes(queryLower)) {
        return true;
    }

    const isSearchingForTechCompany = techCompanies.some(c => queryLower.includes(c));
    if (isSearchingForTechCompany && (companyLower.includes(queryLower) || titleLower.includes(queryLower))) {
        return true;
    }

    // SUPER INCLUSIVE LOGIC: Pass if ANY of these conditions are true
    const hasTechKeyword = techKeywords.some(k => titleLower.includes(k));
    const isTechCompany = techCompanies.some(c => companyLower.includes(c) || titleLower.includes(c));

    const result = hasTechKeyword || isTechCompany || isTechConsultant;
    if (!result) {
        console.log(`[GUARD] Rejected: "${title}" at "${company}" (Keywords: ${hasTechKeyword}, TechCo: ${isTechCompany})`);
    }

    // CRITICAL: If it's NOT explicitly non-tech AND has any tech indicator, show it
    return result;
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

        // GLOBAL SANITIZATION: Remove ALL style and script tags immediately
        // PNet injects styles inside the body which Cheerio's .text() captures.
        $('style, script, noscript').remove();

        const jobs: any[] = [];

        // Broad Selectors focusing on the job cards
        const articles = $('article, .job-item, .res-card, [data-at="job-item"]');

        // Remove styles/scripts from cards to prevent CSS leakage in .text()
        articles.find('style, script').remove();

        articles.each((i, el) => {
            const titleEl = $(el).find('h2, h3, [data-at="job-item-title"], .job-title, .res-card__title').first();

            // TARGETED LINK EXTRACTION: Find the link INSIDE the title or the title itself if it's an <a>
            const titleLink = titleEl.find('a').first().length > 0 ? titleEl.find('a').first() : (titleEl.is('a') ? titleEl : null);

            // FALLBACK: Look for direct job-ad links elsewhere in the card if title link is missing
            const directLinkEl = $(el).find('a[href*="/job-ad/"]').first();
            const linkEl = titleLink || directLinkEl;

            const companyEl = $(el).find('[data-at="job-item-company-name"], .res-card__subtitle, .company').first();
            const locationEl = $(el).find('[data-at="job-item-location"], .res-card__metadata--location, .location').first();

            // AGGRESSIVE CLEANUP: Remove ANY residual CSS patterns if they somehow escaped removal
            const clean = (txt: string) => {
                let s = txt || '';
                // Remove anything that looks like a CSS rule: .selector { ... } or @media ... { ... }
                // We use a loop to handle potential nesting or multiple blocks
                while (s.includes('{') && s.includes('}')) {
                    s = s.replace(/[^{]*\{[^}]*\}/g, '');
                }
                // Strip lingering class-like prefixes (e.g. .res-123) and cleanup whitespace
                return s.replace(/\.[a-z0-9_-]+/gi, '').replace(/\s+/g, ' ').trim();
            };

            const title = clean(titleEl.text());
            const link = linkEl ? linkEl.attr('href') : null;
            const company = clean(companyEl.text());
            const location = clean(locationEl.text());
            let logo = $(el).find('img[alt="Company logo"], .res-card__logo, .job-item__logo img').attr('src');

            // Ensure absolute logo URL for PNet
            if (logo && !logo.startsWith('http')) {
                logo = `https://www.pnet.co.za${logo.startsWith('/') ? '' : '/'}${logo}`;
            }

            if (title && link && company && location) {
                // ROBUST URL RESOLUTION for PNet
                const fullLink = resolveUrl(link, 'https://www.pnet.co.za');
                const fullLogo = resolveUrl(logo, 'https://www.pnet.co.za');
                const companyLower = company.toLowerCase();
                const isPriorityCompany = techCompanies.some(c => companyLower.includes(c));

                // Hardcoded High-Quality Logos for SA Giants
                const priorityLogos: { [key: string]: string } = {
                    'vodacom': 'https://upload.wikimedia.org/wikipedia/commons/a/af/Vodacom_Logo.svg',
                    'mtn': 'https://upload.wikimedia.org/wikipedia/commons/9/93/MTN_Logo.svg',
                    'standard bank': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Standard_Bank_Logo.svg',
                    'fnb': 'https://upload.wikimedia.org/wikipedia/commons/d/df/FNB_Logo.svg',
                    'absa': 'https://upload.wikimedia.org/wikipedia/commons/0/05/Absa_Logo.svg',
                    'discovery': 'https://upload.wikimedia.org/wikipedia/en/1/1d/Discovery_Limited_Logo.svg',
                    'capitec': 'https://upload.wikimedia.org/wikipedia/commons/3/30/Capitec_Bank_logo.svg'
                };

                const foundPriority = Object.keys(priorityLogos).find(key => companyLower.includes(key));
                const finalLogo = foundPriority ? priorityLogos[foundPriority] : logo;

                jobs.push({
                    id: `pnet-${Date.now()}-${i}`,
                    title,
                    company,
                    location,
                    link: fullLink,
                    source: isPriorityCompany ? `${company} (via PNet)` : 'PNet',
                    isNiche: isPriorityCompany,
                    logo: finalLogo || undefined
                });
            }
        });

        // "Plan B" Fallback Strategy from reference - only if standard cards fail
        if (jobs.length === 0) {
            // Re-apply cleanup function for safety
            const clean = (txt: string) => {
                let s = txt || '';
                while (s.includes('{') && s.includes('}')) {
                    s = s.replace(/[^{]*\{[^}]*\}/g, '');
                }
                return s.replace(/\.[a-z0-9_-]+/gi, '').replace(/\s+/g, ' ').trim();
            };

            $('a[href*="/job-ad/"]').each((i, el) => {
                const title = clean($(el).text());
                const link = $(el).attr('href');
                if (title.length > 5 && link && isRelevant(title, "PNet Listing", query) && !title.includes('Login')) {
                    const fullLink = link.startsWith('http') ? link : `https://www.pnet.co.za${link}`;
                    jobs.push({
                        id: `pnet-fb-${Date.now()}-${i}`,
                        title,
                        company: "PNet Listing",
                        location: "South Africa",
                        link: fullLink,
                        source: 'PNet',
                        logo: undefined
                    });
                }
            });
        }

        return jobs.slice(0, 15);
    } catch (e) { return []; }
}

async function scrapeCareers24(query: string, retryCount = 0): Promise<any[]> {
    try {
        const q = query.trim().replace(/\s+/g, '-').toLowerCase();
        const url = `https://www.careers24.com/jobs/kw-${q}/m-true/`;

        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(15000)
        });

        if (!res.ok) {
            if (retryCount < 1 && (res.status === 524 || res.status === 504 || res.status === 503)) {
                console.log(`[C24] Retry ${retryCount + 1} for status ${res.status}`);
                return scrapeCareers24(query, retryCount + 1);
            }
            return [];
        }

        const html = await res.text();
        const $ = cheerio.load(html);
        const jobs: any[] = [];

        const jobRows = $('.job-card, .c24-job-card, .job_search_results .row, .page-content .row article, .job-item');
        console.log(`[C24] Found ${jobRows.length} rows for "${query}"`);

        jobRows.each((i, el) => {
            const titleEl = $(el).find('h2, h3, .job-title, .c24-job-title, [data-at="job-title"]').first();
            const title = titleEl.text().trim();
            const titleLink = titleEl.find('a').first().length > 0 ? titleEl.find('a').first() : (titleEl.is('a') ? titleEl : $(el).find('a').first());
            const link = titleLink.attr('href');

            if (!title || !link) return;

            const companyEl = $(el).find('.company-name, .job-card-company, .c24-company-name').first();
            const locationEl = $(el).find('.location, .job-card-location, .c24-location').first();
            const logo = $(el).find('img').attr('src');
            const company = companyEl.text().trim() || "Careers24 Employer";

            if (isRelevant(title, company, query)) {
                // ROBUST URL RESOLUTION for Careers24
                const fullLink = resolveUrl(link, 'https://www.careers24.com') || link;
                const fullLogo = resolveUrl(logo, 'https://www.careers24.com');

                jobs.push({
                    id: `c24-${Date.now()}-${i}`,
                    title,
                    company,
                    location: locationEl.text().trim() || "South Africa",
                    link: fullLink,
                    source: 'Careers24',
                    logo: fullLogo
                });
            }
        });

        return jobs.slice(0, 15);
    } catch (e: any) {
        if (retryCount < 1 && (e.name === 'TimeoutError' || e.name === 'AbortError')) {
            console.log(`[C24] Timeout retry ${retryCount + 1}`);
            return scrapeCareers24(query, retryCount + 1);
        }
        return [];
    }
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
            const logo = $(el).find('.artdeco-entity-image, .job-search-card__logo-image, img').attr('src') || $(el).find('img').attr('data-delayed-url');

            // DEEP LINK LOGIC: Target the hidden full-link that contains the ad ID
            const linkEl = $(el).find('a.base-card__full-link, a.base-search-card__full-link, a').first();
            const link = linkEl.attr('href');

            if (title && link && isRelevant(title, company, query)) {
                // Remove tracking parameters for cleaner scraping
                const cleanLink = link.split('?')[0];
                const companyLower = company.toLowerCase();

                // Hardcoded High-Quality Logos for SA Giants
                const priorityLogos: { [key: string]: string } = {
                    'vodacom': 'https://upload.wikimedia.org/wikipedia/commons/a/af/Vodacom_Logo.svg',
                    'mtn': 'https://upload.wikimedia.org/wikipedia/commons/9/93/MTN_Logo.svg',
                    'standard bank': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Standard_Bank_Logo.svg',
                    'fnb': 'https://upload.wikimedia.org/wikipedia/commons/d/df/FNB_Logo.svg',
                    'absa': 'https://upload.wikimedia.org/wikipedia/commons/0/05/Absa_Logo.svg',
                    'discovery': 'https://upload.wikimedia.org/wikipedia/en/1/1d/Discovery_Limited_Logo.svg',
                    'capitec': 'https://upload.wikimedia.org/wikipedia/commons/3/30/Capitec_Bank_logo.svg'
                };

                const foundPriority = Object.keys(priorityLogos).find(key => companyLower.includes(key));
                const finalLogo = foundPriority ? priorityLogos[foundPriority] : logo;

                jobs.push({
                    id: `li-${Date.now()}-${i}`,
                    title,
                    company: company,
                    location: $(el).find('.job-search-card__location, .base-search-card__metadata').text().trim() || "South Africa",
                    link: cleanLink,
                    source: 'LinkedIn',
                    logo: finalLogo || undefined
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

// --- UNIVERSAL WORKDAY SCRAPER ---
async function scrapeWorkday(tenant: string, companyName: string, query: string) {
    try {
        const url = `https://${tenant}.wd3.myworkdayjobs.com/wday/cxs/${tenant}/${companyName}/jobs`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': `https://${tenant}.wd3.myworkdayjobs.com`,
                // 'Referer': `https://${tenant}.wd3.myworkdayjobs.com/${companyName}`, // Often not strictly needed but good practice
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0'
            },
            body: JSON.stringify({ appliedFacets: {}, limit: 20, offset: 0, searchText: query }),
            signal: AbortSignal.timeout(10000)
        });

        if (!res.ok) {
            console.error(`[${companyName.toUpperCase()}] API Error: ${res.status}`);
            return scrapeLinkedIn(`${companyName} South Africa ${query}`).then(js => js.map(j => ({ ...j, company: companyName, source: `${companyName} (via LinkedIn)` })));
        }

        const data = await res.json();
        const jobs: any[] = [];
        (data.jobPostings || []).forEach((p: any, i: number) => {
            const title = p.title;
            const link = `https://${tenant}.wd3.myworkdayjobs.com/${companyName}${p.externalPath}`;

            if (title && isRelevant(title, companyName, query)) {
                jobs.push({
                    id: `${companyName.substring(0, 3).toLowerCase()}-${Date.now()}-${i}`,
                    title,
                    company: companyName,
                    location: p.locationsText || "South Africa",
                    link,
                    source: `${companyName} Careers`,
                    isNiche: true,
                    // Workday sometimes provides a logo in the metadata, but usually not in this endpoint.
                    // We rely on the JobCard fallback or we could hardcode logos if we wanted.
                });
            }
        });

        if (jobs.length === 0) {
            console.log(`[${companyName.toUpperCase()}] No direct jobs. Falling back...`);
            const fallback = await scrapeLinkedIn(`${companyName} South Africa ${query}`);
            return fallback.map(j => ({ ...j, company: companyName, source: `${companyName} (Backup)` }));
        }

        return jobs;
    } catch (e) {
        return scrapeLinkedIn(`${companyName} South Africa ${query}`).then(js => js.map(j => ({ ...j, company: companyName, source: `${companyName} (Backup)` })));
    }
}

// Implementations using the Universal Scraper
async function scrapeMTN(query: string) {
    return scrapeWorkday('mtn', 'mtn_careers', query);
}

async function scrapeStandardBank(query: string) {
    return scrapeWorkday('standardbank', 'StandardBank_SouthAfrica', query);
}

async function scrapeFNB(query: string) {
    return scrapeWorkday('firstrand', 'FirstRand', query);
}

async function scrapeAbsa(query: string) {
    // Absa Tenant: 'absa', Site: 'ABSAcareersite' (Verified)
    return scrapeWorkday('absa', 'ABSAcareersite', query);
}

async function scrapeDiscovery(query: string) {
    // Discovery Tenant: 'discovery' 
    return scrapeWorkday('discovery', 'Discovery_Careers', query);
}

async function scrapeCapitec(query: string) {
    // Capitec is NOT Workday, so we strictly use LinkedIn/PNet for now as "Direct" isn't easy via API
    return scrapePNet(`Capitec Bank ${query}`).then(js => js.map(j => ({ ...j, source: 'Capitec (PNet Mirror)' })));
}

async function scrapeGoldmanTech(query: string) {
    try {
        const url = 'http://www.goldmantech.co.za/adverts.rss';
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!res.ok) return [];

        const xml = await res.text();
        const result: any = await parseXml(xml);
        const items = result.rss.channel[0].item;

        console.log(`[GOLDMAN] Initial items count: ${items?.length || 0}`);

        const jobs: any[] = [];
        const queryLower = query.toLowerCase();

        items.forEach((item: any, i: number) => {
            const title = item.title?.[0]?.trim() || '';
            const link = item.link?.[0]?.trim() || '';
            const description = item.description?.[0]?.trim() || '';
            const guid = item.guid?.[0]?._?.trim() || item.guid?.[0]?.trim() || '';
            const pubDate = item.pubDate?.[0]?.trim() || '';

            // User wants ALL jobs from Goldman Tech regardless of Tech Category
            // So we bypass the isRelevant(title, "Goldman Tech", query) guard
            const matchesQuery = queryLower.split(' ').every(word =>
                title.toLowerCase().includes(word) ||
                description.toLowerCase().includes(word)
            );

            if (matchesQuery) {
                jobs.push({
                    id: `goldman-${guid.split('/').pop() || Date.now()}-${i}`,
                    title,
                    company: "Goldman Tech",
                    location: "South Africa",
                    link,
                    description,
                    source: 'Goldman Tech',
                    pubDate
                });
            }
        });

        console.log(`[GOLDMAN] Found ${jobs.length} total matches for "${query}"`);
        return jobs.slice(0, 50); // Increased limit to show more potential matches
    } catch (e) {
        console.error("[GOLDMAN] Scrape fail:", e);
        return [];
    }
}

async function scrapeEMerge(query: string) {
    try {
        const queryLower = query.toLowerCase();
        // e-Merge uses standard WordPress posts for listings.
        // We use the REST API for clean, structured data.
        const url = `https://www.e-merge.co.za/wp-json/wp/v2/posts?search=${encodeURIComponent(query)}&per_page=50`;

        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            },
            signal: AbortSignal.timeout(12000)
        });

        if (!res.ok) {
            console.error(`[EMERGE] API responded with status: ${res.status}`);
            return [];
        }

        const posts: any[] = await res.json();
        if (!Array.isArray(posts)) return [];

        console.log(`[EMERGE] Found ${posts.length} direct API matches for "${query}"`);

        return posts.map((post: any) => {
            // HTML Decode and clean title
            const title = post.title?.rendered || 'Untitled Role';
            const cleanTitle = title.replace(/&amp;/g, '&')
                .replace(/&#8211;/g, '–')
                .replace(/&#8217;/g, "'")
                .replace(/<[^>]*>?/gm, '');

            return {
                id: `emerge-${post.id}`,
                title: cleanTitle,
                company: "e-Merge IT Recruitment",
                location: "South Africa (Hybrid/Remote)",
                link: post.link,
                description: post.excerpt?.rendered || post.content?.rendered || '',
                source: 'e-Merge IT',
                pubDate: post.date
            };
        });
    } catch (e) {
        console.error("[EMERGE] Native API scrape fail:", e);
        return [];
    }
}
