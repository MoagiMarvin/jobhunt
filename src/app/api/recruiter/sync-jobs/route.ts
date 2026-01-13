import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import * as parser from "xml2js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ParsedJob {
  external_job_id: string;
  title: string;
  description?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  job_type?: string;
  posted_date?: string;
  application_url: string;
}

async function parseRSSFeed(url: string): Promise<ParsedJob[]> {
  try {
    const response = await fetch(url);
    const text = await response.text();

    const xmlParser = new parser.Parser();
    const parsed = await xmlParser.parseStringPromise(text);

    const jobs: ParsedJob[] = [];
    const items = parsed.rss?.channel?.[0]?.item || [];

    items.forEach((item: any) => {
      jobs.push({
        external_job_id: item.guid?.[0] || item.link?.[0] || "",
        title: item.title?.[0] || "",
        description: item.description?.[0] || "",
        location: item["job:location"]?.[0] || "",
        job_type: item["job:type"]?.[0] || "",
        posted_date: item.pubDate?.[0] || "",
        application_url: item.link?.[0] || "",
      });
    });

    return jobs;
  } catch (error) {
    console.error("Error parsing RSS feed:", error);
    return [];
  }
}

async function parseJSONAPI(url: string): Promise<ParsedJob[]> {
  try {
    const response = await fetch(url);
    const data = await response.json();

    const jobs: ParsedJob[] = [];

    // Handle common JSON API formats
    const jobsArray = Array.isArray(data) ? data : data.jobs || data.data || [];

    jobsArray.forEach((job: any) => {
      jobs.push({
        external_job_id: job.id || job.job_id || "",
        title: job.title || job.job_title || "",
        description: job.description || "",
        location: job.location || "",
        salary_min: job.salary_min || undefined,
        salary_max: job.salary_max || undefined,
        job_type: job.job_type || job.type || "",
        posted_date: job.posted_date || job.created_at || "",
        application_url: job.apply_url || job.url || "",
      });
    });

    return jobs;
  } catch (error) {
    console.error("Error parsing JSON API:", error);
    return [];
  }
}

async function parseXMLSitemap(url: string): Promise<ParsedJob[]> {
  try {
    const response = await fetch(url);
    const text = await response.text();

    const xmlParser = new parser.Parser();
    const parsed = await xmlParser.parseStringPromise(text);

    const jobs: ParsedJob[] = [];
    const urls = parsed.urlset?.url || [];

    urls.forEach((urlEntry: any) => {
      const loc = urlEntry.loc?.[0] || "";
      // Try to extract job ID from URL
      const jobId = loc.split("/").pop() || loc;

      jobs.push({
        external_job_id: jobId,
        title: "", // Will need to be fetched separately or from metadata
        application_url: loc,
      });
    });

    return jobs;
  } catch (error) {
    console.error("Error parsing XML sitemap:", error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { job_board_url, job_board_type } = body;

    if (!job_board_url) {
      return NextResponse.json(
        { error: "job_board_url is required" },
        { status: 400 }
      );
    }

    // Get recruiter profile
    const { data: recruiterProfile, error: profileError } = await supabase
      .from("recruiter_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !recruiterProfile) {
      return NextResponse.json(
        { error: "Recruiter profile not found" },
        { status: 404 }
      );
    }

    // Parse jobs based on feed type
    let jobs: ParsedJob[] = [];

    switch (job_board_type) {
      case "rss":
        jobs = await parseRSSFeed(job_board_url);
        break;
      case "json_api":
        jobs = await parseJSONAPI(job_board_url);
        break;
      case "xml_sitemap":
        jobs = await parseXMLSitemap(job_board_url);
        break;
      default:
        return NextResponse.json(
          { error: "Unsupported job board type" },
          { status: 400 }
        );
    }

    if (jobs.length === 0) {
      return NextResponse.json({
        count: 0,
        message: "No jobs found in the feed",
      });
    }

    // Clear old jobs for this recruiter
    await supabase
      .from("synced_jobs")
      .delete()
      .eq("recruiter_id", recruiterProfile.id);

    // Insert new jobs
    const jobsToInsert = jobs.map((job) => ({
      recruiter_id: recruiterProfile.id,
      external_job_id: job.external_job_id,
      title: job.title,
      description: job.description || null,
      location: job.location || null,
      salary_min: job.salary_min || null,
      salary_max: job.salary_max || null,
      job_type: job.job_type || null,
      posted_date: job.posted_date ? new Date(job.posted_date).toISOString() : null,
      application_url: job.application_url,
      sync_metadata: JSON.stringify(job),
      last_synced_at: new Date().toISOString(),
      is_active: true,
    }));

    const { data: insertedJobs, error: insertError } = await supabase
      .from("synced_jobs")
      .insert(jobsToInsert)
      .select();

    if (insertError) throw insertError;

    return NextResponse.json({
      count: insertedJobs?.length || 0,
      message: `Successfully synced ${insertedJobs?.length || 0} jobs`,
    });
  } catch (error) {
    console.error("Error syncing jobs:", error);
    return NextResponse.json(
      { error: "Failed to sync jobs" },
      { status: 500 }
    );
  }
}
