import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createBooking } from '../services/bookingService';
import { fetchAlternativeSpaces, fetchParkingDetails, fetchParkingSlots } from '../services/parkingService';
import { fetchVehicles, fetchWallet } from '../services/buyerService';
import { makePayment } from '../services/paymentService';
import { currency, formatNumber } from '../utils/formatters';

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [space, setSpace] = useState(null);
  const [slots, setSlots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [alternatives, setAlternatives] = useState([]);
  const [form, setForm] = useState({
    vehicleId: '',
    slotId: '',
    parkingSpaceId: Number(id),
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    fetchParkingDetails(id).then(setSpace);
    fetchParkingSlots(id).then(setSlots);
    fetchVehicles().then(setVehicles);
    fetchWallet().then(setWallet);
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const booking = await createBooking({
        ...form,
        vehicleId: Number(form.vehicleId),
        slotId: form.slotId ? Number(form.slotId) : null,
        parkingSpaceId: Number(id)
      });
      await makePayment({
        bookingId: booking.id,
        amount: booking.finalAmount || booking.totalAmount,
        paymentMethod: 'WALLET'
      });
      setError('');
      setAlternatives([]);
      setMessage(`Booking #${booking.id} confirmed and paid successfully. ${booking.protectionMessage || 'Slot reserved with safety buffer.'}`);
      setTimeout(() => navigate('/my-bookings'), 1000);
    } catch (err) {
      setMessage('');
      const errorMessage = err.response?.data?.message || 'Failed to confirm and pay for booking';
      setError(errorMessage);
      if (form.startTime && form.endTime && (errorMessage.toLowerCase().includes('buffer') || errorMessage.toLowerCase().includes('slot'))) {
        try {
          const suggestions = await fetchAlternativeSpaces(id, form.startTime, form.endTime);
          setAlternatives(suggestions);
        } catch {
          setAlternatives([]);
        }
      } else {
        setAlternatives([]);
      }
    }
  };

  return (
    <div className="container py-5">
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card panel-card p-4">
            <h4 className="fw-bold">{space?.name}</h4>
            <div>{currency(space?.pricePerHour)} / hour</div>
            <div>Wallet balance: {currency(wallet?.balance)}</div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card hero-card p-4">
            <h3 className="fw-bold">Book Parking Slot</h3>
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            {alternatives.length > 0 && (
              <div className="alert alert-warning">
                <div className="fw-semibold mb-2">Safety buffer conflict detected. Nearby alternatives:</div>
                <div className="d-grid gap-2">
                  {alternatives.map((alternative) => (
                    <div className="border rounded-3 bg-white p-3" key={alternative.id}>
                      <div className="fw-semibold">{alternative.name}</div>
                      <div className="small">{alternative.address}</div>
                      <div className="small">Available slots: {formatNumber(alternative.availableSlots)}</div>
                      <div className="small">Distance: {alternative.distanceKm ? `${Number(alternative.distanceKm).toFixed(2)} km` : 'N/A'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Vehicle</label>
                <select className="form-select" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required>
                  <option value="">Select vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.vehicleNumber} - {vehicle.brand} {vehicle.model}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Available Slot</label>
                <select className="form-select" value={form.slotId} onChange={(e) => setForm({ ...form, slotId: e.target.value })} required>
                  <option value="">Select slot</option>
                  {slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>{slot.slotNumber} - {slot.slotType} ({slot.status})</option>
                  ))}
                </select>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Start time</label>
                  <input type="datetime-local" className="form-control" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">End time</label>
                  <input type="datetime-local" className="form-control" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
                </div>
              </div>
              <div className="small text-muted mt-3">Every booking reserves a 1 hour safety buffer after the booked end time.</div>
              <button className="btn btn-primary mt-4">Confirm and Pay</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
