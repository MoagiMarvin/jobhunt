"use client";

import { useState, useEffect } from "react";
import { FolderOpen, Trash2, Mail, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";

interface Candidate {
    id: string;
    talent_id: string;
    talent_name: string;
    talent_headline: string;
    talent_sector: string;
    notes?: string;
    saved_at: string;
}

interface Group {
    id: string;
    name: string;
    description?: string;
    candidates?: Candidate[];
}

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/groups");
            if (response.ok) {
                const data = await response.json();
                // Fetch candidates for each group
                const groupsWithCandidates = await Promise.all(
                    data.map(async (group: Group) => {
                        const candResponse = await fetch(
                            `/api/groups/${group.id}`
                        );
                        const candidates = candResponse.ok
                            ? await candResponse.json()
                            : [];
                        return { ...group, candidates };
                    })
                );
                setGroups(groupsWithCandidates);
                if (groupsWithCandidates.length > 0) {
                    setSelectedGroup(groupsWithCandidates[0].id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch groups:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedGroupData = groups.find((g) => g.id === selectedGroup);
    const candidates = selectedGroupData?.candidates || [];

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-12 pt-24">
                {/* Header */}
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            Saved Candidates
                        </h1>
                        <p className="text-slate-600">
                            Organize and manage candidates you're interested in by groups.
                        </p>
                    </div>
                    <Link
                        href="/recruiter/search"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Find Candidates
                    </Link>
                </div>

                {isLoading ? (
                    <div className="bg-white rounded-xl p-20 text-center">
                        <p className="text-slate-500">Loading groups...</p>
                    </div>
                ) : groups.length === 0 ? (
                    <div className="bg-white rounded-xl p-20 text-center space-y-4 border border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                            <FolderOpen className="w-8 h-8 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">
                            No groups yet
                        </h3>
                        <p className="text-slate-500 max-w-xs mx-auto">
                            Start searching for talent and save them to groups to organize your hiring pipeline.
                        </p>
                        <Link
                            href="/recruiter/search"
                            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all"
                        >
                            Browse Talent
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Sidebar - Groups List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="p-4 border-b border-slate-200 bg-slate-50">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Groups ({groups.length})
                                    </p>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {groups.map((group) => (
                                        <button
                                            key={group.id}
                                            onClick={() => setSelectedGroup(group.id)}
                                            className={`w-full text-left p-4 transition-all ${
                                                selectedGroup === group.id
                                                    ? "bg-blue-50 border-l-4 border-l-blue-600"
                                                    : "hover:bg-slate-50"
                                            }`}
                                        >
                                            <p className="font-bold text-sm text-slate-900">
                                                {group.name}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {group.candidates?.length || 0}{" "}
                                                candidate
                                                {(group.candidates?.length || 0) !== 1 &&
                                                    "s"}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main - Candidates List */}
                        <div className="lg:col-span-3">
                            {selectedGroupData && (
                                <>
                                    {/* Group Info */}
                                    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
                                        <h2 className="text-2xl font-bold text-slate-900">
                                            {selectedGroupData.name}
                                        </h2>
                                        {selectedGroupData.description && (
                                            <p className="text-slate-600 mt-2">
                                                {selectedGroupData.description}
                                            </p>
                                        )}
                                        <p className="text-sm text-slate-500 mt-4">
                                            {candidates.length} candidate
                                            {candidates.length !== 1 && "s"} saved
                                        </p>
                                    </div>

                                    {/* Candidates List */}
                                    {candidates.length === 0 ? (
                                        <div className="bg-white rounded-xl p-16 text-center border border-slate-200">
                                            <p className="text-slate-500">
                                                No candidates saved to this group yet.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {candidates.map((candidate) => (
                                                <div
                                                    key={candidate.id}
                                                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-400 transition-all"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-bold text-slate-900">
                                                                {candidate.talent_name}
                                                            </h3>
                                                            <p className="text-sm text-slate-600 mt-1">
                                                                {candidate.talent_headline}
                                                            </p>
                                                            <div className="flex gap-2 mt-3 flex-wrap">
                                                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-bold border border-blue-100">
                                                                    {candidate.talent_sector}
                                                                </span>
                                                            </div>

                                                            {candidate.notes && (
                                                                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                                        Notes
                                                                    </p>
                                                                    <p className="text-sm text-slate-600">
                                                                        {candidate.notes}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            <p className="text-xs text-slate-400 mt-4">
                                                                Saved{" "}
                                                                {new Date(
                                                                    candidate.saved_at
                                                                ).toLocaleDateString()}
                                                            </p>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex flex-col gap-2">
                                                            <button className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all" title="Send email">
                                                                <Mail className="w-4 h-4" />
                                                            </button>
                                                            <button className="p-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg transition-all" title="Add note">
                                                                <MessageSquare className="w-4 h-4" />
                                                            </button>
                                                            <button className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all" title="Remove">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
