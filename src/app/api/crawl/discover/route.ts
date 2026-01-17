import { NextResponse } from 'next/server';
import { DISCOVERY_SEEDS } from '@/lib/seeds';
import { DiscoveryEngine } from '@/lib/discovery';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const isBulk = searchParams.get('bulk') === 'true';
    const limit = parseInt(searchParams.get('limit') || (isBulk ? '20' : '3'));

    const seeds = isBulk ? DISCOVERY_SEEDS : DISCOVERY_SEEDS.slice(0, limit);
    const results: any[] = [];

    // Find the "System Discovery" recruiter profile to link jobs to
    const { data: recruiter } = await supabase
        .from('recruiter_profiles')
        .select('id')
        .eq('company_name', 'System Discovery')
        .maybeSingle();

    const recruiterId = recruiter?.id;

    if (!recruiterId) {
        return NextResponse.json({ error: "System Discovery profile not found. Please create one with name 'System Discovery'" }, { status: 500 });
    }

    for (const seed of seeds) {
        try {
            console.log(`[Discovery] Crawling: ${seed.name}`);
            const res = await fetch(seed.url, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                signal: AbortSignal.timeout(10000)
            });

            if (!res.ok) continue;
            const content = await res.text();

            if (seed.type === 'ats_feed') {
                const feedJobs = await DiscoveryEngine.parseATSFeed(content);
                for (const job of feedJobs) {
                    const { data: existing } = await supabase
                        .from('synced_jobs')
                        .select('id')
                        .eq('application_url', job.link)
                        .maybeSingle();

                    if (!existing) {
                        await supabase.from('synced_jobs').insert({
                            recruiter_id: recruiterId,
                            title: job.title,
                            description: job.description || `Found via ${seed.name}`,
                            location: job.location || 'South Africa',
                            application_url: job.link,
                            is_active: true,
                            sync_metadata: {
                                category: seed.category,
                                source_seed: seed.name,
                                company: job.company
                            }
                        });
                        results.push({ title: job.title, category: seed.category });
                    }
                }
                continue;
            }

            // --- STANDARD HTML CRAWLING ---
            // 1. Discover potential job links on this page
            const candidateLinks = await DiscoveryEngine.discoverJobLinks(seed.url, content);
            // ... (rest of standard crawling)

            // 2. For each link, try to extract structured data (limited for performance here)
            for (const link of candidateLinks.slice(0, 10)) {
                try {
                    const detailRes = await fetch(link, { signal: AbortSignal.timeout(5000) });
                    if (!detailRes.ok) continue;
                    const detailHtml = await detailRes.text();

                    const jobData = await DiscoveryEngine.extractJsonLd(link, detailHtml);

                    if (jobData && jobData.title) {
                        // SAVE TO SUPABASE
                        const { data: existing } = await supabase
                            .from('synced_jobs')
                            .select('id')
                            .eq('application_url', link)
                            .maybeSingle();

                        if (!existing) {
                            await supabase.from('synced_jobs').insert({
                                recruiter_id: recruiterId,
                                title: jobData.title,
                                description: jobData.description || `Found via ${seed.name}`,
                                location: jobData.location || 'South Africa',
                                application_url: link,
                                is_active: true,
                                sync_metadata: {
                                    category: seed.category,
                                    source_seed: seed.name
                                }
                            });
                            results.push({ title: jobData.title, category: seed.category });
                        }
                    }
                } catch (e) { }
            }
        } catch (e) {
            console.error(`[Discovery] Failed seed ${seed.name}:`, e);
        }
    }

    return NextResponse.json({
        message: `Discovery cycle complete. Checked ${seeds.length} sources.`,
        new_jobs_indexed: results.length,
        jobs: results
    });
}
