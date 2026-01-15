import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
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

    // Fetch recruiter profile
    const { data: profile, error } = await supabase
      .from("recruiter_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!profile) {
      // Return empty template if no profile exists
      return NextResponse.json({
        id: "",
        user_id: user.id,
        company_name: "",
        full_name: "",
        email: user.email || "",
        phone: "",
        company_website: "",
        industry: "",
        specializations: [],
        company_size: "",
        years_in_business: null,
        linkedin_url: "",
        verification_status: "pending",
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching recruiter profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
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

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("recruiter_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let result;
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from("recruiter_profiles")
        .update({
          company_name: body.company_name,
          full_name: body.full_name,
          email: body.email,
          phone: body.phone || null,
          company_website: body.company_website || null,
          industry: body.industry || null,
          specializations: body.specializations || [],
          company_size: body.company_size || null,
          years_in_business: body.years_in_business || null,
          linkedin_url: body.linkedin_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from("recruiter_profiles")
        .insert({
          user_id: user.id,
          company_name: body.company_name,
          full_name: body.full_name,
          email: body.email,
          phone: body.phone || null,
          company_website: body.company_website || null,
          industry: body.industry || null,
          specializations: body.specializations || [],
          company_size: body.company_size || null,
          years_in_business: body.years_in_business || null,
          linkedin_url: body.linkedin_url || null,
          verification_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error saving recruiter profile:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
