async function testSearchAPI() {
    const query = "Standard Bank";
    const url = `http://localhost:3000/api/search?query=${encodeURIComponent(query)}`;
    console.log(`Testing API: ${url}`);
    
    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status}`);
        const data = await res.json();
        console.log(`Total Jobs: ${data.jobs?.length || 0}`);
        
        const indexed = data.jobs?.filter((j: any) => j.id.startsWith('indexed-'));
        console.log(`Indexed Jobs Found: ${indexed?.length || 0}`);
        
        if (indexed && indexed.length > 0) {
            console.log("First Indexed Job:", indexed[0].title, "at", indexed[0].company);
        }
    } catch (e: any) {
        console.error("Error:", e.message);
        console.log("Note: If the dev server is not running on port 3000, this might fail. Checking for 'npm run dev' in terminal...");
    }
}

testSearchAPI();
