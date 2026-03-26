import { useEffect, useState } from 'react';
import { checkInBooking, checkOutBooking, extendBooking, fetchMyBookings } from '../services/bookingService';
import { currency, dateTimeLocal } from '../utils/formatters';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [extension, setExtension] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  const loadBookings = async () => {
    try {
      const data = await fetchMyBookings();
      setBookings(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const handleExtend = async (bookingId) => {
    try {
      await extendBooking(bookingId, { requestedEndTime: extension[bookingId] });
      setMessage('Booking extended successfully.');
      setError('');
      loadBookings();
    } catch (err) {
      setMessage('');
      setError(err.response?.data?.message || 'Failed to extend booking');
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      await checkInBooking(bookingId);
      setMessage('Car marked as parked.');
      setError('');
      loadBookings();
    } catch (err) {
      setMessage('');
      setError(err.response?.data?.message || 'Failed to mark car as parked');
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      await checkOutBooking(bookingId);
      setMessage('Car marked as clocked out.');
      setError('');
      loadBookings();
    } catch (err) {
      setMessage('');
      setError(err.response?.data?.message || 'Failed to mark car as clocked out');
    }
  };

  const getParkingState = (booking) => {
    if (booking.actualExitTime || booking.bookingStatus === 'COMPLETED' || booking.bookingStatus === 'OVERSTAY') {
      return 'Clocked Out';
    }
    if (booking.actualEntryTime || booking.bookingStatus === 'ACTIVE') {
      return 'Parked';
    }
    return 'Not Parked';
  };

  const canCheckIn = (booking) => {
    if (booking.bookingStatus !== 'CONFIRMED') {
      return false;
    }
    const now = new Date(currentTime);
    const startTime = new Date(booking.bookedStartTime);
    const bufferEndTime = new Date(booking.bufferEndTime);
    return now >= startTime && now <= bufferEndTime;
  };

  const canCheckOut = (booking) => booking.bookingStatus === 'ACTIVE';

  return (
    <div className="containe py-5">
      <div className="card hero-card p-4">
        <h2 className="fw-bold mb-4">My Bookings</h2>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Code</th>
                <th>Parking</th>
                <th>Vehicle</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>Car State</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>Base</th>
                <th>Late Fee</th>
                <th>Final</th>
                <th>Park / Clock Out</th>
                <th>Extend</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.bookingCode || '-'}</td>
                  <td>{booking.parkingSpaceName}</td>
                  <td>{booking.vehicleNumber}</td>
                  <td>{dateTimeLocal(booking.bookedStartTime)}</td>
                  <td>{dateTimeLocal(booking.bookedEndTime)}</td>
                  <td>{booking.bookingStatus}</td>
                  <td>{getParkingState(booking)}</td>
                  <td>{dateTimeLocal(booking.actualEntryTime)}</td>
                  <td>{dateTimeLocal(booking.actualExitTime)}</td>
                  <td>{currency(booking.totalAmount)}</td>
                  <td>{currency(booking.lateFee)}</td>
                  <td>{currency(booking.finalAmount)}</td>
                  <td>
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleCheckIn(booking.id)}
                        disabled={!canCheckIn(booking)}
                      >
                        Parked
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleCheckOut(booking.id)}
                        disabled={!canCheckOut(booking)}
                      >
                        Clocked Out
                      </button>
                      <div className="small text-muted">
                        Buffer until: {dateTimeLocal(booking.bufferEndTime)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <input
                      type="datetime-local"
                      className="form-control form-control-sm mb-2"
                      value={extension[booking.id] || ''}
                      onChange={(e) => setExtension({ ...extension, [booking.id]: e.target.value })}
                    />
                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleExtend(booking.id)}>
                      Extend
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
