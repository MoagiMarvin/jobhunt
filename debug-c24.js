
const cheerio = require('cheerio');

async function debug() {
    const keywords = ['internship', 'learnership', 'graduate', 'bursary'];
    const entryLevelKeywords = ['intern', 'grad', 'trainee', 'learnership', 'bursary', 'entry', 'junior', 'matric'];

    for (const kw of keywords) {
        console.log(`\n--- Checking: ${kw} ---`);
        const url = `https://www.careers24.com/jobs/${kw}/`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' } });
        const html = await res.text();
        const $ = cheerio.load(html);

        const cards = $('.job-card');
        console.log(`Found ${cards.length} cards`);

        cards.each((i, el) => {
            const title = $(el).find('h2, h3, .job-title, .c24-job-title').first().text().trim();
            const titleLower = title.toLowerCase();
            const passes = entryLevelKeywords.some(k => titleLower.includes(k));
            console.log(`  [${i}] ${title} -> Passes: ${passes}`);
        });
    }
}

debug();
