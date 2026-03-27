import { Link } from "react-router-dom";
import { Destination } from "../types";
import "../styles/DestinationCard.css";

interface Props {
    destination: Destination;
}

function DestinationCard({ destination } : Props) {
    const {
        id,
<<<<<<< HEAD
        universityName,
        country,
        location,
        url,
        exchangeType = "",
=======
        university_name,
        country,
        location,
        url,
        exchange_type = "",
>>>>>>> f71d69531026042264f2f0b33938708b39cb0a4c
        languages = []
    } = destination;

    return (
        <article className="destination-card">
            <div className="destination-card__content">
                <p className="destination-card__tag">{country}</p>
<<<<<<< HEAD
                <h3 className="destination-card__title">{universityName}</h3>
=======
                <h3 className="destination-card__title">{university_name}</h3>
>>>>>>> f71d69531026042264f2f0b33938708b39cb0a4c
                {location && (
                    <p className="destination-card__info">
                        <strong>Ville :</strong> {location}
                    </p>
                )}
<<<<<<< HEAD
                {exchangeType && (
                    <p className="destination-card__info">
                        <strong>Type d'échange :</strong> {exchangeType}
=======
                {exchange_type && (
                    <p className="destination-card__info">
                        <strong>Type d'échange :</strong> {exchange_type}
>>>>>>> f71d69531026042264f2f0b33938708b39cb0a4c
                    </p>
                )}
                {languages && languages.length > 0 && (
                    <p className="destination-card__info">
<<<<<<< HEAD
                        <strong>Langues :</strong> {languages.join(", ")}
=======
                        <strong>Langues :</strong> {typeof languages === "string" ? languages.split(",").map(l => l.trim()).join(", ") : languages?.join(", ") || "N/A"
                    }
>>>>>>> f71d69531026042264f2f0b33938708b39cb0a4c
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
