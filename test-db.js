
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function test() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("Testing connection to:", url);
    const supabase = createClient(url, key);

    try {
        const { data, error } = await supabase.from('synced_jobs').select('count', { count: 'exact', head: true });
        if (error) {
            console.error("Connection failed:", error.message);
        } else {
            console.log("Success! Total jobs in DB:", data || 0);
        }
    } catch (e) {
        console.error("Critical failure:", e.message);
    }
}

test();
