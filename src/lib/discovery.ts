import * as cheerio from 'cheerio';

export class DiscoveryEngine {
    /**
     * Extracts JSON-LD structured data from a page
     */
    static async extractJsonLd(url: string, html: string) {
        const $ = cheerio.load(html);
        const scripts = $('script[type="application/ld+json"]');
        let jobData: any = null;

        scripts.each((_, el) => {
            try {
                const data = JSON.parse($(el).html() || '');
                if (data['@type'] === 'JobPosting' || data['@type'] === 'JobListing' || (Array.isArray(data) && data.some((item: any) => item['@type'] === 'JobPosting'))) {
                    jobData = Array.isArray(data) ? data.find((item: any) => item['@type'] === 'JobPosting') : data;
                }
            } catch (e) { }
        });

        if (jobData) {
            return {
                title: jobData.title,
                description: jobData.description,
                company: jobData.hiringOrganization?.name,
                location: jobData.jobLocation?.address?.addressLocality || 'South Africa',
                link: url,
            };
        }
        return null;
    }

    /**
     * Discovery heuristic to find job links in a list page
     */
    static async discoverJobLinks(baseUrl: string, html: string) {
        const $ = cheerio.load(html);
        const links = new Set<string>();

        // Priority 1: Semantic job links
        $('a').each((_, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().toLowerCase();
            const title = $(el).attr('title')?.toLowerCase() || '';

            if (href) {
                const isJobUrl =
                    href.includes('/job/') ||
                    href.includes('/vacancy/') ||
                    href.includes('/careers/') ||
                    href.includes('/job-ad/') ||
                    href.includes('/opportunities/') ||
                    href.includes('/view/');

                const isJobText =
                    text.includes('apply') ||
                    text.includes('intern') ||
                    text.includes('learnership') ||
                    text.includes('graduate') ||
                    text.includes('details') ||
                    title.includes('view job');

                if (isJobUrl || isJobText) {
                    try {
                        const absoluteUrl = new URL(href, baseUrl).toString();
                        // Ignore common junk links
                        if (!absoluteUrl.includes('login') && !absoluteUrl.includes('register') && !absoluteUrl.includes('share')) {
                            links.add(absoluteUrl);
                        }
                    } catch (e) { }
                }
            }
        });

        return Array.from(links);
    }

    /**
     * Parses a sitemap.xml to find job-like URLs
     */
    static async parseSitemap(xml: string) {
        const $ = cheerio.load(xml, { xmlMode: true });
        const urls: string[] = [];

        $('url loc').each((_, el) => {
            const loc = $(el).text();
            if (loc.includes('job') || loc.includes('vacancy') || loc.includes('career') || loc.includes('intern') || loc.includes('grad')) {
                urls.push(loc);
            }
        });

        return urls;
    }

    /**
     * Specialized parser for SuccessFactors / Workday XML Feeds
     */
    static async parseATSFeed(xml: string) {
        const { parseStringPromise } = require('xml2js');
        try {
            const result = await parseStringPromise(xml);
            const jobs: any[] = [];

            // SuccessFactors often puts jobs in <item> or <job> tags
            const items = result.rss?.channel?.[0]?.item || result.root?.job || [];

            items.forEach((item: any) => {
                const title = item.title?.[0] || item.name?.[0];
                const link = item.link?.[0] || item.url?.[0];
                const description = item.description?.[0] || item.summary?.[0];
                const location = item.location?.[0] || item.city?.[0] || 'South Africa';
                const company = item.company?.[0] || item.organization?.[0];

                if (title && link) {
                    jobs.push({
                        title,
                        link,
                        description: description || '',
                        location,
                        company: company || 'ATS Listing'
                    });
                }
            });
            return jobs;
        } catch (e) {
            console.error("[Discovery] XML Feed Parse Error:", e);
            return [];
        }
    }

    /**
     * Zero-Token Rule-Based Job Classifier
     */
    static classify(title: string) {
        const t = title.toLowerCase();

        const industries: Record<string, string[]> = {
            'IT & Tech': ['dev', 'software', 'eng', 'tech', 'data', 'it ', 'web', 'cyber', 'network', 'cloud', 'system', 'program'],
            'Finance & Accounting': ['account', 'audit', 'bank', 'finance', 'tax', 'credit', 'billing', 'payroll', 'equity'],
            'Medical & Health': ['nurse', 'medic', 'health', 'physio', 'doctor', 'clinic', 'pharm', 'care'],
            'Retail & Sales': ['sales', 'retail', 'clerk', 'cashier', 'merchand', 'store', 'stock'],
            'Engineering & Industrial': ['mechanic', 'electr', 'civil', 'engineer', 'technician', 'mine', 'mining', 'factory'],
            'Legal & Admin': ['admin', 'legal', 'law', 'secretar', 'clerk', 'compliance', 'hr ', 'human res'],
            'Logistics & Transport': ['drive', 'logist', 'fleet', 'warehouse', 'deliver', 'truck', 'courier']
        };

        const levels: Record<string, string[]> = {
            'Internship': ['intern'],
            'Graduate': ['graduate', 'grad ', 'trainee', 'candidate'],
            'Learnership': ['learnership', 'yes '],
            'Bursary': ['bursary', 'funding', 'scholarship'],
            'Entry Level': ['entry', 'junior', 'assistant', 'clerk', 'matric']
        };

        let industry = 'General';
        for (const [ind, keywords] of Object.entries(industries)) {
            if (keywords.some(k => t.includes(k))) {
                industry = ind;
                break;
            }
        }

        let level = 'Full Time';
        for (const [lvl, keywords] of Object.entries(levels)) {
            if (keywords.some(k => t.includes(k))) {
                level = lvl;
                break;
            }
        }

        return { industry, level };
    }
}
