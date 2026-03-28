// Raw shape from the Rust API
export interface DestinationRaw {
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

// Normalized shape used across all components
export type Destination = {
    id: number;
    name: string;
    country: string;
    location: string;
    url: string;
    type: string;
    languages: string[];
    description: string;
    shortName: string;
    rawExchangeType: string;
    dest: string;
    features: string[];
};
