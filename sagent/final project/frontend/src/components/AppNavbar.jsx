import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHomeRouteForRole } from '../utils/roleRoutes';

export default function AppNavbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg brand-gradient navbar-dark shadow-sm">
      <div className="container py-2">
        <Link className="navbar-brand fw-bold" to={isAuthenticated ? getHomeRouteForRole(user.role) : '/'}>
          Parking Marketplace
        </Link>
        <div className="navbar-nav ms-auto gap-2 align-items-center">
          {!isAuthenticated && <Link className="nav-link" to="/login">Login</Link>}
          {!isAuthenticated && <Link className="nav-link" to="/register">Register</Link>}
          {isAuthenticated && user.role === 'ADMIN' && <Link className="nav-link" to="/admin">Admin Dashboard</Link>}
          {isAuthenticated && user.role === 'PARKING_SPACE_LENDER' && <Link className="nav-link" to="/lender">Lender Dashboard</Link>}
          {isAuthenticated && user.role === 'PARKING_SPACE_BUYER' && <Link className="nav-link" to="/dashboard">Dashboard</Link>}
          {isAuthenticated && user.role === 'PARKING_SPACE_BUYER' && <Link className="nav-link" to="/map-search">Map Search</Link>}
          {isAuthenticated && user.role === 'PARKING_SPACE_BUYER' && <Link className="nav-link" to="/my-bookings">My Bookings</Link>}
          {isAuthenticated && user.role === 'PARKING_SPACE_BUYER' && <Link className="nav-link" to="/my-vehicles">My Vehicles</Link>}
          {isAuthenticated && <span className="navbar-text small">{user.name} ({user.role})</span>}
          {isAuthenticated && <button className="btn btn-sm btn-light" onClick={handleLogout}>Logout</button>}
        </div>
      </div>
    </nav>
  );
}
