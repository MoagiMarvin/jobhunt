
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { supabase } from '@/lib/supabase';

// Reusing relevance guard
function isRelevant(title: string, query: string): boolean {
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length >= 2);
    if (keywords.length === 0) return true;
    const titleLower = title.toLowerCase();
    return keywords.some(keyword => titleLower.includes(keyword));
}

// Reusing scrapers (compacted for this bulk route)
async function scrapeAdzuna(query: string) {
    try {
        const url = `https://www.adzuna.co.za/search?q=${encodeURIComponent(query)}`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(10000)
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
                jobs.push({
                    title,
                    link: link.startsWith('http') ? link : `https://www.adzuna.co.za${link}`,
                    company: $(el).find('.ui-job-card-company, .company').first().text().trim() || "Adzuna Merchant",
                    location: $(el).find('.ui-job-card-location, .location').first().text().trim() || "South Africa"
                });
            }
        });
        return jobs;
    } catch (e) { return []; }
}

async function scrapePNet(query: string) {
    try {
        const keyword = query.trim().replace(/\s+/g, '-').toLowerCase();
        const url = `https://www.pnet.co.za/jobs/${keyword}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(10000) });
        if (!res.ok) return [];
        const html = await res.text();
        const $ = cheerio.load(html);
        const jobs: any[] = [];
        $('article, [data-at="job-item"]').each((i, el) => {
            const titleEl = $(el).find('h2, h3, [data-at="job-item-title"]').first();
            const linkEl = titleEl.find('a').first().length > 0 ? titleEl.find('a').first() : (titleEl.is('a') ? titleEl : $(el).find('a[href*="/job-ad/"]').first());
            const title = titleEl.text().trim();
            const link = linkEl.attr('href');
            if (title && link && isRelevant(title, query)) {
                jobs.push({
                    title,
                    link: link.startsWith('http') ? link : `https://www.pnet.co.za${link}`,
                    company: $(el).find('[data-at="job-item-company-name"]').first().text().trim() || "PNet Employer",
                    location: $(el).find('[data-at="job-item-location"]').first().text().trim() || "South Africa"
                });
            }
        });
        return jobs;
    } catch (e) { return []; }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'index'; // 'index' or 'clean'

    // Get System Discovery Recruiter
    const { data: recruiter } = await supabase
        .from('recruiter_profiles')
        .select('id')
        .eq('company_name', 'System Discovery')
        .maybeSingle();

    if (!recruiter) {
        return NextResponse.json({ error: "System Discovery profile not found" }, { status: 500 });
    }

    const keywords = ['internship', 'learnership', 'graduate 2026', 'bursary 2026', 'matric', 'entry level'];
    const results: any[] = [];
    let newJobsCount = 0;

    for (const kw of keywords) {
        console.log(`[Bulk] Scraping for: ${kw}`);
        const [adzunaJobs, pnetJobs] = await Promise.all([
            scrapeAdzuna(kw),
            scrapePNet(kw)
        ]);

        const allJobs = [...adzunaJobs, ...pnetJobs];

        for (const job of allJobs) {
            try {
                // Check for duplicates
                const { data: existing } = await supabase
                    .from('synced_jobs')
                    .select('id')
                    .eq('application_url', job.link)
                    .maybeSingle();

                if (!existing) {
                    const category = kw.includes('intern') ? 'Internship' :
                        kw.includes('learn') ? 'Learnership' :
                            kw.includes('bursary') ? 'Bursary' :
                                kw.includes('grad') ? 'Graduate' : 'Matric';

                    const { error } = await supabase.from('synced_jobs').insert({
                        recruiter_id: recruiter.id,
                        title: job.title,
                        description: `Found via Bulk Sync for ${kw}. Original Source: ${job.link.includes('adzuna') ? 'Adzuna' : 'PNet'}`,
                        location: job.location,
                        application_url: job.link,
                        is_active: true,
                        sync_metadata: {
                            category,
                            indexed_at: new Date().toISOString(),
                            original_company: job.company
                        }
                    });

                    if (!error) {
                        newJobsCount++;
                        results.push({ title: job.title, category });
                    }
                }
            } catch (e) { }
        }
    }

    return NextResponse.json({
        message: "Bulk Sync complete",
        new_jobs: newJobsCount,
        recent: results.slice(0, 5)
    });
}
