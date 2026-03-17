import { useParams, Link } from "react-router-dom";
import destinations from "../data/destinations.json";
import { Destination } from "../types";

const typedDestinations = destinations as Destination[];

function DestinationPage() {
    const { id } = useParams<{ id: string }>();
    const destination = typedDestinations.find((item) => item.id === Number(id));

    if (!destination) {
        return (
            <main className="destination-page">
                <p className="destination-page__not-found">Destination introuvable.</p>
                <Link to="/" className="destination-page__back">← Retour au catalogue</Link>
            </main>
        );
    }

    const { universityName, country, location, exchangeType, languages, description, url } = destination;

    return (
        <main className="destination-page">
            <Link to="/" className="destination-page__back">← Retour au catalogue</Link>

            <div className="destination-page__header">
                <span className="destination-page__tag">{country}</span>
                <h1 className="destination-page__title">{universityName}</h1>
                {location && <p className="destination-page__location">📍 {location}</p>}
            </div>

            {description && (
                <p className="destination-page__description">{description}</p>
            )}

            <div className="destination-page__details">
                {exchangeType && (
                    <div className="destination-page__detail-item">
                        <span className="destination-page__detail-label">Type d'échange</span>
                        <span className="destination-page__detail-value">{exchangeType}</span>
                    </div>
                )}
                {languages && languages.length > 0 && (
                    <div className="destination-page__detail-item">
                        <span className="destination-page__detail-label">Langues</span>
                        <span className="destination-page__detail-value">{languages.join(", ")}</span>
                    </div>
                )}
                {country && (
                    <div className="destination-page__detail-item">
                        <span className="destination-page__detail-label">Pays</span>
                        <span className="destination-page__detail-value">{country}</span>
                    </div>
                )}
            </div>

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
        </main>
    );
}

export default DestinationPage;
