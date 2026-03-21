import { Link } from "react-router-dom";
import { Destination } from "../types";
import "../styles/DestinationCard.css";

interface Props {
    destination: Destination;
}

function DestinationCard({ destination } : Props) {
    const {
        id,
        universityName,
        country,
        location,
        url,
        exchangeType = "",
        languages = []
    } = destination;

    return (
        <article className="destination-card">
            <div className="destination-card__content">
                <p className="destination-card__tag">{country}</p>
                <h3 className="destination-card__title">{universityName}</h3>
                {location && (
                    <p className="destination-card__info">
                        <strong>Ville :</strong> {location}
                    </p>
                )}
                {exchangeType && (
                    <p className="destination-card__info">
                        <strong>Type d'échange :</strong> {exchangeType}
                    </p>
                )}
                {languages && languages.length > 0 && (
                    <p className="destination-card__info">
                        <strong>Langues :</strong> {languages.join(", ")}
                    </p>
                )}
            </div>

            <div className="destination-card__actions">
                {url && (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="destination-card__link destination-card__link--secondary"
                    >
                        Site officiel
                    </a>
                )}
                <Link
                    to={`/destination/${id}`}
                    className="destination-card__link destination-card__link--primary"
                >
                    Voir plus
                </Link>
            </div>
        </article>
    );
}

export default DestinationCard;
