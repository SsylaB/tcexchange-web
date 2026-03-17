import { useState } from "react";
import destinations from "../data/destinations.json";
import DestinationCard from "../components/DestinationCard";
import { Destination } from "../types";

const typedDestinations = destinations as Destination[];

function CatalogPage() {
    const [search, setSearch] = useState<string>("");
    const [selectedCountry, setSelectedCountry] = useState<string>("");

    const countries: string[] = [...new Set(typedDestinations.map((d) => d.country))].sort();

    const filteredDestinations = typedDestinations.filter((destination) => {
        const matchesSearch = destination.universityName
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesCountry =
            selectedCountry === "" || destination.country === selectedCountry;
        return matchesSearch && matchesCountry;
    });


    return (
        <main className={"catalog-page"}>
            <h1 className="catalog-page__title">Catalogue des destinations</h1>

            <div className="catalog-filters">
                <input
                    className="catalog-input"
                    type="text"
                    placeholder="Rechercher une université..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    className="catalog-select"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                >
                    <option value="">Tous les pays</option>
                    {countries.map((country) => (
                        <option key={country} value={country}>
                            {country}
                        </option>
                    ))}
                </select>
            </div>

            <p className={"catalog-page__count"}>
                {filteredDestinations.length} destination(s) trouvée(s)
            </p>

            <div className="catalog-grid">
                {filteredDestinations.map((destination) => (
                    <DestinationCard
                        key={destination.id}
                        destination={destination}
                    />
                ))}
            </div>
        </main>
    );
}

export default CatalogPage;
