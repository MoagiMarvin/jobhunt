import { NextRequest, NextResponse } from "next/server";

// Mock storage for saved candidates
const savedCandidates: Record<string, any[]> = {};

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ groupId: string }> }
): Promise<Response> {
    try {
        const { groupId } = await params;
        const body = await request.json();
        const { talent_id, talent_name, talent_headline, talent_sector, notes } = body;

        if (!talent_id || !talent_name) {
            return NextResponse.json(
                { error: "Talent ID and name are required" },
                { status: 400 }
            );
        }

        if (!savedCandidates[groupId]) {
            savedCandidates[groupId] = [];
        }

        const candidateId = `candidate-${Date.now()}`;
        const candidate = {
            id: candidateId,
            group_id: groupId,
            talent_id,
            talent_name,
            talent_headline,
            talent_sector,
            notes,
            saved_at: new Date().toISOString(),
        };

        savedCandidates[groupId].push(candidate);

        return NextResponse.json(candidate, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to save candidate" },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ groupId: string }> }
): Promise<Response> {
    try {
        const { groupId } = await params;
        const candidates = savedCandidates[groupId] || [];

        return NextResponse.json(candidates);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch candidates" },
            { status: 500 }
        );
    }
}
