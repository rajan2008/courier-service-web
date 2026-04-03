import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, Truck, Shield, Clock, MapPin, ChevronRight, Search, Star, Globe, Users, Facebook, Twitter, Instagram, CheckCircle } from 'lucide-react';
import '../index.css';

const LandingPage = () => {
    const [awb, setAwb] = useState('');
    const [trackingError, setTrackingError] = useState('');
    const [isTracking, setIsTracking] = useState(false);
    const navigate = useNavigate();

    const handleTrack = async (e) => {
        e.preventDefault();
        setTrackingError('');

        if (!awb.trim()) return;

        setIsTracking(true);
        try {
            await axios.get(`http://localhost:5000/api/shipments/${awb.trim()}`);
            navigate(`/track/${awb.trim()}`);
        } catch (err) {
            setTrackingError("Wrong AWB ID. Please check and re-enter.");
        } finally {
            setIsTracking(false);
        }
    };

    const globeRef = React.useRef(null);
    const rotationRef = React.useRef({ x: 0, y: 50 }); // Initial background position
    const isDraggingRef = React.useRef(false);
    const lastPosRef = React.useRef({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false); // For cursor style only

    const handleMouseDown = (e) => {
        isDraggingRef.current = true;
        setIsDragging(true);
        lastPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        if (isDraggingRef.current) {
            const deltaX = e.clientX - lastPosRef.current.x;

            rotationRef.current.x -= deltaX * 0.15; // Adjust sensitivity
            // Vertical rotation (deltaY) removed as per user request

            if (globeRef.current) {
                globeRef.current.style.backgroundPosition = `${rotationRef.current.x}% ${rotationRef.current.y}%`;
            }

            lastPosRef.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
        setIsDragging(false);
    };

    // keyframes animation via JS for performance
    useEffect(() => {
        let animationFrameId;
        const animate = () => {
            if (!isDraggingRef.current) {
                rotationRef.current.x -= 0.05; // smooth auto-rotation
                if (globeRef.current) {
                    globeRef.current.style.backgroundPosition = `${rotationRef.current.x}% ${rotationRef.current.y}%`;
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    const [activityIndex, setActivityIndex] = useState(0);

    const activityStates = [
        {
            title: "Out for Delivery",
            desc: "Courier will arrive by 2:00 PM",
            image: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=150&q=80",
            bg: "#ecfdf5",
        },
        {
            title: "Package Collected",
            desc: "Picked up from Delhi Hub",
            image: "https://images.unsplash.com/photo-1566576912902-1d52d92ee571?auto=format&fit=crop&w=150&q=80",
            bg: "#eff6ff",
        },
        {
            title: "In Transit",
            desc: "On the way to Mumbai Airport",
            image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=150&q=80",
            bg: "#fffbeb",
        },
        {
            title: "Delivered",
            desc: "Successfully delivered to Rajan",
            image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=150&q=80",
            bg: "#f0fdf4",
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActivityIndex((prev) => (prev + 1) % activityStates.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const currentActivity = activityStates[activityIndex];

    return (
        <div className="animate-fade-in" style={{ background: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Outfit', sans-serif" }}>
            {/* Navbar */}
            <nav className="flex justify-between items-center" style={{
                padding: '1rem 5%',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                height: '70px'
            }}>
                <div className="flex items-center gap-2">
                    <div style={{ background: 'var(--accent)', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
                        <Package size={22} color="white" />
                    </div>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px' }}>CourierWithUs</span>
                </div>
                <div className="flex gap-4 items-center">
                    <Link to="/login" style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Log In</Link>
                    <Link to="/signup" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', borderRadius: '8px' }}>Sign Up</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-section" style={{
                padding: '8rem 5% 4rem',
                background: 'linear-gradient(135deg, #fff5f0 0%, #fff 100%)',
                display: 'flex',
                alignItems: 'center',
                gap: '4rem',
                minHeight: '85vh',
                overflow: 'hidden'
            }}>
                <div style={{ flex: 1.2 }}>
                    <div className="badge" style={{ background: 'rgba(217, 119, 54, 0.1)', color: 'var(--accent)', marginBottom: '1.5rem', display: 'inline-flex', padding: '0.5rem 1rem', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={16} fill="currentColor" /> #1 Courier Service in India
                    </div>
                    <h1 className="hero-h1" style={{ fontSize: '4rem', lineHeight: 1.1, marginBottom: '1.5rem', color: '#1a1a1a', fontWeight: 800 }}>
                        Delivery at the <br />
                        <span style={{ color: 'var(--accent)' }}>Speed of Trust.</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2.5rem', maxWidth: '550px', lineHeight: 1.6 }}>
                        Experience hassle-free logistics with real-time tracking, secure handling, and guaranteed on-time delivery across the globe.
                    </p>

                    {/* Tracking Box */}
                    <div className="tracking-input-box card flex items-center" style={{
                        padding: '0.5rem',
                        maxWidth: '500px',
                        gap: '0.5rem',
                    }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                            <input
                                value={awb}
                                onChange={(e) => setAwb(e.target.value)}
                                placeholder="Enter Tracking AWB..."
                                style={{
                                    width: '100%',
                                    border: 'none',
                                    padding: '1rem 1rem 1rem 3rem',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    background: 'transparent'
                                }}
                            />
                        </div>
                        <button onClick={handleTrack} className="btn btn-primary" style={{ padding: '0.75rem 2rem', height: '100%' }} disabled={isTracking}>{isTracking ? 'Checking...' : 'Track'}</button>
                    </div>
                    {trackingError && (
                        <p className="animate-fade-in" style={{ color: '#ef4444', marginTop: '0.75rem', marginLeft: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                            {trackingError}
                        </p>
                    )}

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', color: '#888', fontSize: '0.9rem' }}>
                        <div className="flex items-center gap-2"><CheckCircle size={16} color="var(--success)" /> 24/7 Support</div>
                        <div className="flex items-center gap-2"><CheckCircle size={16} color="var(--success)" /> Live Tracking</div>
                        <div className="flex items-center gap-2"><CheckCircle size={16} color="var(--success)" /> Insured</div>
                    </div>
                </div>

                {/* Hero Illustration */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    {/* Global Network Visual */}
                    <div className="globe-container" style={{
                        position: 'relative',
                        width: '100%',
                        height: '650px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        perspective: '1000px',
                        transform: 'scale(0.8)'
                    }}>
                        {/* Outer Orbit Ring */}
                        <div className="animate-spin-slow" style={{
                            width: '600px',
                            height: '600px',
                            borderRadius: '50%',
                            border: '1px dashed #cbd5e1',
                            position: 'absolute',
                            zIndex: 0,
                            animation: 'spin 20s linear infinite'
                        }}></div>

                        {/* Inner Orbit Ring */}
                        <div style={{
                            width: '500px',
                            height: '500px',
                            borderRadius: '50%',
                            border: '1px solid #e2e8f0',
                            position: 'absolute',
                            zIndex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}></div>

                        {/* Central Globe Container - User Interactive */}
                        <div
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={() => setIsDragging(false)}
                            style={{
                                width: '420px',
                                height: '420px',
                                borderRadius: '50%',
                                position: 'relative',
                                zIndex: 2,
                                boxShadow: '0 0 50px -10px rgba(59, 130, 246, 0.6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                background: '#0f172a',
                                cursor: isDragging ? 'grabbing' : 'grab',
                                userSelect: 'none'
                            }}>
                            {/* Interactive 3D Earth Div */}
                            <div ref={globeRef} style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                backgroundColor: '#1e3a8a',
                                backgroundImage: "url('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg')",
                                backgroundSize: 'auto 125%', // Ensure vertical coverage
                                transform: 'rotate(-15deg)',
                                boxShadow: 'inset 20px 0 50px 6px rgba(0,0,0,0.9), inset -4px 0 10px 4px rgba(255,255,255,0.2)',
                                transition: isDragging ? 'none' : 'background-position 0.1s linear'
                            }}></div>

                            {/* Optional: Extra Gloss Overlay */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                                borderRadius: '50%',
                                zIndex: 4,
                                pointerEvents: 'none'
                            }}></div>
                        </div>

                        {/* Floating Badge 1 (Top Right) */}
                        <div className="animate-bounce" style={{
                            position: 'absolute',
                            top: '15%',
                            right: '5%',
                            background: 'white',
                            padding: '0.75rem 1.25rem',
                            borderRadius: '16px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            zIndex: 3,
                            animationDuration: '4s',
                            border: '1px solid #f1f5f9'
                        }}>
                            <div style={{ background: '#fee2e2', padding: '0.4rem', borderRadius: '50%' }}>
                                <MapPin size={20} color="#ef4444" />
                            </div>
                            <div>
                                <span style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>Live Tracking</span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Real-time Updates</span>
                            </div>
                        </div>

                        {/* Floating Badge 2 (Bottom Left) */}
                        <div className="animate-bounce" style={{
                            position: 'absolute',
                            bottom: '15%',
                            left: '5%',
                            background: 'white',
                            padding: '0.75rem 1.25rem',
                            borderRadius: '16px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            zIndex: 3,
                            animationDuration: '5s',
                            animationDelay: '1s',
                            border: '1px solid #f1f5f9'
                        }}>
                            <div style={{ background: '#ecfdf5', padding: '0.4rem', borderRadius: '50%' }}>
                                <Shield size={20} color="#10b981" />
                            </div>
                            <div>
                                <span style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>Secure Shipping</span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>100% Insured</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Section */}
            <section style={{ padding: '4rem 5%', background: 'white' }}>
                <div className="grid stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
                    <StatItem value="10M+" label="Packages Delivered" />
                    <StatItem value="25K+" label="Happy Customers" />
                    <StatItem value="150+" label="Countries Covered" />
                    <StatItem value="99.9%" label="On-Time Delivery" />
                </div>
            </section>

            {/* How It Works */}
            <section style={{ padding: '6rem 5%', background: '#fafafa' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>How It Works</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Simple steps to get your package moving.</p>
                </div>

                <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
                    <StepCard num="01" title="Book Order" desc="Enter details & schedule a pickup instantly." />
                    <StepCard num="02" title="Pack It" desc="Our executive picks up the package from your door." />
                    <StepCard num="03" title="Track It" desc="Monitor location in real-time." />
                    <StepCard num="04" title="Delivered" desc="Safe delivery to the destination." />
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '4rem 5%', background: '#111827', color: 'white' }}>
                <div className="grid" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '4rem', marginBottom: '3rem' }}>
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div style={{ background: 'var(--accent)', padding: '0.3rem', borderRadius: '6px' }}>
                                <Package size={20} color="white" />
                            </div>
                            <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>CourierWithUs</span>
                        </div>
                        <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>Making logistics simple, fast, and reliable for businesses and individuals worldwide.</p>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '1.5rem' }}>Company</h4>
                        <ul style={{ listStyle: 'none', color: '#9ca3af', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li>About Us</li>
                            <li>Careers</li>
                            <li>Press</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '1.5rem' }}>Support</h4>
                        <ul style={{ listStyle: 'none', color: '#9ca3af', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li>Help Center</li>
                            <li>Terms of Service</li>
                            <li>Privacy Policy</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '1.5rem' }}>Get in Touch</h4>
                        <div className="flex gap-4">
                            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', cursor: 'pointer' }}>
                                <Instagram size={20} />
                            </div>
                            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', cursor: 'pointer' }}>
                                <Twitter size={20} />
                            </div>
                            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', cursor: 'pointer' }}>
                                <Facebook size={20} />
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
                    &copy; 2026 CourierWithUs. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

const StatItem = ({ value, label }) => (
    <div>
        <h3 style={{ fontSize: '3rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>{value}</h3>
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{label}</p>
    </div>
);

const StepCard = ({ num, title, desc }) => (
    <div style={{ position: 'relative', padding: '2rem', background: 'white', borderRadius: '16px', border: '1px solid #eee' }}>
        <span style={{ fontSize: '4rem', fontWeight: 900, color: '#f3f4f6', position: 'absolute', top: '10px', right: '20px', lineHeight: 1 }}>{num}</span>
        <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem', position: 'relative' }}>{title}</h4>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, position: 'relative' }}>{desc}</p>
    </div>
);



export default LandingPage;
