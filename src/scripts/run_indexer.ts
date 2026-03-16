import { JobCrawler } from '../lib/indexers/crawler';

async function runIndex() {
    console.log("--- STARTING JOB INDEXER ---");
    const crawler = new JobCrawler();
    const jobs = await crawler.crawlAll();
    
    console.log(`\n✅ CRAWL COMPLETE: Found ${jobs.length} jobs.`);
    
    // In a real app, you would save these to Supabase here.
    // console.log(JSON.stringify(jobs.slice(0, 2), null, 2));
    
    console.log("\nNext Step: Saving to Supabase 'indexed_jobs' table...");
}

runIndex().catch(console.error);
