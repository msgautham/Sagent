import { useEffect, useState } from 'react';
import { createLenderSpace, fetchLenderBookings, fetchLenderSpaces, fetchLenderStats } from '../services/lenderService';
import { currency, dateTimeLocal, formatNumber } from '../utils/formatters';
import { Link } from "react-router-dom";

export default function LenderDashboard() {
  const [stats, setStats] = useState(null);
  const [spaces, setSpaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    address: '',
    pricePerHour: '',
    totalSlots: 5,
    defaultSlotType: 'CAR'
  });

  const loadData = () => {
    Promise.all([fetchLenderStats(), fetchLenderSpaces(), fetchLenderBookings()])
      .then(([statsData, spacesData, bookingsData]) => {
        setStats(statsData);
        setSpaces(spacesData);
        setBookings(bookingsData);
        setError('');
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load lender data');
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitSpace = async (event) => {
    event.preventDefault();
    try {
      await createLenderSpace({
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        pricePerHour: Number(form.pricePerHour),
        totalSlots: Number(form.totalSlots)
      });
      setForm({
        name: '',
        description: '',
        latitude: '',
        longitude: '',
        address: '',
        pricePerHour: '',
        totalSlots: 5,
        defaultSlotType: 'CAR'
      });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create parking space');
    }
  };
 
  return (
    <div className="container py-5">
      <Link className="btn btn-outline-primary" to="/lender/slots">My Slots</Link>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-4 mb-4">
        <div className="col-md-3"><div className="card panel-card p-3"><h6>Total Spaces</h6><div className="fs-3 fw-bold">{formatNumber(stats?.totalSpaces)}</div></div></div>
        <div className="col-md-3"><div className="card panel-card p-3"><h6>Total Bookings</h6><div className="fs-3 fw-bold">{formatNumber(stats?.totalBookings)}</div></div></div>
        <div className="col-md-3"><div className="card panel-card p-3"><h6>Active</h6><div className="fs-3 fw-bold">{formatNumber(stats?.activeBookings)}</div></div></div>
        <div className="col-md-3"><div className="card panel-card p-3"><h6>Revenue</h6><div className="fs-3 fw-bold">{currency(stats?.revenue)}</div></div></div>
      </div>
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card hero-card p-4">
            <h3 className="fw-bold">My Parking Spaces</h3>
            <form className="border rounded-4 p-3 mb-4 bg-white" onSubmit={submitSpace}>
              <div className="fw-semibold mb-3">Add New Parking Space</div>
              <input className="form-control mb-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className="form-control mb-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              <input className="form-control mb-2" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
              <div className="row g-2 mb-2">
                <div className="col-6"><input className="form-control" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} required /></div>
                <div className="col-6"><input className="form-control" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} required /></div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-6"><input className="form-control" placeholder="Price / hour" value={form.pricePerHour} onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })} required /></div>
                <div className="col-6"><input className="form-control" placeholder="Total slots" value={form.totalSlots} onChange={(e) => setForm({ ...form, totalSlots: e.target.value })} required /></div>
              </div>
              <select className="form-select mb-3" value={form.defaultSlotType} onChange={(e) => setForm({ ...form, defaultSlotType: e.target.value })}>
                <option value="CAR">CAR</option>
                <option value="SUV">SUV</option>
                <option value="EV">EV</option>
                <option value="BIKE">BIKE</option>
              </select>
              <button className="btn btn-primary w-100">Submit for Approval</button>
            </form>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="card hero-card p-4">
            <h3 className="fw-bold">Recent Bookings</h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Space</th>
                    <th>Vehicle</th>
                    <th>Start</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.parkingSpaceName}</td>
                      <td>{booking.vehicleNumber}</td>
                      <td>{dateTimeLocal(booking.bookedStartTime)}</td>
                      <td>{booking.bookingStatus}</td>
                      <td>{currency(booking.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
