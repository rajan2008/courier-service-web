import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import BookShipment from './pages/BookShipment';
import Employees from './pages/Employees';
import Shipments from './pages/Shipments';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Signup from './pages/Signup';
import ShipmentDetails from './pages/ShipmentDetails';
import PublicTracking from './pages/PublicTracking';
import Invoice from './pages/Invoice';
import Profile from './pages/Profile';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // If not logged in, redirect to Landing Page, not Login
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/track/:awb" element={<PublicTracking />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="book" element={<BookShipment />} />
          <Route path="shipments" element={<Shipments />} />
          <Route path="shipments/:awb" element={<ShipmentDetails />} />
          <Route path="shipments/:awb/invoice" element={<Invoice />} />
          <Route path="employees" element={<Employees />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
