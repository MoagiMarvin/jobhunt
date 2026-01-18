
const fs = require('fs');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

// Load env
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key);

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

async function fetchHtml(url) {
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': USER_AGENT },
            signal: AbortSignal.timeout(10000)
        });
        if (!res.ok) return null;
        return await res.text();
    } catch (e) {
        console.error(`[Fetch] Failed: ${url}`, e.message);
        return null;
    }
}

async function scrapePortal(seed) {
    console.log(`🔍 Processing Portal: ${seed.company} (${seed.name})`);
    const html = await fetchHtml(seed.url);
    if (!html) return [];

    const $ = cheerio.load(html);
    const jobs = [];

    // Heuristic: Find links that look like jobs or applications
    $('a').each((i, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href');
        if (!href || href.length < 5) return;

        const absoluteUrl = href.startsWith('http') ? href : new URL(href, seed.url).toString();
        const textLower = text.toLowerCase();

        // Keywords for entry-level / direct jobs
        const isJob =
            textLower.includes('graduate') ||
            textLower.includes('intern') ||
            textLower.includes('learnership') ||
            textLower.includes('bursary') ||
            textLower.includes('trainee') ||
            textLower.includes('view vacancy') ||
            textLower.includes('details');

        if (isJob && !absoluteUrl.includes('login') && !absoluteUrl.includes('register')) {
            // Sanitation: Filter out garbage titles (CSS selectors or too short)
            let cleanTitle = text.trim();
            if (cleanTitle.startsWith('.') || cleanTitle.includes('{') || cleanTitle.length < 5) {
                cleanTitle = `${seed.company} Opportunity`;
            }

            jobs.push({
                title: cleanTitle,
                link: absoluteUrl,
                company: seed.company,
                location: "South Africa"
            });
        }
    });

    return jobs;
}

// Specialized scraper for SuccessFactors feeds (if XML is obtainable)
async function scrapeATSFeed(seed) {
    console.log(`📡 Fetching ATS Feed: ${seed.company}`);
    // For now, we use a simple fallback until we fix the XML parsing perfectly
    return await scrapePortal(seed);
}

async function enrichExistingJobs() {
    console.log("💎 Starting Enrichment for existing jobs...");
    const { data: jobs, error } = await supabase
        .from('synced_jobs')
        .select('id, application_url, title')
        .or('description.eq.Indexed via Discovery Engine for internship.,description.eq.Direct opportunity from Standard Bank careers portal.,description.is.null')
        .limit(50);

    if (error) return console.error("Enrichment fetch error:", error);
    console.log(`Found ${jobs?.length} jobs to enrich.`);

    for (const job of jobs || []) {
        console.log(`  📄 Enriching: ${job.title}...`);
        const html = await fetchHtml(job.application_url);
        if (html) {
            const $ = cheerio.load(html);
            const bodyText = $('main, article, .job-description, .vacancy-details, #job-description, .c24-vacancy-body').text().trim();
            if (bodyText.length > 200) {
                const cleanText = bodyText.substring(0, 5000);
                await supabase.from('synced_jobs').update({ description: cleanText }).eq('id', job.id);
                console.log(`    ✅ Updated description (${cleanText.length} chars)`);
            } else {
                console.log(`    ⚠️ No rich content found.`);
            }
        }
        await new Promise(r => setTimeout(r, 1000)); // Rate limiting
    }
}

const CATEGORIES = {
    'IT & Tech': ['dev', 'software', 'eng', 'tech', 'data', 'it ', 'web', 'cyber', 'network', 'cloud', 'system', 'program'],
    'Finance & Accounting': ['account', 'audit', 'bank', 'finance', 'tax', 'credit', 'billing', 'payroll', 'equity'],
    'Medical & Health': ['nurse', 'medic', 'health', 'physio', 'doctor', 'clinic', 'pharm', 'care'],
    'Retail & Sales': ['sales', 'retail', 'clerk', 'cashier', 'merchand', 'store', 'stock'],
    'Engineering & Industrial': ['mechanic', 'electr', 'civil', 'engineer', 'technician', 'mine', 'mining', 'factory'],
    'Legal & Admin': ['admin', 'legal', 'law', 'secretar', 'clerk', 'compliance', 'hr ', 'human res'],
    'Logistics & Transport': ['drive', 'logist', 'fleet', 'warehouse', 'deliver', 'truck', 'courier']
};

const LEVELS = {
    'Internship': ['intern'],
    'Graduate': ['graduate', 'grad ', 'trainee', 'candidate'],
    'Learnership': ['learnership', 'yes '],
    'Bursary': ['bursary', 'funding', 'scholarship'],
    'Entry Level': ['entry', 'junior', 'assistant', 'clerk', 'matric']
};

function classify(title) {
    const t = title.toLowerCase();
    let industry = 'General';
    for (const [ind, keywords] of Object.entries(CATEGORIES)) {
        if (keywords.some(k => t.includes(k))) { industry = ind; break; }
    }
    let level = 'Full Time';
    for (const [lvl, keywords] of Object.entries(LEVELS)) {
        if (keywords.some(k => t.includes(k))) { level = lvl; break; }
    }
    return { industry, level };
}

async function run() {
    const mode = process.argv[2] || 'sync';

    if (mode === 'enrich') {
        await enrichExistingJobs();
    } else {
        console.log("🏁 Starting MASSIVE Rule-Based Sync...");
        const recruiterId = '4c80a1c4-0586-4216-a94b-83ba9f7826d9'; // System Discovery

        const seeds = [
            { company: "Standard Bank", name: "Standard Bank All", url: "https://www.standardbank.com/sbg/standard-bank-group/careers/early-careers", type: "career_page" },
            { company: "Nedbank", name: "Nedbank All", url: "https://jobs.nedbank.co.za/content/Nedbank-Graduate-Programme/", type: "career_page" }, // Using grad page as entry point
            { company: "Capitec", name: "Capitec All Careers", url: "https://www.capitecbank.co.za/about-us/careers/", type: "career_page" },
            { company: "PNet", name: "PNet All Jobs", url: "https://www.pnet.co.za/jobs", type: "aggregator" }
        ];

        for (const seed of seeds) {
            const jobs = await scrapePortal(seed);
            console.log(`✅ ${seed.company}: Found ${jobs.length} potential jobs.`);

            let count = 0;
            for (const job of jobs) {
                const { industry, level } = classify(job.title);
                console.log(`  📄 Processing: ${job.title} [${industry} | ${level}]`);

                const { error } = await supabase.from('synced_jobs').upsert({
                    recruiter_id: recruiterId,
                    title: job.title,
                    description: `Rich details waiting for ${job.title}. Category: ${industry}`,
                    location: job.location,
                    application_url: job.link,
                    is_active: true,
                    sync_metadata: {
                        industry,
                        level,
                        company: job.company,
                        source: 'Discovery Engine',
                        indexed_at: new Date().toISOString()
                    }
                }, { onConflict: 'application_url' });

                if (!error) count++;
            }
            console.log(`🚀 Synced ${count} jobs for ${seed.company}`);
        }

        console.log("✨ Sync Finished. Running Enrichment...");
        await enrichExistingJobs();
    }
    console.log("🏁 Process Finished!");
}

run();
