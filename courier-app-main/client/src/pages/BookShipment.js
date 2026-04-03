import React, { useState, useEffect } from "react";
import axios from "axios";
import MapPicker from "../components/MapPicker";

const BookShipment = () => {
  const [form, setForm] = useState({
    partner_awb: "",
    courier_owner: "",
    pickup_pincode: "",
    delivery_pincode: "",
    weight: "",
    price: "",

    sender_name: "",
    sender_address: "",
    sender_phone: "",

    receiver_name: "",
    receiver_address: "",
    receiver_phone: "",
  });

  const [courierOptions, setCourierOptions] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";
  const isCustomer = user?.role === "customer";

useEffect(() => {
  const delayFetch = setTimeout(() => {
    if (
      form.weight &&
      form.pickup_pincode &&
      form.delivery_pincode
    ) {
      fetchPricing();
    }
  }, 300);

  return () => clearTimeout(delayFetch);
}, [form.weight, form.pickup_pincode, form.delivery_pincode]);


  const detectCourier = (awb) => {
    if (awb.startsWith("DEL")) return "Delhivery";
    if (awb.startsWith("MAH")) return "Mahavir";
    if (awb.startsWith("AMZ")) return "Amazon";
    if (awb.startsWith("XPR")) return "Xpressbees";
    return "";
  };

  const handleChange = (e) => {
  const { name, value } = e.target;
  setForm(prev => ({
    ...prev,
    [name]: value
  }));
};

  const fetchPricing = async () => {
    if (!form.weight || !form.pickup_pincode || !form.delivery_pincode) return;

    console.log('Fetching pricing for:', {
      pickup: form.pickup_pincode,
      delivery: form.delivery_pincode,
      weight: form.weight
    });

    try {
      const res = await axios.get("http://localhost:5000/api/shipments/pricing", {
        params: {
          pickup: form.pickup_pincode,
          delivery: form.delivery_pincode,
          weight: form.weight,
        },
      });

      console.log('Pricing response:', res.data);
      setCourierOptions(res.data.options);
    } catch (err) {
      console.error("Price fetch failed", err);
      console.error("Error response:", err.response?.data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post("http://localhost:5000/api/shipments", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Shipment booked!");
      console.log(res.data);
      setForm({
        partner_awb: "",
        courier_owner: "",
        pickup_pincode: "",
        delivery_pincode: "",
        weight: "",
        price: "",

        sender_name: "",
        sender_address: "",
        sender_phone: "",

        receiver_name: "",
        receiver_address: "",
        receiver_phone: "",
      });
    } catch (err) {
      console.error("Booking error:", err);
      const errorMsg = err.response?.data?.error || "Booking failed";
      alert(errorMsg);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">📦 Book Shipment</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        {/* Admin-only: Partner AWB + Courier Detection */}
        {isAdmin && (
          <div>
            <label>Partner AWB</label>
            <input
              name="partner_awb"
              value={form.partner_awb}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
            {form.courier_owner && (
              <p className="text-sm text-green-600 mt-1">
                Courier Detected: <strong>{form.courier_owner}</strong>
              </p>
            )}
          </div>
        )}

        {/* Pincodes */}
        <div className="grid grid-cols-2 gap-4">
          <input
            name="pickup_pincode"
            placeholder="Pickup PIN"
            value={form.pickup_pincode}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            name="delivery_pincode"
            placeholder="Delivery PIN"
            value={form.delivery_pincode}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
        </div>

        {/* Admin = manual price | Customer = price selection */}
        {isAdmin && (
          <div className="grid grid-cols-2 gap-4">
            <input
              name="weight"
              placeholder="Weight (kg)"
              value={form.weight}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              name="price"
              placeholder="Price (₹)"
              value={form.price}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
          </div>
        )}

        {isCustomer && (
          <div className="grid grid-cols-2 gap-4">
            <input
              name="weight"
              placeholder="Weight (kg)"
              value={form.weight}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
          </div>
        )}

        {isCustomer && courierOptions.length > 0 && (
          <div>
            <p className="font-semibold mt-4">Choose a Courier:</p>
            <div className="grid grid-cols-1 gap-2">
              {courierOptions.map((opt) => (
                <label
                  key={opt.courier}
                  className="border p-2 rounded cursor-pointer flex justify-between items-center hover:bg-gray-100"
                >
                  <input
                    type="radio"
                    name="courier"
                    value={opt.courier}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        courier_owner: opt.courier,
                        price: opt.price,
                      }))
                    }
                    checked={form.courier_owner === opt.courier}
                  />
                  <span>
                    {opt.courier} - ₹{opt.price}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Sender Info */}
        <h3 className="text-lg font-semibold mt-4">Sender Info</h3>
        <input
          name="sender_name"
          placeholder="Sender Name"
          value={form.sender_name}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        {/* Map Picker */}
        <MapPicker
          onSelect={({ address, pincode }) => {
            setForm((prev) => ({
              ...prev,
              sender_address: address,
              pickup_pincode: pincode,
            }));
          }}
        />

        <input
          name="sender_address"
          placeholder="Sender Address"
          value={form.sender_address}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          name="sender_phone"
          placeholder="Sender Phone"
          value={form.sender_phone}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        {/* Receiver Info */}
        <h3 className="text-lg font-semibold mt-4">Receiver Info</h3>
        <input
          name="receiver_name"
          placeholder="Receiver Name"
          value={form.receiver_name}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          name="receiver_address"
          placeholder="Receiver Address"
          value={form.receiver_address}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          name="receiver_phone"
          placeholder="Receiver Phone"
          value={form.receiver_phone}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <button className="bg-blue-600 text-white py-2 px-4 mt-4 rounded hover:bg-blue-700">
          Book Shipment
        </button>
      </form>
    </div>
  );
};

export default BookShipment;
