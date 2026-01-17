
async function triggerSync() {
    console.log("🚀 Starting Global Discovery Sync...");
    try {
        const response = await fetch('http://localhost:3000/api/crawl/discover?bulk=true&limit=5');
        const data = await response.json();
        console.log("✅ Sync Complete!");
        console.log("Jobs Found:", data.new_jobs_indexed);
        console.log("Messages:", data.message);
    } catch (error) {
        console.error("❌ Sync Failed:", error.message);
    }
}

triggerSync();
