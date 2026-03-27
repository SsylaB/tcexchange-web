<<<<<<< HEAD
import { useParams, Link } from "react-router-dom";
import destinations from "../data/destinations.json";
import { Destination } from "../types";
import "../styles/DestinationPage.css";

const typedDestinations = destinations as Destination[];

=======
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Destination } from "../types";
import { COUNTRY_FLAG } from "../utils/CountryFlags.ts"
import "../styles/DestinationPage.css";

>>>>>>> f71d69531026042264f2f0b33938708b39cb0a4c
const EXCHANGE_TYPE_EMOJI: Record<string, string> = {
    "Erasmus": "🇪🇺",
    "Accord bilatéral": "🤝",
};

<<<<<<< HEAD
const COUNTRY_FLAG: Record<string, string> = {
    "Algérie": "🇩🇿", "Allemagne": "🇩🇪", "Argentine": "🇦🇷", "Australie": "🇦🇺",
    "Autriche": "🇦🇹", "Belgique": "🇧🇪", "Bolivie": "🇧🇴", "Brésil": "🇧🇷",
    "Burkina Faso": "🇧🇫", "Canada": "🇨🇦", "Chili": "🇨🇱", "Chine": "🇨🇳",
    "Colombie": "🇨🇴", "Corée du Sud": "🇰🇷", "Danemark": "🇩🇰", "Espagne": "🇪🇸",
    "Estonie": "🇪🇪", "Finlande": "🇫🇮", "Grèce": "🇬🇷", "Haïti": "🇭🇹",
    "Hong Kong": "🇭🇰", "Hongrie": "🇭🇺", "Inde": "🇮🇳", "Indonésie": "🇮🇩",
    "Irlande": "🇮🇪", "Islande": "🇮🇸", "Italie": "🇮🇹", "Japon": "🇯🇵",
    "Lituanie": "🇱🇹", "Maroc": "🇲🇦", "Mexique": "🇲🇽", "Norvège": "🇳🇴",
    "Nouvelle Zélande": "🇳🇿", "Pays Bas": "🇳🇱", "Pérou": "🇵🇪", "Pologne": "🇵🇱",
    "Portugal": "🇵🇹", "République Tchèque": "🇨🇿", "Roumanie": "🇷🇴",
    "Royaume Uni": "🇬🇧", "Russie": "🇷🇺", "Singapour": "🇸🇬", "Slovaquie": "🇸🇰",
    "Slovénie": "🇸🇮", "Suède": "🇸🇪", "Suisse": "🇨🇭", "Tchad": "🇹🇩",
    "Thaïlande": "🇹🇭", "Tunisie": "🇹🇳", "Turquie": "🇹🇷", "USA": "🇺🇸",
    "Venezuela": "🇻🇪", "Vietnam": "🇻🇳",
};

function DestinationPage() {
    const { id } = useParams<{ id: string }>();
    const destination = typedDestinations.find((item) => item.id === Number(id));

    // Suggestions : autres destinations du même pays
    const suggestions = typedDestinations
        .filter((d) => d.country === destination?.country && d.id !== destination?.id)
        .slice(0, 3);
=======
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
>>>>>>> f71d69531026042264f2f0b33938708b39cb0a4c

    if (!destination) {
        return (
            <main className="destination-page">
                <p className="destination-page__not-found">Destination introuvable.</p>
<<<<<<< HEAD
                <Link to="/" className="destination-page__back">← Retour au catalogue</Link>
=======
                <Link to="/catalog" className="destination-page__back">← Retour au catalogue</Link>
>>>>>>> f71d69531026042264f2f0b33938708b39cb0a4c
            </main>
        );
    }

<<<<<<< HEAD
    const { universityName, country, location, exchangeType, languages, description, url, shortName } = destination;
    const flag = COUNTRY_FLAG[country] ?? "🌍";
    const exchangeEmoji = exchangeType ? EXCHANGE_TYPE_EMOJI[exchangeType] ?? "📋" : null;

    return (
        <main className="destination-page">
            <Link to="/" className="destination-page__back">← Retour au catalogue</Link>
=======
    const { university_name, country, location, exchange_type, languages, description, url, short_name } = destination;
    const flag = COUNTRY_FLAG[country] ?? "🌍";
    const exchangeEmoji = exchange_type ? EXCHANGE_TYPE_EMOJI[exchange_type] ?? "📋" : null;
    const langArray = languages?.split(",").map(l => l.trim()) ?? [];

    return (
        <main className="destination-page">
            <Link to="/catalog" className="destination-page__back">← Retour au catalogue</Link>
>>>>>>> f71d69531026042264f2f0b33938708b39cb0a4c

            {/* Header */}
            <div className="destination-page__header">
                <div className="destination-page__flag">{flag}</div>
                <div>
<<<<<<< HEAD
                    {shortName && shortName !== universityName.split(" ")[0] && (
                        <span className="destination-page__shortname">{shortName}</span>
                    )}
                    <h1 className="destination-page__title">{universityName}</h1>
=======
                    {short_name && short_name !== university_name.split(" ")[0] && (
                        <span className="destination-page__shortname">{short_name}</span>
                    )}
                    <h1 className="destination-page__title">{university_name}</h1>
>>>>>>> f71d69531026042264f2f0b33938708b39cb0a4c
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
<<<<<<< HEAD
                {exchangeType && (
                    <span className={`destination-page__badge destination-page__badge--${exchangeType === "Erasmus" ? "erasmus" : "bilateral"}`}>
            {exchangeEmoji} {exchangeType}
          </span>
                )}
                {languages?.map((lang) => (
                    <span key={lang} className="destination-page__badge destination-page__badge--lang">
            🗣️ {lang}
          </span>
=======
                {exchange_type && (
                    <span className={`destination-page__badge destination-page__badge--${exchange_type === "Erasmus" ? "erasmus" : "bilateral"}`}>
                        {exchangeEmoji} {exchange_type}
                    </span>
                )}
                {langArray.map((lang) => (
                    <span key={lang} className="destination-page__badge destination-page__badge--lang">
                        🗣️ {lang}
                    </span>
>>>>>>> f71d69531026042264f2f0b33938708b39cb0a4c
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
<<<<<<< HEAD
                                    <strong>{s.shortName}</strong> — {s.universityName}
=======
                                    <strong>{s.short_name}</strong> — {s.university_name}
>>>>>>> f71d69531026042264f2f0b33938708b39cb0a4c
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
