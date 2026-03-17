import { useState } from "react";
import destinations from "../data/destinations.json";
import DestinationCard from "../components/DestinationCard";

function CatalogPage() {
    const [search, setSearch] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("");

    const countries = [...new Set(destinations.map((d) => d.country))].sort();

    const filteredDestinations = destinations.filter((destination) => {
        const matchesSearch =
        destination.universityName
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesCountry =
            selectedCountry === "" || destination.country === selectedCountry;
        return matchesSearch && matchesCountry;
    });


    return (
        <main style={{ padding: "8rem" }}>
            <h1>Catalogue des destinations</h1>

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

            <p>{filteredDestinations.length} destination(s) trouvée(s)</p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "1rem",
                    marginTop: "1.5rem"
                }}
            >
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
