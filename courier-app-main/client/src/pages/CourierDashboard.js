import React, { useEffect, useState } from "react";
import axios from "axios";

const CourierDashboard = () => {
  const [shipments, setShipments] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/shipments/courier/my-shipments", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setShipments(res.data);
      } catch (err) {
        console.error("Failed to fetch shipments", err);
      }
    };

    fetchShipments();
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">📦 Courier Owner Dashboard</h1>
      <p className="mt-2 text-gray-700">These are your branch’s shipments:</p>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">AWB</th>
              <th className="border p-2">Pickup</th>
              <th className="border p-2">Delivery</th>
              <th className="border p-2">Weight</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Customer</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {shipments.length > 0 ? (
              shipments.map((s) => (
                <tr key={s.id}>
                  <td className="border p-2">{s.local_awb}</td>
                  <td className="border p-2">{s.pickup_pincode}</td>
                  <td className="border p-2">{s.delivery_pincode}</td>
                  <td className="border p-2">{s.weight} kg</td>
                  <td className="border p-2">₹{s.price}</td>
                  <td className="border p-2">{s.sender_name}</td>
                  <td className="border p-2">{s.status || "Pending"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No shipments found for your courier.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourierDashboard;
