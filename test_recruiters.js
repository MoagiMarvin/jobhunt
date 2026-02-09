// Test script to verify recruiter LinkedIn search
const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function testRecruiterSearch(recruiter, query) {
    const searchQuery = `${recruiter} South Africa ${query}`;
    const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(searchQuery)}&location=South%20Africa`;

    console.log(`\n=== Testing: ${recruiter} ===`);
    console.log(`Search URL: ${url}`);

    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const html = await res.text();
        const $ = cheerio.load(html);

        // Count job cards
        const jobCards = $('.base-card').length;
        console.log(`Job cards found: ${jobCards}`);

        // Sample first 3 job titles
        $('.base-card').slice(0, 3).each((i, el) => {
            const title = $(el).find('.base-search-card__title').text().trim();
            const company = $(el).find('.base-search-card__subtitle').text().trim();
            console.log(`  ${i + 1}. ${title} at ${company}`);
        });

    } catch (e) {
        console.error(`Error: ${e.message}`);
    }
}

async function run() {
    await testRecruiterSearch('OfferZen', 'Developer');
    await testRecruiterSearch('e-Merge', 'Java');
    await testRecruiterSearch('Network Recruitment', 'Software Engineer');
}

run();
