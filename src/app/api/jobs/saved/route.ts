import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * API for Managing Saved Jobs
 * GET: Fetch all saved jobs for the user
 * POST: Save a new job
 * PATCH: Update status (applied, interviewing, etc.)
 */

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('saved_jobs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (err: any) {
        console.error('[SAVED_JOBS] GET Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, jobData } = body;

        if (!userId || !jobData) {
            return NextResponse.json({ error: 'User ID and Job Data required' }, { status: 400 });
        }

        // Check if already exists
        const { data: existing } = await supabase
            .from('saved_jobs')
            .select('id')
            .eq('user_id', userId)
            .filter('job_data->>link', 'eq', jobData.link)
            .single();

        if (existing) {
            // Unsave logic (delete if already exists)
            const { error: delError } = await supabase
                .from('saved_jobs')
                .delete()
                .eq('id', existing.id);

            if (delError) throw delError;
            return NextResponse.json({ message: 'unsaved', saved: false });
        }

        const { data, error } = await supabase
            .from('saved_jobs')
            .insert({
                user_id: userId,
                job_data: jobData,
                status: 'saved'
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ message: 'saved', saved: true, job: data });
    } catch (err: any) {
        console.error('[SAVED_JOBS] POST Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { jobId, status } = body;

        if (!jobId || !status) {
            return NextResponse.json({ error: 'Job ID and Status required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('saved_jobs')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', jobId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (err: any) {
        console.error('[SAVED_JOBS] PATCH Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get('jobId');

        if (!jobId) {
            return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('saved_jobs')
            .delete()
            .eq('id', jobId);

        if (error) throw error;

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (err: any) {
        console.error('[SAVED_JOBS] DELETE Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
