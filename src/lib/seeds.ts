export interface DiscoverySeed {
    company: string;
    name: string;
    url: string;
    type: 'career_page' | 'aggregator' | 'erecruit' | 'sitemap' | 'ats_feed';
    category: 'Graduate' | 'Internship' | 'Learnership' | 'Bursary' | 'Matric';
}

export const DISCOVERY_SEEDS: DiscoverySeed[] = [
    // --- ATS FEEDS (THE "GRADUATES24" GOLD MINE) ---
    { company: "Nedbank", name: "Nedbank SuccessFactors Feed", url: "https://career2.successfactors.eu/career?company=nedbank&career_ns=job_listing_summary", type: "ats_feed", category: "Graduate" },
    { company: "Standard Bank", name: "Standard Bank Feed", url: "https://career2.successfactors.eu/career?company=standardbank&career_ns=job_listing_summary", type: "ats_feed", category: "Graduate" },
    { company: "Telkom", name: "Telkom Careers Feed", url: "https://career2.successfactors.eu/career?company=telkom&career_ns=job_listing_summary", type: "ats_feed", category: "Graduate" },
    { company: "Spar", name: "Spar Retail Feed", url: "https://career2.successfactors.eu/career?company=spar&career_ns=job_listing_summary", type: "ats_feed", category: "Matric" },

    // --- BANKING & FINANCE (GRADUATE & INTERN) ---
    { company: "Standard Bank", name: "Standard Bank Early Careers", url: "https://www.standardbank.com/sbg/standard-bank-group/careers/early-careers", type: "career_page", category: "Graduate" },
    { company: "Capitec", name: "Capitec Graduate Program", url: "https://www.capitecbank.co.za/about-us/careers/", type: "career_page", category: "Internship" },
    { company: "FirstRand", name: "FirstRand Grad Hub", url: "https://www.firstrand.co.za/careers/graduates/", type: "career_page", category: "Graduate" },

    // --- RETAIL (MATRIC & LEARNERSHIPS) ---
    { company: "Shoprite", name: "Shoprite Retail Readiness", url: "https://www.shopriteholdings.co.za/careers/retail-readiness-programme.html", type: "career_page", category: "Learnership" },
    { company: "Clicks", name: "Clicks Careers Hub", url: "https://careers.clicksgroup.co.za/", type: "career_page", category: "Matric" },
    { company: "Woolworths", name: "Woolworths Graduate/Intern", url: "https://www.woolworthsholdings.co.za/careers/", type: "career_page", category: "Graduate" },

    // --- LEARNERSHIPS GOLD MINES ---
    { company: "DPSA", name: "DPSA Government Internships", url: "https://www.dpsa.gov.za/dpsa2g/vacancies.asp", type: "career_page", category: "Internship" },
    { company: "Eskom", name: "Eskom Skills Development", url: "https://www.eskom.co.za/careers/", type: "career_page", category: "Learnership" },
    { company: "Transnet", name: "Transnet Trainee Opportunities", url: "https://www.transnet.net/Career/Pages/Trainee-Opportunities.aspx", type: "career_page", category: "Learnership" },

    // --- BURSARIES ---
    { company: "SA Bursaries", name: "Bursaries Index 2026", url: "https://www.zabursaries.co.za/", type: "aggregator", category: "Bursary" },
    { company: "StudyTrust", name: "StudyTrust Funding", url: "https://studytrust.org.za/bursaries/", type: "aggregator", category: "Bursary" },

    // --- GOVERNMENT (MATRIC & ENTRY) ---
    { company: "Gov.za", name: "Government Vacancies Bulletin", url: "https://www.gov.za/document?search_query=vacancies", type: "aggregator", category: "Matric" },
    { company: "YES4Youth", name: "YES Initiative Hub", url: "https://www.yes4youth.co.za/", type: "aggregator", category: "Internship" }
];
