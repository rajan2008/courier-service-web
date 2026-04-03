import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Login successful!");
      window.location.href = "/"; // redirect after login
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "Login failed!";
      alert(errorMsg);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email: resetEmail,
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage("Error sending reset email.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-96">
        {!forgotMode ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Login
              </button>
            </form>

            <p
              onClick={() => setForgotMode(true)}
              className="text-blue-600 mt-4 text-sm cursor-pointer text-center"
            >
              Forgot Password?
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your registered email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Send Reset Link
              </button>
            </form>

            {message && (
              <p className="text-sm mt-3 text-center text-gray-700">{message}</p>
            )}

            <p
              onClick={() => setForgotMode(false)}
              className="text-blue-600 mt-4 text-sm cursor-pointer text-center"
            >
              Back to Login
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
