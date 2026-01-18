export interface DiscoverySeed {
    company: string;
    name: string;
    url: string;
    type: 'career_page' | 'aggregator' | 'erecruit' | 'sitemap' | 'ats_feed';
    category: 'Graduate' | 'Internship' | 'Learnership' | 'Bursary' | 'Matric';
}

export const DISCOVERY_SEEDS: DiscoverySeed[] = [
    // --- ATS FEEDS (DIRECT SOURCE) ---
    { company: "Nedbank", name: "Nedbank SuccessFactors Feed", url: "https://career2.successfactors.eu/career?company=nedbank&career_ns=job_listing_summary", type: "ats_feed", category: "Graduate" },
    { company: "Standard Bank", name: "Standard Bank Feed", url: "https://career2.successfactors.eu/career?company=standardbank&career_ns=job_listing_summary", type: "ats_feed", category: "Graduate" },
    { company: "Telkom", name: "Telkom Careers Feed", url: "https://career2.successfactors.eu/career?company=telkom&career_ns=job_listing_summary", type: "ats_feed", category: "Graduate" },
    { company: "Spar", name: "Spar Retail Feed", url: "https://career2.successfactors.eu/career?company=spar&career_ns=job_listing_summary", type: "ats_feed", category: "Matric" },

    // --- DIRECT CAREER PORTALS (PREMIUM SOURCE) ---
    { company: "Standard Bank", name: "Standard Bank Early Careers", url: "https://www.standardbank.com/sbg/standard-bank-group/careers/early-careers", type: "career_page", category: "Graduate" },
    { company: "Capitec", name: "Capitec Careers Portal", url: "https://www.capitecbank.co.za/about-us/careers/", type: "career_page", category: "Internship" },
    { company: "Nedbank", name: "Nedbank Grad/Intern", url: "https://jobs.nedbank.co.za/content/Nedbank-Graduate-Programme/", type: "career_page", category: "Graduate" },
    { company: "Shoprite", name: "Shoprite Careers", url: "https://www.shopriteholdings.co.za/careers.html", type: "career_page", category: "Learnership" },
    { company: "Vodacom", name: "Vodacom Early Careers", url: "https://www.vodacom.com/early-careers.php", type: "career_page", category: "Graduate" },
    { company: "MTN", name: "MTN Global Graduate", url: "https://www.mtn.com/careers/global-graduate-programme/", type: "career_page", category: "Graduate" },
    { company: "Old Mutual", name: "Old Mutual Careers", url: "https://www.oldmutual.co.za/careers/", type: "career_page", category: "Graduate" },
    { company: "Investec", name: "Investec Graduate opportunities", url: "https://www.investec.com/en_za/focus/graduate-opportunities.html", type: "career_page", category: "Graduate" },

    // --- GOVERNMENT & DPSA ---
    { company: "DPSA", name: "DPSA Vacancies (Manual)", url: "https://www.dpsa.gov.za/dpsa2g/vacancies.asp", type: "career_page", category: "Internship" },

    // --- BURSARIES ---
    { company: "SA Bursaries", name: "Bursaries Index 2026", url: "https://www.zabursaries.co.za/", type: "aggregator", category: "Bursary" },

    // --- BULK BACKUP (AGGREGATORS) ---
    { company: "PNet", name: "PNet Internship Search", url: "https://www.pnet.co.za/jobs/internship", type: "aggregator", category: "Internship" },
    { company: "Careers24", name: "Careers24 Learnerships", url: "https://www.careers24.com/jobs/learnership/", type: "aggregator", category: "Learnership" }
];
