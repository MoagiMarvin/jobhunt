import * as cheerio from 'cheerio';
import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXml = promisify(parseString);

/**
 * Robust URL resolver for scraped links (logos and job ads).
 */
export function resolveUrl(link: string | undefined | null, baseUrl: string): string | undefined {
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

const techCompanies = ['vodacom', 'mtn', 'telkom', 'dimension data', 'eoh', 'liquid', 'altron', 'standard bank', 'fnb', 'nedbank', 'absa', 'discovery', 'capitec', 'goldman tech'];

export function isRelevant(title: string, company: string, query: string, job?: any): boolean {
    if (job && job.bypassTechGuard) return true;

    const titleLower = title.toLowerCase();
    const queryLower = query.toLowerCase();
    const companyLower = company.toLowerCase();

    const techKeywords = [
        'software', 'developer', 'engineer', 'technician', 'architect', 'consultant',
        'programmer', 'coding', 'scripting', 'application', 'platform', 'integration',
        'support', 'network', 'systems', 'infrastructure', 'server', 'admin', 'administrator',
        'desktop', 'helpdesk', 'service desk', 'computer', 'pc', 'hardware',
        'telecom', 'voip', 'wireless', 'connectivity',
        'data', 'analyst', 'analytics', 'bi', 'business intelligence', 'science', 'scientist',
        'sql', 'database', 'warehouse', 'etl', 'reporting', 'modeling',
        'cyber', 'security', 'infosec', 'risk', 'compliance', 'audit', 'penetration',
        'cloud', 'aws', 'azure', 'gcp', 'devops', 'sre', 'site reliability', 'automation',
        'docker', 'kubernetes', 'linux', 'unix', 'windows',
        'product', 'owner', 'manager', 'scrum', 'agile', 'kanban', 'design', 'ui', 'ux',
        'interface', 'experience', 'graphic', 'digital',
        'sap', 'oracle', 'erp', 'crm', 'salesforce', 'dynamics', 'sage',
        'ai', 'artificial intelligence', 'ml', 'machine learning', 'robotics', 'iot',
        'blockchain', 'crypto', 'fintech', 'mobile', 'android', 'ios', 'web',
        'frontend', 'backend', 'fullstack',
        'technology', 'ict', 'computer science', 'information systems', 'stem',
        'informatics', 'information technology', 'engineering'
    ];

    const isTechConsultant = titleLower.includes('consultant') &&
        (techKeywords.some(k => titleLower.includes(k)) || titleLower.includes('technical'));

    const nonTechKeywords = ['nurse', 'hospitality', 'waiter', 'retail', 'doctor', 'teacher', 'driver', 'cleaner', 'security guard', 'cashier'];
    if (nonTechKeywords.some(k => titleLower.includes(k))) return false;

    const isQueryATechCompany = techCompanies.some(c => queryLower === c);
    if (isQueryATechCompany && companyLower.includes(queryLower)) return true;

    const isSearchingForTechCompany = techCompanies.some(c => queryLower.includes(c));
    if (isSearchingForTechCompany && (companyLower.includes(queryLower) || titleLower.includes(queryLower))) return true;

    const hasTechKeyword = techKeywords.some(k => titleLower.includes(k));
    const isTechCompany = techCompanies.some(c => companyLower.includes(c) || titleLower.includes(c));

    return hasTechKeyword || isTechCompany || isTechConsultant;
}

// --- CORE SCRAPERS ---

export async function scrapePNet(query: string) {
    try {
        const keyword = query.trim().replace(/\s+/g, '-').toLowerCase();
        const url = `https://www.pnet.co.za/jobs/${keyword}`;

        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Referer': 'https://www.pnet.co.za/',
            },
            signal: AbortSignal.timeout(12000)
        });
        if (!res.ok) return [];

        const html = await res.text();
        const $ = cheerio.load(html);
        $('style, script, noscript').remove();

        const jobs: any[] = [];
        const articles = $('article, .job-item, .res-card, [data-at="job-item"]');

        articles.each((i, el) => {
            const titleEl = $(el).find('h2, h3, [data-at="job-item-title"], .job-title, .res-card__title').first();
            const titleLink = titleEl.find('a').first().length > 0 ? titleEl.find('a').first() : (titleEl.is('a') ? titleEl : null);
            const directLinkEl = $(el).find('a[href*="/job-ad/"]').first();
            const linkEl = titleLink || directLinkEl;
            const companyEl = $(el).find('[data-at="job-item-company-name"], .res-card__subtitle, .company').first();
            const locationEl = $(el).find('[data-at="job-item-location"], .res-card__metadata--location, .location').first();

            const clean = (txt: string) => txt.replace(/[^{]*\{[^}]*\}/g, '').replace(/\.[a-z0-9_-]+/gi, '').replace(/\s+/g, ' ').trim();

            const title = clean(titleEl.text());
            const link = linkEl ? linkEl.attr('href') : null;
            const company = clean(companyEl.text());
            const location = clean(locationEl.text());
            let logo = $(el).find('img[alt="Company logo"], .res-card__logo, .job-item__logo img').attr('src');

            if (title && link && company && location) {
                const fullLink = resolveUrl(link, 'https://www.pnet.co.za');
                const isPriorityCompany = techCompanies.some(c => company.toLowerCase().includes(c));
                
                jobs.push({
                    id: `pnet-${Date.now()}-${i}`,
                    title,
                    company,
                    location,
                    link: fullLink,
                    source: isPriorityCompany ? `${company} (via PNet)` : 'PNet',
                    logo: logo ? resolveUrl(logo, 'https://www.pnet.co.za') : undefined
                });
            }
        });
        return jobs.slice(0, 15);
    } catch (e) { return []; }
}

export async function scrapeLinkedIn(query: string) {
    try {
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
            const link = $(el).find('a').first().attr('href');

            if (title && link && isRelevant(title, company, query)) {
                jobs.push({
                    id: `li-${Date.now()}-${i}`,
                    title,
                    company,
                    location: $(el).find('.job-search-card__location').text().trim() || "South Africa",
                    link: link.split('?')[0],
                    source: 'LinkedIn'
                });
            }
        });
        return jobs.slice(0, 5);
    } catch (e) { return []; }
}

const AGGREGATOR_BLACKLIST = [
    'bebee', 'jobrapido', 'jobradio', 'adzuna', 'linkedin', 'careers24', 'pnet', 
    'talent.com', 'neuvoo', 'jooble', 'jora'
];

export async function scrapeBingJobs(query: string) {
    async function fetchBingPage(searchQuery: string): Promise<any[]> {
        const url = `https://www.bing.com/jobs?q=${encodeURIComponent(searchQuery)}&go=Search&qs=ds&form=JOBL2P`;
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            signal: AbortSignal.timeout(15000)
        });
        if (!res.ok) return [];

        const html = await res.text();
        const $ = cheerio.load(html);
        const jobs: any[] = [];

        $('.jb_jlc').each((i, el) => {
            const title = $(el).find('.jbovrly_title, .b_mText').first().text().trim();
            const company = $(el).find('.jbovrly_cmpny').first().text().trim();
            const sourceVia = $(el).find('.jb_source').first().text().trim();
            const link = $(el).find('.jb_ApplyButton, .jb_slimApply a, a[href*="bing.com/alink"]').first().attr('href');

            if (title && company) {
                const sourceViaLower = sourceVia.toLowerCase();
                if (AGGREGATOR_BLACKLIST.some(b => sourceViaLower.includes(b))) return;

                jobs.push({
                    id: `bing-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
                    title,
                    company,
                    location: $(el).find('.jbovrly_lj').text().trim() || 'South Africa',
                    link: link || `https://www.bing.com/jobs?q=${encodeURIComponent(`${title} ${company}`)}`,
                    source: sourceVia ? `Bing Jobs (${sourceVia})` : 'Bing Jobs',
                });
            }
        });
        return jobs;
    }

    const queryVariants = [`${query} South Africa`, `${query} Johannesburg`];
    const pages = await Promise.allSettled(queryVariants.map(q => fetchBingPage(q)));
    const allJobs = pages.flatMap(p => p.status === 'fulfilled' ? p.value : []);
    
    const seen = new Set<string>();
    return allJobs.filter(j => {
        const key = `${j.title.toLowerCase()}|${j.company.toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export async function scrapeCareers24(query: string, retryCount = 0): Promise<any[]> {
    try {
        const q = query.trim().replace(/\s+/g, '-').toLowerCase();
        const url = `https://www.careers24.com/jobs/kw-${q}/m-true/`;

        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(15000)
        });

        if (!res.ok) {
            if (retryCount < 1 && (res.status === 524 || res.status === 504 || res.status === 503)) {
                return scrapeCareers24(query, retryCount + 1);
            }
            return [];
        }

        const html = await res.text();
        const $ = cheerio.load(html);
        const jobs: any[] = [];

        $('.job-card, .c24-job-card, .job_search_results .row, .page-content .row article, .job-item').each((i, el) => {
            const titleEl = $(el).find('h2, h3, .job-title, .c24-job-title, [data-at="job-title"]').first();
            const title = titleEl.text().trim();
            const link = titleEl.find('a').first().attr('href') || $(el).find('a').first().attr('href');

            if (title && link && isRelevant(title, "Careers24", query)) {
                jobs.push({
                    id: `c24-${Date.now()}-${i}`,
                    title,
                    company: $(el).find('.company-name').text().trim() || "Careers24 Employer",
                    location: $(el).find('.location').text().trim() || "South Africa",
                    link: resolveUrl(link, 'https://www.careers24.com'),
                    source: 'Careers24'
                });
            }
        });
        return jobs.slice(0, 15);
    } catch (e) { return []; }
}

export async function scrapeAdzuna(query: string) {
    try {
        const url = `https://www.adzuna.co.za/search?q=${encodeURIComponent(query)}`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(12000)
        });
        if (!res.ok) return [];

        const html = await res.text();
        const $ = cheerio.load(html);
        const jobs: any[] = [];

        $('article').each((i, el) => {
            const titleEl = $(el).find('h2 a').first();
            const title = titleEl.text().trim();
            const link = titleEl.attr('href');
            const company = $(el).find('.ui-job-company').first().text().trim() || "Adzuna Employer";

            if (title && link && isRelevant(title, company, query)) {
                jobs.push({
                    id: `adzuna-${Date.now()}-${i}`,
                    title,
                    company,
                    location: $(el).find('.ui-location').text().trim() || "South Africa",
                    link: link.startsWith('http') ? link : `https://www.adzuna.co.za${link}`,
                    source: 'Adzuna'
                });
            }
        });
        return jobs.slice(0, 10);
    } catch (e) { return []; }
}
