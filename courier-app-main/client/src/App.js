import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Signup from './pages/Auth/Signup';
import Login from './pages/Auth/Login';
import BookShipment from './pages/BookShipment';
import TrackShipment from './pages/TrackShipment';
import AllShipments from './pages/AllShipments';
import MyShipments from './pages/MyShipments';
import Invoice from './pages/Invoice';
import CourierDashboard from "./pages/CourierDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ResetPassword from "./pages/Auth/ResetPassword";

const App = () => {
  let user;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }


  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  return (
    <Router>
      <nav>
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
            <Link to="/track">Track</Link>
          </>
        )}
        {isAdmin && (
          <>
            <Link to="/">Book</Link>
            <Link to="/track">Track</Link>
            <Link to="/all">All Shipments</Link>
            <button onClick={() => { localStorage.clear(); window.location.href = '/'; }}>Logout</button>
          </>
        )}
        {isCustomer && (
          <>
            <Link to="/">Book</Link>
            <Link to="/track">Track</Link>
            <Link to="/my">My Shipments</Link>
            <button onClick={() => { localStorage.clear(); window.location.href = '/'; }}>Logout</button>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/track" element={<TrackShipment />} />
        <Route path="/invoice/:awb" element={<Invoice />} />
        <Route path="/courier-dashboard" element={<CourierDashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/" element={
          isAdmin || isCustomer
            ? <BookShipment />
            : <Navigate to="/track" />
        } />
        <Route path="/all" element={
          isAdmin
            ? <AllShipments />
            : <Navigate to="/login" />
        } />
        <Route path="/my" element={
          isCustomer
            ? <MyShipments />
            : <Navigate to="/login" />
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
