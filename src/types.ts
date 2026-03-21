export interface Destination {
    id: number;
    university_name: string;
    country: string;
    location: string | null;
    url: string | null;
    exchange_type?: string;
    languages?: string | null;
    description?: string;
    short_name?: string;
}
