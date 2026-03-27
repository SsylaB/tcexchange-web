import L, { LatLngTuple } from 'leaflet';
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Popup, Marker, useMap } from 'react-leaflet';
import { Destination } from "../types";
import { COUNTRY_FLAG } from "../utils/CountryFlags";

import '../styles/MapPage.css';
import 'leaflet/dist/leaflet.css';

const EXCHANGE_TYPE_EMOJI: Record<string, string> = {
    "Erasmus": "🇪🇺",
    "Accord bilatéral": "🤝",
};

const center: LatLngTuple = [20, 10];
const leafIcon = L.icon({
    iconUrl: "/location_pin.png",
    iconSize: [21, 30],
    iconAnchor: [10.5, 30],
    popupAnchor: [0, -30],
});

// Composant interne qui recentre la carte quand le panneau s'ouvre
function MapRecenterer({ coords, panelOpen }: { coords: LatLngTuple | null, panelOpen: boolean }) {
    const map = useMap();
    const prevPanelOpen = useRef(false);

    useEffect(() => {
        if (!coords) return;
        if (panelOpen && !prevPanelOpen.current) {
            // Le panneau vient de s'ouvrir : décale le centre vers la gauche
            // pour que le point reste visible dans la moitié gauche
            const point = map.latLngToContainerPoint(coords);
            const newPoint = L.point(point.x - map.getSize().x * 0.22, point.y);
            const newCenter = map.containerPointToLatLng(newPoint);
            map.panTo(newCenter, { animate: true, duration: 0.4 });
        }
        prevPanelOpen.current = panelOpen;
    }, [panelOpen, coords, map]);

    return null;
}

function MapPage() {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
    const [selectedCoords, setSelectedCoords] = useState<LatLngTuple | null>(null);

    useEffect(() => {
        fetch("http://localhost:3000/api/destinations")
            .then((res) => {
                if (!res.ok) throw new Error("Erreur réseau");
                return res.json();
            })
            .then((data: Destination[]) => {
                setDestinations(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erreur fetch map:", err);
                setLoading(false);
            });
    }, []);

    function handleSelect(dest: Destination, coords: LatLngTuple) {
        setSelectedDest(dest);
        setSelectedCoords(coords);
    }

    if (loading) {
        return <div className="map-page">Chargement de la carte...</div>;
    }

    const flag = selectedDest ? (COUNTRY_FLAG[selectedDest.country] ?? "🌍") : null;
    const langArray = selectedDest?.languages?.split(",").map(l => l.trim()) ?? [];
    const exchangeEmoji = selectedDest?.exchange_type
        ? (EXCHANGE_TYPE_EMOJI[selectedDest.exchange_type] ?? "📋")
        : null;

    return (
        <div className="map-page">
            <div className="map-page__header">
                <h1 className="page-title page-title--standard page-title--centered">Carte des Échanges</h1>
                <p style={{ color: 'var(--text-soft)' }}>Explorez les opportunités autour de vous</p>
            </div>

            <div className={`map-split ${selectedDest ? 'map-split--open' : ''}`}>
                <div className="map-split__map">
                    <MapContainer
                        center={center}
                        zoom={2}
                        minZoom={2}
                        maxZoom={18}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapRecenterer coords={selectedCoords} panelOpen={!!selectedDest} />

                        {destinations.map((dest) => {
                            if (!dest.position) return null;
                            let coords: LatLngTuple;
                            try {
                                const parsed = JSON.parse(dest.position as string);
                                if (!Array.isArray(parsed) || parsed.length < 2) return null;
                                coords = [parsed[0], parsed[1]] as LatLngTuple;
                                if (isNaN(coords[0]) || isNaN(coords[1])) return null;
                                if (coords[0] === 0 && coords[1] === 0) return null;
                            } catch (e) {
                                return null;
                            }

                            return (
                                <Marker key={dest.id} position={coords} icon={leafIcon}>
                                    <Popup>
                                        <div style={{ minWidth: '150px' }}>
                                            <strong style={{ fontSize: '1.1rem' }}>
                                                {dest.university_name}
                                            </strong>
                                            <br />
                                            <span>{dest.location}, {dest.country}</span>
                                            {dest.exchange_type && (
                                                <div style={{ marginTop: '5px' }}>
                                                    <strong>Mobilité: </strong>
                                                    <span>{dest.exchange_type}</span>
                                                </div>
                                            )}
                                            <hr style={{ margin: '8px 0', border: '0', borderTop: '1px solid #eee' }} />
                                            <button
                                                onClick={() => handleSelect(dest, coords)}
                                                style={{
                                                    background: '#007bff',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '5px 10px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    width: '100%',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                En savoir plus
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>

                {selectedDest && (
                    <div className="map-split__panel">
                        <button className="map-split__close" onClick={() => setSelectedDest(null)}>✕</button>
                        <div className="map-split__panel-inner">
                            <div className="panel__flag">{flag}</div>
                            {selectedDest.short_name && (
                                <span className="panel__shortname">{selectedDest.short_name}</span>
                            )}
                            <h2 className="panel__title">{selectedDest.university_name}</h2>
                            <p className="panel__location">
                                {selectedDest.location ? (
                                    <>📍 {selectedDest.location}, {selectedDest.country}</>
                                ) : (
                                    <>📍 {selectedDest.country}</>
                                )}
                            </p>
                            {selectedDest.description && (
                                <p className="panel__description">{selectedDest.description}</p>
                            )}
                            <div className="panel__badges">
                                {selectedDest.exchange_type && (
                                    <span className={`badge badge--${selectedDest.exchange_type === "Erasmus" ? "erasmus" : "bilateral"}`}>
                                        {exchangeEmoji} {selectedDest.exchange_type}
                                    </span>
                                )}
                                {langArray.map((lang) => (
                                    <span key={lang} className="badge badge--lang">
                                        🗣️ {lang}
                                    </span>
                                ))}
                            </div>
                            {selectedDest.url && (
                                <a
                                    href={selectedDest.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="panel__cta"
                                    >
                                    Visiter le site officiel →
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MapPage;
