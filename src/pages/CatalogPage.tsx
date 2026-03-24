import { useState, useEffect, useMemo } from "react";
import DestinationCard from "../components/DestinationCard";
import { Destination } from "../types";
import "../styles/CatalogPage.css";

function CatalogPage() {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(8);

    const [search, setSearch] = useState<string>("");
    const [selectedCountry, setSelectedCountry] = useState<string>("");
    const [selectedLanguage, setSelectedLanguage] = useState<string>("");
    const [selectedExchangeType, setSelectedExchangeType] = useState<string>("");

    // Fetch destinations from backend on component mount
    useEffect(() => {
        fetch("http://localhost:3000/api/destinations")
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch destinations");
                return res.json();
            })
            .then(data => {
                setDestinations(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching destinations:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        setVisibleCount(12);
    }, [search, selectedCountry, selectedLanguage, selectedExchangeType]);

    const countries = useMemo(
        () => [...new Set(destinations.map((d) => d.country))].sort(),
        [destinations]
    );

    const languages = useMemo(
        () =>
            [...new Set(destinations.flatMap((d) => d.languages?.split(",").map(l => l.trim()) ?? []))].sort(),
        [destinations]
    );

    const exchangeTypes = useMemo(
        () =>
            [...new Set(destinations.map((d) => d.exchange_type).filter(Boolean))] as string[],
        [destinations]
    );

    const filteredDestinations = useMemo(() => {
        return destinations.filter((d) => {
            const matchesSearch = d.university_name
                .toLowerCase()
                .includes(search.toLowerCase());
            const matchesCountry = selectedCountry === "" || d.country === selectedCountry;
            const matchesLanguage =
                selectedLanguage === "" || (d.languages?.split(",").map(l => l.trim()) ?? []).includes(selectedLanguage);
            const matchesExchangeType =
                selectedExchangeType === "" || d.exchange_type === selectedExchangeType;

            return matchesSearch && matchesCountry && matchesLanguage && matchesExchangeType;
        });
    }, [search, selectedCountry, selectedLanguage, selectedExchangeType, destinations]);

    const hasActiveFilters =
        search !== "" || selectedCountry !== "" || selectedLanguage !== "" || selectedExchangeType !== "";

    const visibleDestinations = filteredDestinations.slice(0, visibleCount);

    function resetFilters() {
        setSearch("");
        setSelectedCountry("");
        setSelectedLanguage("");
        setSelectedExchangeType("");
    }

    if (loading) return <p>Chargement des destinations...</p>;
    if (error) return <p>Erreur: {error}</p>;

    return (
        <main className="catalog-page">
            <h1 className="catalog-page__title">Catalogue des destinations</h1>

            <div className="catalog-filters">
                <div className="catalog-filters__search-row">
                    <input
                        className="catalog-input"
                        type="text"
                        placeholder="Rechercher une université..."
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    />
                </div>
                <div className="catalog-filters__options-row">
                    <select
                        className="catalog-select"
                        value={selectedCountry}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCountry(e.target.value)}
                    >
                        <option value="">🌍 Pays spécifique</option>
                        {countries.map((country) => (
                            <option key={country} value={country}>{country}</option>
                        ))}
                    </select>

                    <select
                        className="catalog-select"
                        value={selectedLanguage}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedLanguage(e.target.value)}
                    >
                        <option value="">🗣️ Langues parlées</option>
                        {languages.map((lang) => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>

                    <select
                        className="catalog-select"
                        value={selectedExchangeType}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedExchangeType(e.target.value)}
                    >
                        <option value="">📋 Type d'échange</option>
                        {exchangeTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>

                    {hasActiveFilters && (
                        <button className="catalog-reset" onClick={resetFilters}>
                            ✕ Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            <p className="catalog-page__count">
                {filteredDestinations.length} destination(s) trouvée(s)
                {hasActiveFilters && (
                    <span className="catalog-page__count--active"> · filtres actifs</span>
                )}
            </p>

            <div className="catalog-grid">
                {visibleDestinations.map((destination) => (
                    <DestinationCard key={destination.id} destination={destination} />
                ))}
            </div>

            {visibleCount < filteredDestinations.length && (
                <div className="catalog-load-more-actions">
                    <button
                        className="catalog-load-more"
                        onClick={() => setVisibleCount(prev => prev + 8)}
                    >
                        Afficher plus ({filteredDestinations.length - visibleCount} restantes)
                    </button>
                    <button
                        className="catalog-load-more catalog-load-more--secondary"
                        onClick={() => setVisibleCount(filteredDestinations.length)}
                    >
                        Tout afficher
                    </button>
                </div>
            )}

        </main>
    );
}

export default CatalogPage;
