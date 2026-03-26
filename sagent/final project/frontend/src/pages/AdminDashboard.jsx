import { useEffect, useState } from 'react';
import { approveSpace, blockUser, fetchAdminBookings, fetchAdminStats, fetchAdminUsers, fetchPendingSpaces } from '../services/adminService';
import { currency, formatNumber } from '../utils/formatters';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pendingSpaces, setPendingSpaces] = useState([]);

  const loadData = async () => {
    const [statsData, usersData, bookingsData, pendingSpacesData] = await Promise.all([
      fetchAdminStats(),
      fetchAdminUsers(),
      fetchAdminBookings(),
      fetchPendingSpaces()
    ]);
    setStats(statsData);
    setUsers(usersData);
    setBookings(bookingsData);
    setPendingSpaces(pendingSpacesData);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="container py-5">
      <div className="row g-4 mb-4">
        <div className="col-md-4"><div className="card panel-card p-3"><h6>Total Spaces</h6><div className="fs-3 fw-bold">{formatNumber(stats?.totalSpaces)}</div></div></div>
        <div className="col-md-4"><div className="card panel-card p-3"><h6>Total Bookings</h6><div className="fs-3 fw-bold">{formatNumber(stats?.totalBookings)}</div></div></div>
        <div className="col-md-4"><div className="card panel-card p-3"><h6>Revenue</h6><div className="fs-3 fw-bold">{currency(stats?.revenue)}</div></div></div>
      </div>
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card hero-card p-4">
            <h3 className="fw-bold">Users</h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.role}</td>
                      <td>{user.email}</td>
                      <td><button className="btn btn-sm btn-outline-danger" onClick={() => blockUser(user.id).then(loadData)}>Block</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card hero-card p-4">
            <h3 className="fw-bold">Bookings</h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Parking</th>
                    <th>Vehicle</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.parkingSpaceName}</td>
                      <td>{booking.vehicleNumber}</td>
                      <td>{booking.bookingStatus}</td>
                      <td>{currency(booking.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <h5>Pending Spaces</h5>
              <div className="d-grid gap-2">
                {pendingSpaces.map((space) => (
                  <div className="border rounded-4 p-3 bg-white d-flex justify-content-between align-items-center" key={space.id}>
                    <div>
                      <div className="fw-semibold">{space.name}</div>
                      <div className="small text-muted">{space.address}</div>
                    </div>
                    <button className="btn btn-outline-primary" onClick={() => approveSpace(space.id).then(loadData)}>Approve</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
