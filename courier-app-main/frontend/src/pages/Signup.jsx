import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../index.css';

const Signup = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'customer',
        courier_name: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/signup', form);
            alert('Signup Successful! Please Login.');
            navigate('/login');
        } catch (err) {
            alert('Signup Failed: ' + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '2rem 0' }}>
            <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Join CourierWithUs</h2>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Create your account to start shipping</p>
                </div>

                <form onSubmit={handleSignup} className="flex-col gap-4">
                    <div className="flex-col gap-1">
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Account Type</label>
                        <select
                            name="role"
                            className="input"
                            value={form.role}
                            onChange={handleChange}
                            required
                            style={{ background: '#f9fafb' }}
                        >
                            <option value="customer">Individual Customer</option>
                            <option value="employee">Driver / Field Employee</option>
                            <option value="courier_admin">Courier Company Admin</option>
                        </select>
                    </div>

                    <div className="flex-col gap-1">
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Full Name</label>
                        <input name="name" placeholder="John Doe" className="input" value={form.name} onChange={handleChange} required />
                    </div>

                    <div className="flex-col gap-1">
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Email Address</label>
                        <input name="email" placeholder="john@example.com" type="email" className="input" value={form.email} onChange={handleChange} required />
                    </div>

                    <div className="flex-col gap-1">
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Phone Number</label>
                        <input name="phone" placeholder="9000000000" className="input" value={form.phone} onChange={handleChange} required />
                    </div>

                    {(form.role === 'courier_admin' || form.role === 'employee') && (
                        <div className="flex-col gap-1 animate-fade-in">
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)' }}>
                                {form.role === 'courier_admin' ? 'Register Company Name' : 'Company You Work For'}
                            </label>
                            <input
                                name="courier_name"
                                placeholder={form.role === 'courier_admin' ? "e.g. Mahavir Courier" : "Enter company name"}
                                className="input"
                                style={{ borderColor: 'var(--accent)' }}
                                value={form.courier_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="flex-col gap-1">
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Password</label>
                        <input name="password" placeholder="••••••••" type="password" className="input" value={form.password} onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}>
                        Create Account
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                        <span className="text-muted">Already have an account? </span>
                        <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Log In</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
