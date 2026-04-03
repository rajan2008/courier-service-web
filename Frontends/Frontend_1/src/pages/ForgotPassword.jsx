import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import '../index.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [resetToken, setResetToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setMessage('OTP sent to your email.');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/verify-reset-otp', { email, otp });
            setResetToken(res.data.resetToken);
            setMessage('OTP verified. Set new password.');
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post('http://localhost:5000/api/auth/reset-password', { resetToken, newPassword });
            alert('Password successfully reset! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-main)',
            padding: '2rem'
        }}>
            <div className="card animate-fade-in" style={{
                maxWidth: '400px',
                width: '100%',
                padding: '2.5rem',
                background: 'var(--surface)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                position: 'relative'
            }}>
                <button
                    onClick={() => navigate('/login')}
                    style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                    <ArrowLeft size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                        {step === 1 ? 'Reset Password' : step === 2 ? 'Verify Email' : 'New Password'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {step === 1 ? 'Enter your email to receive an OTP' : step === 2 ? `Enter OTP sent to ${email}` : 'Create a secure password'}
                    </p>
                </div>

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="flex-col gap-4">
                        <div className="flex-col gap-2">
                            <label className="input-label">Email Address</label>
                            <div className="flex items-center gap-2" style={{ background: 'var(--input-bg)', borderRadius: '8px', padding: '0 10px', border: '1px solid var(--border)' }}>
                                <Mail size={18} color="var(--text-muted)" />
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    className="input"
                                    style={{ border: 'none', paddingLeft: '5px', background: 'transparent' }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.8rem' }}>
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="input"
                            style={{ textAlign: 'center', letterSpacing: '5px', fontSize: '1.2rem' }}
                            required
                        />
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.8rem' }}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="flex-col gap-4">
                        <div className="flex-col gap-2">
                            <label className="input-label">New Password</label>
                            <input
                                type="password"
                                placeholder="Min 8 characters"
                                className="input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.8rem' }}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
            </div>
        </div>
    );
};

export default ForgotPassword;
