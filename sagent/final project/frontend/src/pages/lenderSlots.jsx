import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchParkingSlots } from '../services/parkingService';
import { fetchLenderSpaces } from '../services/lenderService';
import { currency, formatNumber } from '../utils/formatters';

export default function LenderSlots() {
  const [spaces, setSpaces] = useState([]);
  const [slotsBySpace, setSlotsBySpace] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const spacesData = await fetchLenderSpaces();
        setSpaces(spacesData);

        const slotEntries = await Promise.all(
          spacesData.map(async (space) => {
            const slots = await fetchParkingSlots(space.id);
            return [space.id, slots];
          })
        );

        setSlotsBySpace(Object.fromEntries(slotEntries));
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your parking slots');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Slots</h2>
          <div className="text-muted">View slots grouped by each of your parking spaces.</div>
        </div>
        <Link className="btn btn-outline-primary" to="/lender">Back to Dashboard</Link>
      </div>

      {loading && <div className="alert alert-info">Loading parking slots...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && spaces.length === 0 && <div className="alert alert-secondary">No parking spaces found yet.</div>}

      <div className="d-grid gap-4">
        {spaces.map((space) => {
          const slots = slotsBySpace[space.id] || [];

          return (
            <div key={space.id} className="card hero-card p-4">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                <div>
                  <h4 className="fw-bold mb-1">{space.name}</h4>
                  <div className="small text-muted">{space.address}</div>
                  <div className="mt-2">{currency(space.pricePerHour)} / hour</div>
                </div>
                <div className="text-md-end">
                  <div>Status: {space.status}</div>
                  <div className="small text-muted">
                    Available slots: {formatNumber(space.availableSlots)} / {formatNumber(space.totalSlots)}
                  </div>
                </div>
              </div>

              {slots.length === 0 ? (
                <div className="alert alert-light border mb-0">No slots found for this parking space.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Slot Number</th>
                        <th>Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slots.map((slot) => (
                        <tr key={slot.id}>
                          <td>{slot.slotNumber}</td>
                          <td>{slot.slotType}</td>
                          <td>{slot.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
