import { useState, useMemo } from "react";
import destinations from "../data/destinations.json";
import DestinationCard from "../components/DestinationCard";
import { Destination } from "../types";
import "../styles/CatalogPage.css";

const typedDestinations = destinations as Destination[];

function CatalogPage() {
    const [search, setSearch] = useState<string>("");
    const [selectedCountry, setSelectedCountry] = useState<string>("");
    const [selectedLanguage, setSelectedLanguage] = useState<string>("");
    const [selectedExchangeType, setSelectedExchangeType] = useState<string>("");

    const countries = useMemo(
        () => [...new Set(typedDestinations.map((d) => d.country))].sort(),
        []
    );

    const languages = useMemo(
        () =>
            [...new Set(typedDestinations.flatMap((d) => d.languages ?? []))].sort(),
        []
    );

    const exchangeTypes = useMemo(
        () =>
            [...new Set(typedDestinations.map((d) => d.exchangeType).filter(Boolean))] as string[],
        []
    );

    const filteredDestinations = useMemo(() => {
        return typedDestinations.filter((d) => {
            const matchesSearch = d.universityName
                .toLowerCase()
                .includes(search.toLowerCase());
            const matchesCountry = selectedCountry === "" || d.country === selectedCountry;
            const matchesLanguage =
                selectedLanguage === "" || (d.languages ?? []).includes(selectedLanguage);
            const matchesExchangeType =
                selectedExchangeType === "" || d.exchangeType === selectedExchangeType;

            return matchesSearch && matchesCountry && matchesLanguage && matchesExchangeType;
        });
    }, [search, selectedCountry, selectedLanguage, selectedExchangeType]);

    const hasActiveFilters =
        search !== "" || selectedCountry !== "" || selectedLanguage !== "" || selectedExchangeType !== "";

    function resetFilters() {
        setSearch("");
        setSelectedCountry("");
        setSelectedLanguage("");
        setSelectedExchangeType("");
    }

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
                        <option value="">🌍 Tous les pays</option>
                        {countries.map((country) => (
                            <option key={country} value={country}>{country}</option>
                        ))}
                    </select>

                    <select
                        className="catalog-select"
                        value={selectedLanguage}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedLanguage(e.target.value)}
                    >
                        <option value="">🗣️ Toutes les langues</option>
                        {languages.map((lang) => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>

                    <select
                        className="catalog-select"
                        value={selectedExchangeType}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedExchangeType(e.target.value)}
                    >
                        <option value="">📋 Tous les types</option>
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
                {filteredDestinations.length === 0 ? (
                    <p className="catalog-page__empty">
                        Aucune destination ne correspond à vos critères.{" "}
                        <button className="catalog-reset--inline" onClick={resetFilters}>
                            Réinitialiser les filtres
                        </button>
                    </p>
                ) : (
                    filteredDestinations.map((destination) => (
                        <DestinationCard key={destination.id} destination={destination} />
                    ))
                )}
            </div>
        </main>
    );
}

export default CatalogPage;
