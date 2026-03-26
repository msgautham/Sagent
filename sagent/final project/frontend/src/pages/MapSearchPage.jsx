import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { fetchNearbySpaces, fetchParkingSpaces, geocodeAddress } from '../services/parkingService';
import { currency, formatNumber } from '../utils/formatters';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

function FlyToUser({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 12, { duration: 1.2 });
    }
  }, [map, position]);
  return null;
}

export default function MapSearchPage() {
  const [spaces, setSpaces] = useState([]);
  const [position, setPosition] = useState([13.0827, 80.2707]);
  const [userPosition, setUserPosition] = useState(null);
  const [radius, setRadius] = useState(5);
  const [query, setQuery] = useState('');
  const [searchLabel, setSearchLabel] = useState('Chennai');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadNearby = async (lat, lng, nextRadius = radius) => {
    setLoading(true);
    try {
      const nearby = await fetchNearbySpaces(lat, lng, nextRadius);
      setSpaces(nearby);
      setError('');
    } catch (err) {
      const data = await fetchParkingSpaces();
      setSpaces(data);
      setError(err.response?.data?.message || err.message || 'Failed to load nearby spaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const next = [pos.coords.latitude, pos.coords.longitude];
        setPosition(next);
        setUserPosition(next);
        setSearchLabel('Your current location');
        await loadNearby(next[0], next[1], radius);
      },
      async () => {
        await loadNearby(position[0], position[1], radius);
      }
    );
  }, []);

  useEffect(() => {
    loadNearby(position[0], position[1], radius);
  }, [radius]);

  const handleAddressSearch = async (event) => {
    event.preventDefault();
    if (!query.trim()) {
      return;
    }
    setLoading(true);
    try {
      const result = await geocodeAddress(query);
      const next = [result.lat, result.lng];
      setPosition(next);
      setSearchLabel(result.label);
      await loadNearby(result.lat, result.lng, radius);
    } catch (err) {
      setError(err.message || 'Failed to search address');
      setLoading(false);
    }
  };

  const handleUseMyLocation = async () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const next = [pos.coords.latitude, pos.coords.longitude];
        setPosition(next);
        setUserPosition(next);
        setSearchLabel('Your current location');
        await loadNearby(next[0], next[1], radius);
      },
      () => setError('Location permission denied')
    );
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card panel-card p-4">
            <h3 className="fw-bold">Nearby Parking</h3>
            <form onSubmit={handleAddressSearch}>
              <label className="form-label mt-2">Search by address</label>
              <div className="input-group mb-2">
                <input
                  className="form-control"
                  placeholder="Guindy, Chennai"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button className="btn btn-primary" type="submit">Search</button>
              </div>
            </form>
            <button className="btn btn-outline-secondary btn-sm mb-3" onClick={handleUseMyLocation}>
              Use Current Location
            </button>
            <div className="small text-muted mb-3">Showing results near: {searchLabel}</div>
            <label className="form-label mt-2">Search radius (km)</label>
            <input type="range" min="1" max="25" className="form-range" value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
            <div className="mb-3">{radius} km</div>
            {loading && <div className="alert alert-info py-2">Loading nearby spots...</div>}
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <div className="d-grid gap-3">
              {spaces.map((space) => (
                <div className="border rounded-4 p-3 bg-white" key={space.id}>
                  <div className="fw-semibold">{space.name}</div>
                  <div className="small text-muted">{space.address}</div>
                  <div className="small text-muted">{space.locationTag}</div>
                  <div className="mt-2">{currency(space.pricePerHour)} / hour</div>
                  <div className="small">Available slots: {formatNumber(space.availableSlots)}</div>
                  <div className="small">Coordinates: {Number(space.latitude).toFixed(4)}, {Number(space.longitude).toFixed(4)}</div>
                  <div className="small">Distance: {space.distanceKm ? `${Number(space.distanceKm).toFixed(2)} km` : 'N/A'}</div>
                  <div className="mt-2 d-flex gap-2">
                    <Link className="btn btn-sm btn-outline-primary" to={`/parking/${space.id}`}>Details</Link>
                    <Link className="btn btn-sm btn-primary" to={`/booking/${space.id}`}>Book</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card panel-card p-3">
            <div className="map-container">
              <MapContainer center={position} zoom={11} scrollWheelZoom>
                <FlyToUser position={position} />
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {userPosition && (
                  <CircleMarker center={userPosition} radius={10} pathOptions={{ color: '#114b8b' }}>
                    <Popup>Your location</Popup>
                  </CircleMarker>
                )}
                {spaces.map((space) => (
                  <Marker key={space.id} position={[Number(space.latitude), Number(space.longitude)]}>
                    <Popup>
                      <div className="fw-bold">{space.name}</div>
                      <div>{space.locationTag}</div>
                      <div>{currency(space.pricePerHour)} / hour</div>
                      <div>Available slots: {formatNumber(space.availableSlots)}</div>
                      <div>Distance: {space.distanceKm ? `${Number(space.distanceKm).toFixed(2)} km` : 'N/A'}</div>
                      <div className="small">{Number(space.latitude).toFixed(4)}, {Number(space.longitude).toFixed(4)}</div>
                      <Link className="btn btn-sm btn-primary mt-2" to={`/parking/${space.id}`}>Open</Link>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
