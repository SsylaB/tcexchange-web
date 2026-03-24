import { Destination } from "../types";
import DestinationModal from "./DestinationModal.tsx";
import "../styles/DestinationCard.css";
import {useState} from "react";

interface Props {
    destination: Destination;
}

function DestinationCard({ destination } : Props) {
    const [showModal, setShowModal] = useState(false);
    const {
        id,
        university_name,
        country,
        location,
        url,
        exchange_type = "",
        languages = []
    } = destination;

    return (
        <>
        <article className="destination-card">
            <div className="destination-card__content">
                <p className="destination-card__tag">{country}</p>
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
                    <p className="destination-card__info">
                        <strong>Langues
                            :</strong> {typeof languages === "string" ? languages.split(",").map(l => l.trim()).join(", ") : languages?.join(", ") || "N/A"
                    }
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
    )};

export default DestinationCard;
