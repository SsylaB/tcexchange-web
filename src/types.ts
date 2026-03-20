export interface Destination {
    id: number;
    universityName: string;
    country: string;
    location: string | null;
    url: string | null;
    exchangeType?: string;
    languages?: string[];
    description?: string;
    shortName?: string;
}
