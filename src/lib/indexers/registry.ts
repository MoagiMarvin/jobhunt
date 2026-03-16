export type SourceType = 'Workday' | 'SmartRecruiters' | 'AgencyAPI' | 'WordPress' | 'SuccessFactors';

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
    category: 'Bank' | 'Agency' | 'Tech' | 'Retail' | 'Telecom' | 'Insurance';
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
    },
    {
        id: 'mtn',
        name: 'MTN',
        type: 'Workday',
        config: { tenant: 'mtn', companyId: 'mtn_careers' },
        category: 'Telecom',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/MTN_Logo.svg'
    },
    {
        id: 'absa',
        name: 'Absa',
        type: 'Workday',
        config: { tenant: 'absa', companyId: 'ABSAcareersite' },
        category: 'Bank',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Absa_Logo.svg'
    },
    {
        id: 'discovery',
        name: 'Discovery',
        type: 'Workday',
        config: { tenant: 'discovery', companyId: 'Discovery_Careers' },
        category: 'Insurance',
        logo: 'https://upload.wikimedia.org/wikipedia/en/1/1d/Discovery_Limited_Logo.svg'
    },
    {
        id: 'nedbank',
        name: 'Nedbank',
        type: 'Workday',
        config: { tenant: 'nedbank', companyId: 'Nedbank_External_Careers' },
        category: 'Bank',
        logo: 'https://upload.wikimedia.org/wikipedia/en/3/3a/Nedbank_logo.svg'
    },
    {
        id: 'vodacom',
        name: 'Vodacom',
        type: 'SuccessFactors',
        config: { baseUrl: 'https://jobs.vodacom.co.za' },
        category: 'Telecom',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Vodacom_Logo.svg'
    }
];
