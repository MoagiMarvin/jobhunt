import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const getSupabaseAdmin = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error('Supabase environment variables are missing');
    }

    return createClient(url, key);
};

// Helper to normalize URLs for matching
const normalizeUrl = (url: string) => {
    try {
        const u = new URL(url);
        return u.origin + u.pathname + u.search;
    } catch {
        return url.split('#')[0];
    }
};

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin
            .from('saved_jobs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (err: unknown) {
        console.error('[SAVED_JOBS] GET Error:', err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, jobData } = body;

        if (!userId || !jobData || !jobData.link) {
            return NextResponse.json({ error: 'User ID and valid Job Data required' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();
        const normalizedLink = normalizeUrl(jobData.link);

        // Check if already exists using normalized link
        const { data: existing } = await supabaseAdmin
            .from('saved_jobs')
            .select('id')
            .eq('user_id', userId)
            .filter('job_data->>link', 'eq', normalizedLink)
            .single();

        if (existing) {
            const { error: delError } = await supabaseAdmin
                .from('saved_jobs')
                .delete()
                .eq('id', existing.id);

            if (delError) throw delError;
            return NextResponse.json({ message: 'unsaved', saved: false });
        }

        const { data, error } = await supabaseAdmin
            .from('saved_jobs')
            .insert({
                user_id: userId,
                job_data: { ...jobData, link: normalizedLink },
                status: 'saved'
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ message: 'saved', saved: true, job: data });
    } catch (err: unknown) {
        console.error('[SAVED_JOBS] POST Error:', err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { jobId, status } = body;

        if (!jobId || !status) {
            return NextResponse.json({ error: 'Job ID and Status required' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin
            .from('saved_jobs')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', jobId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (err: unknown) {
        console.error('[SAVED_JOBS] PATCH Error:', err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get('jobId');

        if (!jobId) {
            return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin
            .from('saved_jobs')
            .delete()
            .eq('id', jobId);

        if (error) throw error;

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (err: unknown) {
        console.error('[SAVED_JOBS] DELETE Error:', err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
