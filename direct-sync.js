
const fs = require('fs');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

// Load env
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key);

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

async function scrapeCareers24(query) {
    console.log(`🔍 Scraping Careers24 for: ${query}`);
    try {
        let url = `https://www.careers24.com/jobs/search-results/?keywords=${encodeURIComponent(query)}`;
        if (query === 'internship') url = "https://www.careers24.com/jobs/internship/";
        if (query === 'learnership') url = "https://www.careers24.com/jobs/learnership/";
        if (query === 'bursary') url = "https://www.careers24.com/jobs/search-results/?keywords=bursary";

        const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        const html = await res.text();
        const $ = cheerio.load(html);
        const jobs = [];

        $('.job-card, .c24-job-card').each((i, el) => {
            const titleEl = $(el).find('h2, h3, .job-title, .c24-job-title').first();
            const linkEl = titleEl.find('a').first().length > 0 ? titleEl.find('a').first() : (titleEl.is('a') ? titleEl : $(el).find('a').first());
            const title = titleEl.text().trim();
            const link = linkEl.attr('href');

            if (title && link) {
                // Relaxed filter: If we are on a category page, we trust the site more.
                const titleLower = title.toLowerCase();
                const entryKeywords = ['intern', 'grad', 'trainee', 'learn', 'bursary', 'entry', 'junior', 'matric', 'student', 'youth'];

                const isRelevant = entryKeywords.some(k => titleLower.includes(k)) ||
                    titleLower.includes(query.toLowerCase()) ||
                    (['internship', 'learnership'].includes(query)); // Trust these specific pages

                if (isRelevant) {
                    const company = $(el).find('.company-name, .job-card-company').first().text().trim() || "Careers24 Employer";
                    const location = $(el).find('.location, .job-card-location').first().text().trim() || "South Africa";

                    jobs.push({
                        title,
                        link: link.startsWith('http') ? link : `https://www.careers24.com${link}`,
                        company,
                        location
                    });
                }
            }
        });
        return jobs;
    } catch (e) { console.error("Careers24 error:", e.message); return []; }
}

async function scrapePNet(query) {
    console.log(`🔍 Scraping PNet for: ${query}`);
    try {
        const keyword = query.trim().replace(/\s+/g, '-').toLowerCase();
        const url = `https://www.pnet.co.za/jobs/${keyword}`;
        const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        const html = await res.text();
        const $ = cheerio.load(html);
        const jobs = [];

        $('article, [data-at="job-item"]').each((i, el) => {
            const titleEl = $(el).find('h2, h3, [data-at="job-item-title"]').first();
            const linkEl = titleEl.find('a').first().length > 0 ? titleEl.find('a').first() : (titleEl.is('a') ? titleEl : $(el).find('a[href*="/job-ad/"]').first());
            const title = titleEl.text().trim();
            const link = linkEl.attr('href');

            if (title && link) {
                jobs.push({
                    title,
                    link: link.startsWith('http') ? link : `https://www.pnet.co.za${link}`,
                    company: $(el).find('[data-at="job-item-company-name"]').first().text().trim() || "PNet Employer",
                    location: $(el).find('[data-at="job-item-location"]').first().text().trim() || "South Africa"
                });
            }
        });
        return jobs;
    } catch (e) { console.error("PNet error:", e.message); return []; }
}

async function run() {
    console.log("🏁 Starting Massive Sync Engine...");
    const recruiterId = '4c80a1c4-0586-4216-a94b-83ba9f7826d9'; // System Discovery
    const queries = ['internship', 'learnership', 'graduate 2026', 'bursary'];

    for (const q of queries) {
        const [c24Jobs, pnetJobs] = await Promise.all([
            scrapeCareers24(q),
            scrapePNet(q)
        ]);

        const allJobs = [...c24Jobs, ...pnetJobs];
        console.log(`Found ${allJobs.length} potential jobs for ${q}`);

        let count = 0;
        for (const job of allJobs) {
            const category = q.includes('intern') ? 'Internship' :
                q.includes('learn') ? 'Learnership' :
                    q.includes('bursary') ? 'Bursary' : 'Graduate';

            const { error } = await supabase.from('synced_jobs').upsert({
                recruiter_id: recruiterId,
                title: job.title,
                description: `Indexed via Discovery Engine for ${q}.`,
                location: job.location,
                application_url: job.link,
                is_active: true,
                sync_metadata: {
                    category,
                    company: job.company,
                    indexed_at: new Date().toISOString()
                }
            }, { onConflict: 'application_url' });

            if (!error) count++;
        }
        console.log(`Successfully synced ${count} jobs for ${q}`);
    }
    console.log("✨ Massive Sync Finished!");
}

run();
