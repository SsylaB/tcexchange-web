import { Link } from "react-router-dom";
import { Destination } from "../types";
import { useFavorites } from "../context/FavoritesContext";
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

    const { isFavorite, toggleFavorite } = useFavorites();
    const favorited = isFavorite(id);

    return (
        <article className="destination-card">
            <button
                className={`destination-card__favorite${favorited ? " destination-card__favorite--active" : ""}`}
                onClick={() => toggleFavorite(id)}
                aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
                title={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
                {favorited ? "♥" : "♡"}
            </button>

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
