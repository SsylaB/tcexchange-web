export interface Destination {
    id: number;
<<<<<<< HEAD
    universityName: string;
    country: string;
    location: string | null;
    url: string | null;
    exchangeType?: string;
    languages?: string[];
    description?: string;
    shortName?: string;
=======
    university_name: string;
    country: string;
    location: string | null;
    url: string | null;
    exchange_type?: string;
    languages?: string | null;
    description?: string;
    short_name?: string;
    position?: string;
>>>>>>> f71d69531026042264f2f0b33938708b39cb0a4c
}
