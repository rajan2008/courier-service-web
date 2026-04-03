import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../index.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            alert('Login Failed: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div style={{
            background: 'var(--bg-main)',
            position: 'relative',
            padding: '0 1.5rem',
            overflow: 'hidden',
            color: 'var(--text-main)',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* Decorative Background Elements */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(217, 119, 54, 0.1) 0%, transparent 70%)', filter: 'blur(50px)' }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(217, 119, 54, 0.1) 0%, transparent 70%)', filter: 'blur(50px)' }}></div>

            <div className="card animate-fade-in" style={{
                width: '100%',
                maxWidth: '420px',
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
                        Welcome <span style={{ color: 'var(--accent)' }}>Back</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Securely log in to your dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="flex-col gap-5">
                    <div className="flex-col gap-2">
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '0.25rem' }}>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            className="input"
                            style={{ background: 'var(--input-bg)', borderColor: 'var(--border)', color: 'var(--text-main)' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex-col gap-2">
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '0.25rem' }}>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="input"
                            style={{ background: 'var(--input-bg)', borderColor: 'var(--border)', color: 'var(--text-main)' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div style={{ textAlign: 'right', marginTop: '0.25rem' }}>
                            <span
                                onClick={() => navigate('/forgot-password')}
                                style={{ color: 'var(--accent)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, textDecoration: 'none' }}
                                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                            >
                                Forgot Password?
                            </span>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '1rem', fontSize: '1rem', fontWeight: 700, borderRadius: '12px' }}>
                        Log In
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            New here? <span onClick={() => navigate('/signup')} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Create an account</span>
                        </p>
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
            `}} />
        </div>
    );
};

export default Login;
