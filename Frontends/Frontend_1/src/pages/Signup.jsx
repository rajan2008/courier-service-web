import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setForm({ ...form, [name]: numericValue });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/signup', form);
            // navigate to verification page with user ID and email
            navigate('/verify-otp', { state: { userId: res.data.userId, email: res.data.email } });
        } catch (err) {
            alert('Signup Failed: ' + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div style={{
            background: 'var(--bg-main)',
            position: 'relative',
            padding: '2rem 1.5rem',
            overflowX: 'hidden',
            color: 'var(--text-main)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* Decorative Background Elements */}
            <div style={{ position: 'absolute', top: '-5%', right: '-5%', width: '35%', height: '35%', background: 'radial-gradient(circle, rgba(217, 119, 54, 0.1) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
            <div style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: '35%', height: '35%', background: 'radial-gradient(circle, rgba(217, 119, 54, 0.1) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>

            <div className="card animate-fade-in" style={{
                width: '100%',
                maxWidth: '500px',
                padding: '3rem 2.5rem',
                position: 'relative',
                background: 'var(--surface)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)'
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'var(--glass)', border: 'none', cursor: 'pointer', color: 'var(--text-main)', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Back to Landing Page"
                >
                    <ArrowLeft size={18} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                        Join the <span style={{ color: 'var(--accent)' }}>Network</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create your account to start shipping today</p>
                </div>

                <form onSubmit={handleSignup} className="flex-col gap-5">

                    {/* Account Type Selector */}
                    <div className="flex-col gap-3">
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginLeft: '0.25rem' }}>I am joining as a:</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div
                                onClick={() => setForm({ ...form, role: 'customer' })}
                                className={`role-card ${form.role === 'customer' ? 'active' : ''}`}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: '1px solid',
                                    borderColor: form.role === 'customer' ? 'var(--accent)' : 'var(--border)',
                                    background: form.role === 'customer' ? 'var(--glass)' : 'var(--input-bg)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'center',
                                    color: form.role === 'customer' ? 'var(--accent)' : 'var(--text-muted)'
                                }}
                            >
                                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Individual</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Customer</div>
                            </div>
                            <div
                                onClick={() => setForm({ ...form, role: 'employee' })}
                                className={`role-card ${form.role === 'employee' ? 'active' : ''}`}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: '1px solid',
                                    borderColor: form.role === 'employee' ? 'var(--accent)' : 'var(--border)',
                                    background: form.role === 'employee' ? 'var(--glass)' : 'var(--input-bg)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'center',
                                    color: form.role === 'employee' ? 'var(--accent)' : 'var(--text-muted)'
                                }}
                            >
                                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Courier Partner</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Driver / Staff</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-col gap-2">
                        <label className="input-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '0.25rem' }}>Full Name</label>
                        <input name="name" placeholder="John Doe" className="input" style={{ background: 'var(--input-bg)', borderColor: 'var(--border)', color: 'var(--text-main)' }} value={form.name} onChange={handleChange} required />
                    </div>

                    <div className="flex-col gap-2">
                        <label className="input-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '0.25rem' }}>Email Address</label>
                        <input name="email" placeholder="john@example.com" type="email" className="input" style={{ background: 'var(--input-bg)', borderColor: 'var(--border)', color: 'var(--text-main)' }} value={form.email} onChange={handleChange} required />
                    </div>

                    <div className="flex-col gap-2">
                        <label className="input-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '0.25rem' }}>Phone Number</label>
                        <input name="phone" placeholder="9999999999" className="input" style={{ background: 'var(--input-bg)', borderColor: 'var(--border)', color: 'var(--text-main)' }} value={form.phone} onChange={handleChange} required />
                    </div>

                    {form.role === 'employee' && (
                        <div className="flex-col gap-2 animate-fade-in">
                            <label className="input-label" style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, marginLeft: '0.25rem' }}>Company Working For</label>
                            <input
                                name="courier_name"
                                list="couriers-list"
                                placeholder="Select or type company name..."
                                className="input"
                                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--accent)', color: '#fff' }}
                                value={form.courier_name}
                                onChange={handleChange}
                                required
                            />
                            <datalist id="couriers-list">
                                {['Blue Dart', 'Delhivery', 'DTDC', 'FedEx', 'Gati', 'Smartr Logistics', 'Ecom Express', 'Shadowfax', 'Xpressbees', 'Mahavir Courier', 'Anjani Courier', 'Trackon', 'Professional Couriers'].map(c => (
                                    <option key={c} value={c} />
                                ))}
                            </datalist>
                        </div>
                    )}

                    <div className="flex-col gap-2">
                        <label className="input-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '0.25rem' }}>Password</label>
                        <input name="password" placeholder="*********" type="password" className="input" style={{ background: 'var(--input-bg)', borderColor: 'var(--border)', color: 'var(--text-main)' }} value={form.password} onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1rem', fontWeight: 700, borderRadius: '12px' }}>
                        Create Account
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
                        <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Log In</Link>
                    </div>
                </form>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .input:focus {
                    background: rgba(255,255,255,0.08) !important;
                    border-color: var(--accent) !important;
                    box-shadow: 0 0 0 4px rgba(217, 119, 54, 0.1);
                }
                .role-card:hover {
                    background: rgba(255,255,255,0.08) !important;
                }
                .role-card.active:hover {
                    background: rgba(217, 119, 54, 0.2) !important;
                }
            `}} />
        </div>
    );
};

export default Signup;
