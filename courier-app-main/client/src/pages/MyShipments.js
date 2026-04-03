import React, { useEffect, useState } from "react";
import axios from "axios";

const MyShipments = () => {
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios.get("http://localhost:5000/api/shipments/mine", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setShipments(res.data.shipments))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>📦 My Shipments</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>AWB</th>
            <th>Courier</th>
            <th>From</th>
            <th>To</th>
            <th>Weight</th>
            <th>Price</th>
            <th>Status</th>
            <th>Created</th>
            <th>Sender</th>
            <th>Receiver</th>
            <th>INVOICE</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map(s => (
            <tr key={s.local_awb}>
              <td>{s.local_awb}</td>
              <td>{s.courier_name}</td>
              <td>{s.pickup_pincode}</td>
              <td>{s.delivery_pincode}</td>
              <td>{s.weight} kg</td>
              <td>₹{s.price}</td>
              <td>{s.status}</td>
              <td>{s.created_at.slice(0, 10)}</td>
              <td>
                <div>{s.sender_name}</div>
                <div className="text-sm text-gray-500">{s.sender_phone}</div>
              </td>
              <td>
                <div>{s.receiver_name}</div>
                <div className="text-sm text-gray-500">{s.receiver_phone}</div>
              </td>
              <td>
                <a href={`/invoice/${s.local_awb}`} target="_blank" rel="noopener noreferrer">
                  <button className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">
                    View Invoice
                  </button>
                </a>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyShipments;
