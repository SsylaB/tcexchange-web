import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Destination } from "../types";
import { COUNTRY_FLAG } from "../utils/CountryFlags.ts"
import "../styles/DestinationPage.css";

const EXCHANGE_TYPE_EMOJI: Record<string, string> = {
    "Erasmus": "🇪🇺",
    "Accord bilatéral": "🤝",
};

function DestinationPage() {
    const { id } = useParams<{ id: string }>();
    const [destination, setDestination] = useState<Destination | null>(null);
    const [suggestions, setSuggestions] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch all destinations
        fetch("http://localhost:3000/api/destinations")
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch destinations");
                return res.json();
            })
            .then((allDestinations: Destination[]) => {
                // Find the destination by ID
                const found = allDestinations.find((d) => d.id === Number(id));
                setDestination(found || null);

                // Get suggestions (other destinations in same country)
                if (found) {
                    const sug = allDestinations
                        .filter((d) => d.country === found.country && d.id !== found.id)
                        .slice(0, 3);
                    setSuggestions(sug);
                }

                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching destination:", err);
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <p>Chargement...</p>;
    if (error) return <p>Erreur: {error}</p>;

    if (!destination) {
        return (
            <main className="destination-page">
                <p className="destination-page__not-found">Destination introuvable.</p>
                <Link to="/catalog" className="destination-page__back">← Retour au catalogue</Link>
            </main>
        );
    }

    const { university_name, country, location, exchange_type, languages, description, url, short_name } = destination;
    const flag = COUNTRY_FLAG[country] ?? "🌍";
    const exchangeEmoji = exchange_type ? EXCHANGE_TYPE_EMOJI[exchange_type] ?? "📋" : null;
    const langArray = languages?.split(",").map(l => l.trim()) ?? [];

    return (
        <main className="destination-page">
            <Link to="/catalog" className="destination-page__back">← Retour au catalogue</Link>

            {/* Header */}
            <div className="destination-page__header">
                <div className="destination-page__flag">{flag}</div>
                <div>
                    {short_name && short_name !== university_name.split(" ")[0] && (
                        <span className="destination-page__shortname">{short_name}</span>
                    )}
                    <h1 className="destination-page__title">{university_name}</h1>
                    <div className="destination-page__meta">
                        {location && <span className="destination-page__location">📍 {location}, {country}</span>}
                        {!location && <span className="destination-page__location">📍 {country}</span>}
                    </div>
                </div>
            </div>

            {/* Description */}
            {description && (
                <p className="destination-page__description">{description}</p>
            )}

            {/* Badges */}
            <div className="destination-page__badges">
                {exchange_type && (
                    <span className={`destination-page__badge destination-page__badge--${exchange_type === "Erasmus" ? "erasmus" : "bilateral"}`}>
                        {exchangeEmoji} {exchange_type}
                    </span>
                )}
                {langArray.map((lang) => (
                    <span key={lang} className="destination-page__badge destination-page__badge--lang">
                        🗣️ {lang}
                    </span>
                ))}
            </div>

            {/* CTA */}
            {url && (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="destination-page__cta"
                >
                    Visiter le site officiel →
                </a>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <section className="destination-page__suggestions">
                    <h2 className="destination-page__suggestions-title">
                        Autres destinations en {flag} {country}
                    </h2>
                    <ul className="destination-page__suggestions-list">
                        {suggestions.map((s) => (
                            <li key={s.id}>
                                <Link to={`/destination/${s.id}`} className="destination-page__suggestion-link">
                                    <strong>{s.short_name}</strong> — {s.university_name}
                                    {s.location && <span> · {s.location}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </main>
    );
}

export default DestinationPage;
