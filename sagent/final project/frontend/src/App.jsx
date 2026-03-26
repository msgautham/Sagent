import { Navigate, Route, Routes } from 'react-router-dom';
import AppNavbar from './components/AppNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import BookingPage from './pages/BookingPage';
import Dashboard from './pages/Dashboard';
import LenderDashboard from './pages/LenderDashboard';
import LenderSlots from './pages/lenderSlots';
import LoginPage from './pages/LoginPage';
import MapSearchPage from './pages/MapSearchPage';
import MyBookingsPage from './pages/MyBookingsPage';
import MyVehiclesPage from './pages/MyVehiclesPage';
import ParkingDetailsPage from './pages/ParkingDetailsPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
    <div className="app-shell">
      <AppNavbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute roles={['PARKING_SPACE_BUYER']}><Dashboard /></ProtectedRoute>} />
        <Route path="/map-search" element={<ProtectedRoute roles={['PARKING_SPACE_BUYER']}><MapSearchPage /></ProtectedRoute>} />
        <Route path="/parking/:id" element={<ProtectedRoute roles={['PARKING_SPACE_BUYER']}><ParkingDetailsPage /></ProtectedRoute>} />
        <Route path="/booking/:id" element={<ProtectedRoute roles={['PARKING_SPACE_BUYER']}><BookingPage /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute roles={['PARKING_SPACE_BUYER']}><MyBookingsPage /></ProtectedRoute>} />
        <Route path="/my-vehicles" element={<ProtectedRoute roles={['PARKING_SPACE_BUYER']}><MyVehiclesPage /></ProtectedRoute>} />
        <Route path="/lender" element={<ProtectedRoute roles={['PARKING_SPACE_LENDER']}><LenderDashboard /></ProtectedRoute>} />
        <Route path="/lender/slots" element={<ProtectedRoute roles={['PARKING_SPACE_LENDER']}><LenderSlots /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}
