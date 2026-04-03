import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const TrackShipment = () => {
  const [awb, setAwb] = useState("");
  const [shipment, setShipment] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`http://localhost:5000/api/shipments/${awb}`);
      setShipment(res.data.shipment);
    } catch (err) {
      alert("Shipment not found");
      setShipment(null);
    }
  };

  return (
    <div>

      {!user && (
        <div style={{ marginBottom: "1rem" }}>
          <p>Want to book a shipment?</p>
          <Link to="/login"><button>Log In</button></Link>{" "}
          <Link to="/signup"><button>Sign Up</button></Link>
        </div>
      )}
      <h2>Track Shipment</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Enter AWB number"
          value={awb}
          onChange={(e) => setAwb(e.target.value)}
        />
        <button type="submit">Track</button>
      </form>

      {shipment && (
        <div>
          <h3>Shipment Found:</h3>
          <div className="text-sm">
            <p><strong>Courier:</strong> {shipment.courier_name}</p>
            <p><strong>From:</strong> {shipment.pickup_pincode}</p>
            <p><strong>To:</strong> {shipment.delivery_pincode}</p>
            <p><strong>Sender:</strong> {shipment.sender_name} ({shipment.sender_phone})</p>
            <p><strong>Receiver:</strong> {shipment.receiver_name} ({shipment.receiver_phone})</p>
            <p><strong>Weight:</strong> {shipment.weight} kg</p>
            <p><strong>Price:</strong> ₹{shipment.price}</p>
            <p><strong>Status:</strong> {shipment.status || "Booked"}</p>
            <p><strong>Date:</strong> {shipment.created_at?.slice(0, 10)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackShipment;
