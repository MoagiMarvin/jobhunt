import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useSavedJobs() {
    const [savedJobs, setSavedJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    // Get current user ID
    useEffect(() => {
        const getUserId = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.id) {
                setUserId(session.user.id);
            } else {
                // Heuristic: Check local storage for any previously used user_id or basic info
                const storedInfo = localStorage.getItem("user_basic_info");
                if (storedInfo) {
                    try {
                        const parsed = JSON.parse(storedInfo);
                        if (parsed.id) setUserId(parsed.id);
                    } catch (e) { }
                }
            }
        };
        getUserId();
    }, []);

    const fetchSavedJobs = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`/api/jobs/saved?userId=${userId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setSavedJobs(data);
            }
        } catch (err) {
            console.error("Failed to fetch saved jobs:", err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchSavedJobs();
    }, [fetchSavedJobs]);

    const toggleSave = async (job: any) => {
        if (!userId) {
            alert("Please sign in to save jobs.");
            return;
        }

        try {
            const res = await fetch('/api/jobs/saved', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, jobData: job })
            });
            const data = await res.json();

            if (data.saved) {
                setSavedJobs(prev => [data.job, ...prev]);
                return true;
            } else {
                setSavedJobs(prev => prev.filter(j => j.job_data.link !== job.link));
                return false;
            }
        } catch (err) {
            console.error("Toggle save failed:", err);
            return false;
        }
    };

    const updateStatus = async (jobId: string, status: string) => {
        try {
            const res = await fetch('/api/jobs/saved', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId, status })
            });
            const data = await res.json();
            if (data.id) {
                setSavedJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j));
            }
        } catch (err) {
            console.error("Status update failed:", err);
        }
    };

    const isJobSaved = (link: string) => {
        return savedJobs.some(j => j.job_data.link === link);
    };

    return {
        savedJobs,
        loading,
        toggleSave,
        updateStatus,
        isJobSaved,
        refresh: fetchSavedJobs
    };
}
