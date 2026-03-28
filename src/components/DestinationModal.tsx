import { DestinationRaw } from "../types";
import { COUNTRY_FLAG } from "../utils/CountryFlags.ts";
import "../styles/DestinationModal.css";

const EXCHANGE_TYPE_EMOJI: Record<string, string> = {
    Erasmus: "🇪🇺",
    "Accord bilatéral": "🤝",
};

interface Props {
    destination: DestinationRaw;
    onClose: () => void;
}

function DestinationModal({ destination, onClose }: Props) {
    const {
        university_name,
        country,
        location,
        exchange_type,
        languages,
        description,
        url,
        short_name,
    } = destination;

    const flag = COUNTRY_FLAG[country] ?? "🌍";
    const exchangeEmoji = exchange_type
        ? (EXCHANGE_TYPE_EMOJI[exchange_type] ?? "📋")
        : null;
    const langArray = languages?.split(",").map((l) => l.trim()) ?? [];

    // Close when clicking the backdrop
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-panel" role="dialog" aria-modal="true">
                <button
                    className="modal-close"
                    onClick={onClose}
                    aria-label="Fermer"
                >
                    ✕
                </button>

                <div className="modal-header">
                    <div className="modal-flag">{flag}</div>
                    <div>
                        {short_name &&
                            short_name !== university_name.split(" ")[0] && (
                                <span className="modal-shortname">
                                    {short_name}
                                </span>
                            )}
                        <h2 className="modal-title">{university_name}</h2>
                        <div className="modal-meta">
                            {location ? (
                                <span>
                                    📍 {location}, {country}
                                </span>
                            ) : (
                                <span>📍 {country}</span>
                            )}
                        </div>
                    </div>
                </div>

                {description && (
                    <p className="modal-description">{description}</p>
                )}

                <div className="modal-badges">
                    {exchange_type && (
                        <span
                            className={`modal-badge modal-badge--${exchange_type === "Erasmus" ? "erasmus" : "bilateral"}`}
                        >
                            {exchangeEmoji} {exchange_type}
                        </span>
                    )}
                    {langArray.map((lang) => (
                        <span
                            key={lang}
                            className="modal-badge modal-badge--lang"
                        >
                            🗣️ {lang}
                        </span>
                    ))}
                </div>

                {url && (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="modal-cta"
                    >
                        Visiter le site officiel →
                    </a>
                )}
            </div>
        </div>
    );
}

export default DestinationModal;
