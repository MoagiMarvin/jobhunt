
async function verify() {
    const url = "https://www.networkrecruitmentinternational.com/job-details?instance=network1&vacancy_ref=BIT005411/Sam";
    try {
        const res = await fetch("http://localhost:3000/api/job/content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Content size:", data.content ? data.content.length : "N/A");
        console.log("Direct Apply URL:", data.directApplyUrl);
        if (data.content) {
            console.log("Content Preview (100 chars):", data.content.substring(0, 100));
        } else if (data.error) {
            console.log("Error:", data.error);
        }
    } catch (e) {
        console.error("Verification failed:", e.message);
    }
}
verify();
