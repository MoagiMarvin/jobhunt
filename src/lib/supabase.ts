import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// HELPER: Check if URL is valid to prevent createClient from crashing the whole API route
const isValidUrl = (url: string | undefined): boolean => {
    if (!url || url.includes("your_supabase_url_here")) return false;
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};

if (!isValidUrl(supabaseUrl) || !supabaseServiceKey) {
    console.warn("[Supabase] Invalid or missing environment variables. Discovery features will be disabled.");
}

const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl! : "https://placeholder-v12345.supabase.co";
const finalKey = supabaseServiceKey && !supabaseServiceKey.includes("your_service_role_key_here") ? supabaseServiceKey : "placeholder";

export const supabase = createClient(finalUrl, finalKey);
