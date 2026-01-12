"use client";

import { useState, useEffect } from "react";
import { X, Plus, Check } from "lucide-react";

interface Group {
    id: string;
    name: string;
    description?: string;
}

interface SaveToGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    talent: {
        id: string;
        name: string;
        headline: string;
        sector: string;
    };
    onSave: (groupId: string, notes: string) => void;
    isSaving?: boolean;
}

export default function SaveToGroupModal({
    isOpen,
    onClose,
    talent,
    onSave,
    isSaving = false,
}: SaveToGroupModalProps) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>("");
    const [notes, setNotes] = useState("");
    const [showNewGroup, setShowNewGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupDesc, setNewGroupDesc] = useState("");
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchGroups();
        }
    }, [isOpen]);

    const fetchGroups = async () => {
        setIsLoadingGroups(true);
        try {
            const response = await fetch("/api/groups");
            if (response.ok) {
                const data = await response.json();
                setGroups(data);
                if (data.length > 0) {
                    setSelectedGroupId(data[0].id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch groups:", error);
        } finally {
            setIsLoadingGroups(false);
        }
    };

    const handleCreateNewGroup = async () => {
        if (!newGroupName.trim()) {
            alert("Group name is required");
            return;
        }

        try {
            const response = await fetch("/api/groups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newGroupName,
                    description: newGroupDesc,
                }),
            });

            if (response.ok) {
                const newGroup = await response.json();
                setGroups([...groups, newGroup]);
                setSelectedGroupId(newGroup.id);
                setNewGroupName("");
                setNewGroupDesc("");
                setShowNewGroup(false);
            }
        } catch (error) {
            console.error("Failed to create group:", error);
            alert("Failed to create group");
        }
    };

    const handleSave = () => {
        if (!selectedGroupId) {
            alert("Please select or create a group");
            return;
        }

        onSave(selectedGroupId, notes);
        setNotes("");
        setSelectedGroupId("");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">
                        Save to Group
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Talent Info */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                            Saving Candidate
                        </p>
                        <p className="font-bold text-slate-900">{talent.name}</p>
                        <p className="text-sm text-slate-600">{talent.headline}</p>
                        <p className="text-xs text-slate-500">{talent.sector}</p>
                    </div>

                    {/* Groups Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-700">
                                Select Group
                            </p>
                            <button
                                onClick={() => setShowNewGroup(!showNewGroup)}
                                className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                New
                            </button>
                        </div>

                        {/* New Group Form */}
                        {showNewGroup && (
                            <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <input
                                    type="text"
                                    placeholder="e.g., Doctor - City Hospital"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
                                />
                                <textarea
                                    placeholder="Optional description"
                                    value={newGroupDesc}
                                    onChange={(e) => setNewGroupDesc(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none resize-none h-20"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCreateNewGroup}
                                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all"
                                    >
                                        Create Group
                                    </button>
                                    <button
                                        onClick={() => setShowNewGroup(false)}
                                        className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Groups List */}
                        {isLoadingGroups ? (
                            <div className="py-4 text-center text-slate-500 text-sm">
                                Loading groups...
                            </div>
                        ) : groups.length === 0 ? (
                            <div className="py-4 text-center text-slate-500 text-sm">
                                No groups yet. Create one to get started.
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {groups.map((group) => (
                                    <button
                                        key={group.id}
                                        onClick={() => setSelectedGroupId(group.id)}
                                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                            selectedGroupId === group.id
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-slate-200 bg-white hover:border-slate-300"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">
                                                    {group.name}
                                                </p>
                                                {group.description && (
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {group.description}
                                                    </p>
                                                )}
                                            </div>
                                            {selectedGroupId === group.id && (
                                                <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes about why you saved this candidate..."
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none resize-none h-24"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!selectedGroupId || isSaving}
                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? "Saving..." : "Save Candidate"}
                    </button>
                </div>
            </div>
        </div>
    );
}
