export type SourceType = 'Workday' | 'SmartRecruiters' | 'AgencyAPI' | 'WordPress';

export interface SourceDefinition {
    id: string;
    name: string;
    type: SourceType;
    config: {
        tenant?: string;
        companyId?: string;
        baseUrl?: string;
        apiEndpoint?: string;
    };
    category: 'Bank' | 'Agency' | 'Tech' | 'Retail';
    logo: string;
}

/**
 * The Source Registry
 * Add companies here to have them indexed by the crawler.
 */
export const SOURCE_REGISTRY: SourceDefinition[] = [
    {
        id: 'standard-bank',
        name: 'Standard Bank',
        type: 'SmartRecruiters',
        config: { companyId: 'StandardBankGroup' },
        category: 'Bank',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Standard_Bank_Logo.svg'
    },
    {
        id: 'fnb-firstrand',
        name: 'FNB / FirstRand',
        type: 'Workday',
        config: { tenant: 'firstrand', companyId: 'FRB' },
        category: 'Bank',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/d/df/FNB_Logo.svg'
    },
    {
        id: 'network-recruitment',
        name: 'Network Recruitment',
        type: 'AgencyAPI',
        config: { baseUrl: 'https://az-jhb-was-rescr-duda-api-prod-networkrecruitint.azurewebsites.net/PlacementPartnerXml' },
        category: 'Agency',
        logo: 'https://www.networkrecruitmentinternational.com/images/network-logo.png'
    }
];
