import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import '../index.css';

const VerifyOtp = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // State passed from Signup page
    const userId = state?.userId;
    const email = state?.email;

    if (!userId) {
        return (
            <div className="flex justify-center items-center h-screen bg-bg-main text-text-main" style={{ background: 'var(--bg-main)', color: 'var(--text-main)' }}>
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Invalid Access</h2>
                    <button onClick={() => navigate('/signup')} className="btn btn-primary">Go to Signup</button>
                </div>
            </div>
        );
    }

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await axios.post('http://localhost:5000/api/auth/verify-otp', { userId, otp });
            setMessage('Email Verified Successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Verification Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
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
                textAlign: 'center'
            }}>
                <button
                    onClick={() => navigate('/signup')}
                    style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                    <ArrowLeft size={20} />
                </button>

                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ background: 'rgba(217, 119, 54, 0.2)', padding: '1rem', borderRadius: '50%' }}>
                        <CheckCircle size={32} color="var(--accent)" />
                    </div>
                </div>

                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Verify Email</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                    We've sent a 6-digit code to <br /> <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{email}</span>
                </p>

                <form onSubmit={handleVerify} className="flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="input"
                        style={{
                            textAlign: 'center',
                            fontSize: '1.5rem',
                            letterSpacing: '0.5rem',
                            background: 'var(--input-bg)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-main)',
                            height: '60px'
                        }}
                        required
                    />

                    {error && <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</p>}
                    {message && <p style={{ color: '#10b981', fontSize: '0.9rem' }}>{message}</p>}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.8rem', marginTop: '1rem', fontSize: '1rem' }}
                        disabled={loading || otp.length !== 6}
                    >
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                    Didn't receive code? Check spam folder.
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;
