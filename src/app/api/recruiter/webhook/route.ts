import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables are missing");
  }
  return createClient(url, key);
};

interface ApplicationPayload {
  syncedJobId: string;
  candidateId?: string;
  candidateName: string;
  candidateEmail: string;
  resumeUrl?: string;
  coverLetter?: string;
}

async function sendWebhookToRecruiter(
  webhookUrl: string,
  application: ApplicationPayload
): Promise<{ status: string; response?: any; error?: string }> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "JobHunt-Platform/1.0",
      },
      body: JSON.stringify({
        event: "job_application",
        data: application,
        timestamp: new Date().toISOString(),
      }),
    });

    const responseData = await response.json().catch(() => ({}));

    return {
      status: response.ok ? "delivered" : "failed",
      response: responseData,
    };
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: ApplicationPayload = await request.json();

    if (!body.syncedJobId || !body.candidateName || !body.candidateEmail) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: syncedJobId, candidateName, candidateEmail",
        },
        { status: 400 }
      );
    }

    // Get the synced job
    const { data: syncedJob, error: jobError } = await supabase
      .from("synced_jobs")
      .select("recruiter_id, title, application_url")
      .eq("id", body.syncedJobId)
      .single();

    if (jobError || !syncedJob) {
      return NextResponse.json(
        { error: "Synced job not found" },
        { status: 404 }
      );
    }

    // Get recruiter profile
    const { data: recruiterProfile, error: recruiterError } = await supabase
      .from("recruiter_profiles")
      .select("id, job_board_url")
      .eq("id", syncedJob.recruiter_id)
      .single();

    if (recruiterError || !recruiterProfile) {
      return NextResponse.json(
        { error: "Recruiter not found" },
        { status: 404 }
      );
    }

    // Store application record
    const { data: applicationRecord, error: appError } = await supabase
      .from("job_applications")
      .insert({
        synced_job_id: body.syncedJobId,
        candidate_id: body.candidateId || null,
        recruiter_id: syncedJob.recruiter_id,
        candidate_name: body.candidateName,
        candidate_email: body.candidateEmail,
        resume_url: body.resumeUrl || null,
        cover_letter: body.coverLetter || null,
        webhook_sent_at: new Date().toISOString(),
        webhook_status: "pending",
      })
      .select()
      .single();

    if (appError) throw appError;

    // Determine webhook URL
    const webhookUrl = `${recruiterProfile.job_board_url}/webhooks/application`;

    // Send application to recruiter's system
    const webhookResult = await sendWebhookToRecruiter(webhookUrl, body);

    // Update application record with webhook status
    const { error: updateError } = await supabase
      .from("job_applications")
      .update({
        webhook_status: webhookResult.status,
        webhook_response: webhookResult.response || webhookResult.error || null,
      })
      .eq("id", applicationRecord.id);

    if (updateError) throw updateError;

    return NextResponse.json(
      {
        applicationId: applicationRecord.id,
        message: "Application submitted successfully",
        webhookStatus: webhookResult.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting application:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get("jobId");
    const candidateId = searchParams.get("candidateId");

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId query parameter is required" },
        { status: 400 }
      );
    }

    let query = supabase.from("job_applications").select("*").eq("synced_job_id", jobId);

    if (candidateId) {
      query = query.eq("candidate_id", candidateId);
    }

    const { data: applications, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      applications: applications || [],
      count: applications?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
