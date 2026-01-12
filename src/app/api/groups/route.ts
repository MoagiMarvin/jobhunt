import { NextRequest, NextResponse } from "next/server";

// Mock storage for groups (Replace with Supabase when ready)
const groups: Record<string, any> = {};

export async function GET(req: NextRequest) {
    try {
        // Get recruiter ID from header or session
        const recruiterId = req.headers.get("x-recruiter-id") || "demo-recruiter";
        
        const recruiterGroups = Object.values(groups).filter(
            (group) => group.recruiter_id === recruiterId
        );

        return NextResponse.json(recruiterGroups);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch groups" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const { name, description } = await req.json();
        const recruiterId = req.headers.get("x-recruiter-id") || "demo-recruiter";

        if (!name) {
            return NextResponse.json(
                { error: "Group name is required" },
                { status: 400 }
            );
        }

        const groupId = `group-${Date.now()}`;
        groups[groupId] = {
            id: groupId,
            recruiter_id: recruiterId,
            name,
            description,
            candidates: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        return NextResponse.json(groups[groupId], { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create group" },
            { status: 500 }
        );
    }
}
