import L, { LatLngTuple } from 'leaflet';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Popup, Marker } from 'react-leaflet';
import { Destination } from "../types";

// Styles
import '../styles/MapPage.css';
import 'leaflet/dist/leaflet.css';

// Configuration de l'icône par défaut
const center: LatLngTuple = [51.505, -0.09];
const leafIcon = L.icon({
  iconUrl: "/location_pin3.png",
  iconSize: [21, 30],         // La taille réelle de ton image
  iconAnchor: [10.5, 30],     // [Largeur/2, Hauteur] -> Pile au milieu en bas
  popupAnchor: [0, -30],      // Le popup s'ouvrira juste au-dessus du pin
});

function MapPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (loading) {
    return <div className="map-page">Chargement de la carte...</div>;
  }

  return (
    <div className="map-page">
      <div className="map-page__header">
        <h1 className="map-page__title">Carte des Échanges</h1>
        <p style={{ color: 'var(--text-soft)' }}>Explorez les opportunités autour de vous</p>
      </div>

      <div className="map-wrapper">
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

          {destinations.map((dest) => {
            if (!dest.position) return null;  // skip nulls immediately

            let coords: LatLngTuple;
            try {
              const parsed = JSON.parse(dest.position as string);
              if (!Array.isArray(parsed) || parsed.length < 2) return null;
              coords = [parsed[0], parsed[1]] as LatLngTuple;
              if (isNaN(coords[0]) || isNaN(coords[1])) return null;
              if (coords[0] === 0 && coords[1] === 0) return null;  // exclude invalid default
            } catch (e) {
              return null;
            }

            return (
            <Marker key={dest.id} position={coords} icon={leafIcon}>
                <Popup>
                  <div style={{ minWidth: '150px' }}>
                    <strong style={{ fontSize: '1.1rem' }}>
                      {dest.university_name || (dest as any).university_name}
                    </strong>
                    <br />
                    <span>{dest.location}, {dest.country}</span>
                    <br />
                    {dest.exchange_type && (
                      <div style={{ marginTop: '5px' }}>
                        <strong>Mobilité: </strong> 
                        <span>{dest.exchange_type}</span>
                      </div>
                    )}
                    
                    <hr style={{ margin: '8px 0', border: '0', borderTop: '1px solid #eee' }} />
                    
                    <button 
                      onClick={() => navigate(`/destination/${dest.id}`)}
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
    </div>
  );
}

export default MapPage;