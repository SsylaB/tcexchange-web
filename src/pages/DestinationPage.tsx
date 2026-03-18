import { useParams, Link } from "react-router-dom";
import destinations from "../data/destinations.json";
import { Destination } from "../types";
import "../styles/DestinationPage.css";

const typedDestinations = destinations as Destination[];

const EXCHANGE_TYPE_EMOJI: Record<string, string> = {
    "Erasmus": "🇪🇺",
    "Accord bilatéral": "🤝",
};

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

    if (!destination) {
        return (
            <main className="destination-page">
                <p className="destination-page__not-found">Destination introuvable.</p>
                <Link to="/" className="destination-page__back">← Retour au catalogue</Link>
            </main>
        );
    }

    const { universityName, country, location, exchangeType, languages, description, url, shortName } = destination;
    const flag = COUNTRY_FLAG[country] ?? "🌍";
    const exchangeEmoji = exchangeType ? EXCHANGE_TYPE_EMOJI[exchangeType] ?? "📋" : null;

    return (
        <main className="destination-page">
            <Link to="/" className="destination-page__back">← Retour au catalogue</Link>

            {/* Header */}
            <div className="destination-page__header">
                <div className="destination-page__flag">{flag}</div>
                <div>
                    {shortName && shortName !== universityName.split(" ")[0] && (
                        <span className="destination-page__shortname">{shortName}</span>
                    )}
                    <h1 className="destination-page__title">{universityName}</h1>
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
                {exchangeType && (
                    <span className={`destination-page__badge destination-page__badge--${exchangeType === "Erasmus" ? "erasmus" : "bilateral"}`}>
            {exchangeEmoji} {exchangeType}
          </span>
                )}
                {languages?.map((lang) => (
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
                                    <strong>{s.shortName}</strong> — {s.universityName}
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
