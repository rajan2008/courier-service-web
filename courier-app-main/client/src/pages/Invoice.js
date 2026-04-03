import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Invoice = () => {
  const { awb } = useParams();
  const [shipment, setShipment] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/shipments/${awb}`)
      .then(res => setShipment(res.data.shipment))
      .catch(() => alert("Shipment not found"));
  }, [awb]);

  if (!shipment) return <p>Loading...</p>;

  return (
    <div className="p-10 max-w-3xl mx-auto bg-white shadow border rounded text-gray-800">
      <h1 className="text-3xl font-bold mb-4">📄 Shipment Invoice</h1>

      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
        <div>
          <p><strong>AWB:</strong> {shipment.local_awb}</p>
          <p><strong>Courier:</strong> {shipment.courier_name}</p>
          <p><strong>Date:</strong> {shipment.created_at.slice(0, 10)}</p>
          <p><strong>Status:</strong> {shipment.status || "Booked"}</p>
        </div>
        <div>
          <p><strong>Weight:</strong> {shipment.weight} kg</p>
          <p><strong>Price:</strong> ₹{shipment.price}</p>
          <p><strong>Pickup PIN:</strong> {shipment.pickup_pincode}</p>
          <p><strong>Delivery PIN:</strong> {shipment.delivery_pincode}</p>
        </div>
      </div>

      <hr className="my-4" />

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Sender</h2>
          <p>{shipment.sender_name}</p>
          <p>{shipment.sender_address}</p>
          <p>{shipment.sender_phone}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Receiver</h2>
          <p>{shipment.receiver_name}</p>
          <p>{shipment.receiver_address}</p>
          <p>{shipment.receiver_phone}</p>
        </div>
      </div>

      <div className="mt-8">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          🖨️ Print Invoice
        </button>
      </div>
    </div>
  );
};

export default Invoice;
