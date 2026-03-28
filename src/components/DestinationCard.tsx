import { DestinationRaw } from "../types";
import DestinationModal from "./DestinationModal.tsx";
import  { useFavorites } from "../context/FavoritesContext.tsx";
import "../styles/DestinationCard.css";
import { useState } from "react";

interface Props {
    destination: DestinationRaw;
}

function DestinationCard({ destination }: Props) {
    const [showModal, setShowModal] = useState(false);
    const { toggleFavorite, isFavorite } = useFavorites();
    const {
        id,
        university_name,
        country,
        location,
        url,
        exchange_type = "",
        languages = [],
    } = destination;
    const favorited = isFavorite(id);
    return (
        <>
            <article className="destination-card">
                <div className="destination-card__content">
                    <div className="destination-card__top">
                        <p className="badge badge--country">{country}</p>
                        <button
                            type="button"
                            onClick={() => toggleFavorite(id)}
                            className={`destination-card__favorite ${favorited ? "destination-card__favorite--active" : ""}`}
                            aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
                            title={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
                        >
                            {favorited ? "★" : "☆"}
                        </button>
                    </div>

                    <h3 className="destination-card__title">{university_name}</h3>
                    {location && (
                        <p className="destination-card__info">
                            <strong>Ville :</strong> {location}
                        </p>
                    )}
                    {exchange_type && (
                        <p className="destination-card__info">
                            <strong>Type d'échange :</strong> {exchange_type}
                        </p>
                    )}
                    {languages && languages.length > 0 && (
                        <div className="destination-card__languages">
                            {(typeof languages === "string"
                                    ? languages.split(",").map((l) => l.trim())
                                    : languages
                            ).map((lang) => (
                                <span key={lang} className="badge badge--lang">
                  🗣️ {lang}
                </span>
                            ))}
                        </div>
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
                    <button
                        onClick={() => setShowModal(true)}
                        className="destination-card__link destination-card__link--primary"
                    >
                        Voir plus
                    </button>
                </div>
            </article>

            {showModal && (
                <DestinationModal
                    destination={destination}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}

export default DestinationCard;