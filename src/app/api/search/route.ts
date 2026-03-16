import { NextRequest, NextResponse } from "next/server";
import { JobCrawler } from "@/lib/indexers/crawler";
import { 
    scrapePNet, 
    scrapeLinkedIn, 
    scrapeCareers24, 
    scrapeAdzuna, 
    scrapeBingJobs,
    isRelevant
} from "@/lib/indexers/scrapers";

// Search API for Sentinel (v4.0 - Centralized Scraper Architecture)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const source = searchParams.get('source');

    if (!query) {
        return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    console.log(`[SEARCH] Query: "${query}", Source: ${source || 'ALL'}`);

    // 1. --- GOLD STANDARD INDEXING ENGINE (Direct Registry) ---
    const crawler = new JobCrawler();
    const indexedJobsRaw = await crawler.crawlAll();
    const indexedJobs = indexedJobsRaw.filter(j => 
        j.title.toLowerCase().includes(query.toLowerCase()) || 
        j.company.toLowerCase().includes(query.toLowerCase())
    );
    console.log(`[INDEXER] Found ${indexedJobs.length} matches in registry.`);

    // 2. --- SOURCE-SPECIFIC SEARCH ---
    if (source) {
        let jobs: any[] = [];
        try {
            switch (source.toLowerCase()) {
                case 'pnet': jobs = await scrapePNet(query); break;
                case 'linkedin': jobs = await scrapeLinkedIn(query); break;
                case 'careers24': jobs = await scrapeCareers24(query); break;
                case 'adzuna': jobs = await scrapeAdzuna(query); break;
                case 'bing': jobs = await scrapeBingJobs(query); break;
                default:
                    // If source is a company in our registry, the indexer already caught it.
                    // We can add specific deep-scrapes here if needed.
                    jobs = [];
            }
        } catch (e) {
            console.error(`[API] Source error (${source}):`, e);
        }
        return NextResponse.json({ jobs });
    }

    // 3. --- UNIVERSAL SEARCH (Parallel Aggregation) ---
    const results = await Promise.all([
        scrapePNet(query).catch(() => []),
        scrapeLinkedIn(query).catch(() => []),
        scrapeCareers24(query).catch(() => []),
        scrapeAdzuna(query).catch(() => []),
        scrapeBingJobs(query).catch(() => [])
    ]);

    let allJobs = [...indexedJobs, ...results.flat()];

    // 4. --- ENHANCED SHADOW SEARCH (Fallback) ---
    const companyTargets = ['vodacom', 'mtn', 'standard bank', 'fnb', 'standardbank', 'capitec', 'absa', 'nedbank', 'discovery', 'telkom'];
    const isCompanyQuery = companyTargets.some(c => query.toLowerCase().includes(c));

    if (isCompanyQuery && allJobs.length < 15) {
        console.log(`[FALLBACK] Deep Indexing for company: "${query}"...`);
        const fallbacks = await Promise.all([
            scrapePNet(query + " South Africa"),
            scrapeLinkedIn(query + " South Africa")
        ]);
        
        const fallbackJobs = fallbacks.flat().map(j => ({
            ...j,
            source: `${j.source} (Direct Index)`,
            isNiche: true
        }));

        allJobs = [...allJobs, ...fallbackJobs];
    }

    // 5. --- DE-DUPLICATION & FINAL FILTERING ---
    const seen = new Set();
    const finalJobs = allJobs.filter(j => {
        const key = `${j.title.toLowerCase().trim()}-${j.company.toLowerCase().trim()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        
        // Final relevance guard
        return isRelevant(j.title, j.company, query);
    });

    console.log(`[SEARCH] Returning ${finalJobs.length} unique jobs.`);
    return NextResponse.json({ jobs: finalJobs });
}

