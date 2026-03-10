export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    link: string;
    source: string;
    isNiche?: boolean;
    date?: string;
    logo?: string | null;
}
