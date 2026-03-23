import { useLeafletContext } from '@react-leaflet/core';
import L, { LatLngTuple } from 'leaflet';
import {useState,useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import { MapContainer, TileLayer, Popup, Marker } from 'react-leaflet';
import '../styles/MapPage.css';
import 'leaflet/dist/leaflet.css';
import { Destination } from "../types";

const center: LatLngTuple = [51.505, -0.09];
const leafIcon = L.icon({
  iconUrl: "/location_pin.png",
  iconSize: [21, 30],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function MapPage() {
  const [destination, setDestination] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/api/destinations")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur réseau");
        return res.json();
      })
      .then((data: Destination[]) => {
        setDestination(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur fetch map:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="map-page">Chargement de la carte...</div>;

  return (
    <div className="map-page">
      <div className="map-page__header">
        <h1 className="map-page__title">Carte des Échanges</h1>
        <p style={{color: 'var(--text-soft)'}}>Explorez les opportunités autour de vous</p>
      </div>

      <div className="map-wrapper">
        <MapContainer 
          center={center} 
          zoom={2}
          minZoom={2}
          maxZoom={18}
          >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {destination.map((dest) => (
              <Marker 
                key={dest.id} 
                position={dest.position as LatLngTuple} 
                icon={leafIcon}
              >
                <Popup>
                  <div style={{ minWidth: '150px' }}>
                    <strong style={{ fontSize: '1.1rem' }}>{dest.universityName}</strong><br />
                    <span>{dest.location}, {dest.country}</span>
                    <strong>Mobilité: </strong> <span>{dest.exchangeType}</span><br />
                    <hr style={{ margin: '8px 0', border: '0', borderTop: '1px solid #eee' }} />
                    <button 
                      onClick={() => console.log(`Détails pour ${dest.url}`)}
                      style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      En savoir plus
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
    </div>
  )
}

export default MapPage;