import React, { useState } from "react";
import axios from "axios";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer", // default
    phone: "",
    courier_owner: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
    courier_name: ""
  });

  const [generatedId, setGeneratedId] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", form);
      alert("Signup successful!");
      console.log(res.data);

      // Redirect to login after successful signup
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "Signup failed";
      alert(errorMsg);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md p-6 rounded w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">🚀 Sign Up</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          {/* Phone */}
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          {/* Role Selection */}
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="customer">Customer</option>
            <option value="courier_admin">Courier Owner</option>
            <option value="employee">Delivery Boy</option>
          </select>

          {/* Courier Admin Fields */}
          {form.role === "courier_admin" && (
            <div className="space-y-2">
              <input
                type="text"
                name="courier_name"
                placeholder="Courier Name (e.g. Mahavir, Amazon)"
                value={form.courier_name}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={form.state}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="text"
                name="district"
                placeholder="District"
                value={form.district}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={form.pincode}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
          )}

          {/* Submit */}
          <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Sign Up
          </button>
        </form>

        {/* Show generated login_id */}
        {generatedId && (
          <div className="mt-4 p-3 border border-green-600 bg-green-50 rounded text-center">
            <p className="text-green-700 font-bold">
              🎉 Your Courier Owner Login ID: {generatedId}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
