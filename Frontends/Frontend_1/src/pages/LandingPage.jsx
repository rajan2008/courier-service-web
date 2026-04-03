import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Package, Truck, Shield, Clock, MapPin, ChevronRight, Search, Star, Globe, Users,
    Facebook, Twitter, Instagram, CheckCircle, Smartphone, Award, Headset, Zap,
    ArrowRight, Mail, Phone, ExternalLink, Menu, X, PlayCircle, Lock, Layout, BarChart,
    Moon, Sun
} from 'lucide-react';
import '../index.css';

const ParticleNetwork = ({ theme }) => {
    const canvasRef = React.useRef(null);
    const mouseRef = React.useRef({ x: undefined, y: undefined, radius: 150 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particlesArray = [];
        const colorBase = theme === 'dark' ? '249, 115, 22' : '59, 130, 246'; // Orange / Blue

        class Particle {
            constructor(x, y, dx, dy, size) {
                this.x = x; this.y = y; this.dx = dx; this.dy = dy; this.size = size;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${colorBase}, 0.6)`;
                ctx.fill();
            }
            update() {
                if(this.x > canvas.width || this.x < 0) this.dx = -this.dx;
                if(this.y > canvas.height || this.y < 0) this.dy = -this.dy;
                
                let dx = mouseRef.current.x - this.x;
                let dy = mouseRef.current.y - this.y;
                let distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < mouseRef.current.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouseRef.current.radius - distance) / mouseRef.current.radius;
                    // Dodge the cursor
                    this.x -= forceDirectionX * force * 5;
                    this.y -= forceDirectionY * force * 5;
                }

                this.x += this.dx;
                this.y += this.dy;
                this.draw();
            }
        }

        const init = () => {
            particlesArray = [];
            let noOfParticles = (canvas.width * canvas.height) / 10000;
            for(let i=0; i<noOfParticles; i++) {
                let size = (Math.random() * 2) + 1;
                let x = Math.random() * (canvas.width - size * 2) + size * 2;
                let y = Math.random() * (canvas.height - size * 2) + size * 2;
                let dx = (Math.random() - 0.5) * 1.5;
                let dy = (Math.random() - 0.5) * 1.5;
                particlesArray.push(new Particle(x, y, dx, dy, size));
            }
        };

        const connect = () => {
            for(let a=0; a<particlesArray.length; a++){
                for(let b=a; b<particlesArray.length; b++){
                    let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
                                 + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                    if(distance < (canvas.width/8) * (canvas.height/8)) {
                        let opacity = 1 - (distance / 20000);
                        ctx.strokeStyle = `rgba(${colorBase}, ${opacity * 0.3})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        let animationId;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            ctx.clearRect(0,0,innerWidth, innerHeight);
            for(let i=0; i<particlesArray.length; i++) {
                particlesArray[i].update();
            }
            connect();
        }

        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; init(); };
        window.addEventListener('resize', resize);
        
        const mouseMove = (e) => { mouseRef.current.x = e.x; mouseRef.current.y = e.y; };
        const mouseOut = () => { mouseRef.current.x = undefined; mouseRef.current.y = undefined; };
        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('mouseout', mouseOut);

        init();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', mouseMove);
            window.removeEventListener('mouseout', mouseOut);
            cancelAnimationFrame(animationId);
        }
    }, [theme]);

    return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />;
};

const LandingPage = () => {
    const [awb, setAwb] = useState('');
    const [trackingError, setTrackingError] = useState('');
    const [isTracking, setIsTracking] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const navigate = useNavigate();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

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
    const cloudsRef = React.useRef(null);
    const rotationRef = React.useRef({ x: 0, y: 50, cloudsX: 0 });
    const isDraggingRef = React.useRef(false);
    const lastPosRef = React.useRef({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e) => {
        isDraggingRef.current = true;
        setIsDragging(true);
        lastPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        if (isDraggingRef.current) {
            const deltaX = e.clientX - lastPosRef.current.x;
            rotationRef.current.x -= deltaX * 0.15;
            rotationRef.current.cloudsX -= deltaX * 0.18; // Clouds move slightly faster

            if (globeRef.current) {
                globeRef.current.style.backgroundPosition = `${rotationRef.current.x}% ${rotationRef.current.y}%`;
            }
            if (cloudsRef.current) {
                cloudsRef.current.style.backgroundPosition = `${rotationRef.current.cloudsX}% ${rotationRef.current.y}%`;
            }
            lastPosRef.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
        setIsDragging(false);
    };

    useEffect(() => {
        let animationFrameId;
        const animate = () => {
            if (!isDraggingRef.current) {
                rotationRef.current.x -= 0.05;
                rotationRef.current.cloudsX -= 0.07; // Clouds drift faster naturally

                if (globeRef.current) {
                    globeRef.current.style.backgroundPosition = `${rotationRef.current.x}% ${rotationRef.current.y}%`;
                }
                if (cloudsRef.current) {
                    cloudsRef.current.style.backgroundPosition = `${rotationRef.current.cloudsX}% ${rotationRef.current.y}%`;
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-container" style={{
            background: 'var(--bg-main)',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Outfit', sans-serif",
            color: 'var(--text-main)',
            overflowX: 'hidden'
        }}>
            <ParticleNetwork theme={theme} />
            {/* Navbar */}
            <nav style={{
                padding: scrolled ? '0.75rem 5%' : '1.5rem 5%',
                background: scrolled ? 'var(--surface)' : 'transparent',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
                transition: 'all 0.3s ease',
                display: 'flex',
                justifyContent: 'between',
                alignItems: 'center'
            }}>
                <div className="flex justify-between items-center w-full">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="Shipique" style={{ height: scrolled ? '45px' : '65px', width: 'auto', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="desktop-only flex gap-12 items-center">
                        <div className="flex gap-8 items-center">
                            <a href="#services" className="nav-link">Services</a>
                            <a href="#why-us" className="nav-link">About</a>
                            <a href="#tracking" className="nav-link">Tracking</a>
                            <a href="#faq" className="nav-link">FAQ</a>
                        </div>
                        <div style={{ width: '1px', height: '20px', background: 'var(--border)' }}></div>
                        <div className="flex gap-6 items-center">
                            {/* Theme Toggle Button */}
                            <button onClick={toggleTheme} className="theme-toggle-btn" style={{
                                background: 'var(--glass)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-main)',
                                padding: '0.6rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            <Link to="/login" style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>Log In</Link>
                            <Link to="/signup" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', borderRadius: '14px', fontWeight: 600, fontSize: '0.95rem' }}>Get Started</Link>
                        </div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="mobile-only" style={{ background: 'transparent', border: 'none', color: 'var(--text-main)' }}>
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="mobile-menu" style={{
                        position: 'fixed',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'var(--surface)',
                        padding: '2rem',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        zIndex: 999,
                        animation: 'fadeInDown 0.3s ease'
                    }}>
                        <a href="#services" onClick={() => setIsMenuOpen(false)}>Services</a>
                        <a href="#why-us" onClick={() => setIsMenuOpen(false)}>About</a>
                        <a href="#tracking" onClick={() => setIsMenuOpen(false)}>Tracking</a>
                        <div className="flex items-center justify-between">
                            <Link to="/login">Log In</Link>
                            <button onClick={toggleTheme} style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '10px', color: 'var(--text-main)' }}>
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                        </div>
                        <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <header className="hero-section" style={{
                padding: '10rem 5% 6rem',
                background: theme === 'dark'
                    ? 'radial-gradient(circle at 70% 30%, rgba(217, 119, 54, 0.15) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
                    : 'radial-gradient(circle at 70% 30%, rgba(217, 119, 54, 0.05) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '4rem',
                minHeight: '100vh',
                position: 'relative'
            }}>
                <div style={{ flex: 1.2, zIndex: 10 }}>
                    <div className="badge-premium animate-fade-in" style={{
                        background: 'rgba(217, 119, 54, 0.1)',
                        color: 'var(--accent)',
                        marginBottom: '1.5rem',
                        display: 'inline-flex',
                        padding: '0.6rem 1.2rem',
                        alignItems: 'center',
                        gap: '0.6rem',
                        border: '1px solid rgba(217, 119, 54, 0.3)',
                        borderRadius: '100px',
                        fontSize: '0.9rem',
                        fontWeight: 600
                    }}>
                        <Award size={18} /> Global Excellence in Logistics 2026
                    </div>
                    <h1 className="hero-h1 animate-fade-in" style={{ fontSize: '4.5rem', lineHeight: 1, marginBottom: '2rem', color: 'var(--text-main)', fontWeight: 800 }}>
                        Deliver Your World <br />
                        <span style={{
                            background: 'linear-gradient(to right, var(--accent), #f97316)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            display: 'inline-block'
                        }}>Faster Than Light</span>
                    </h1>
                    <p className="animate-fade-in" style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px', lineHeight: 1.7 }}>
                        Shipique reimagines global logistics with AI-powered routing, absolute transparency, and a commitment to speed that moves your business forward.
                    </p>

                    <div className="flex gap-4 animate-fade-in" style={{ marginBottom: '3rem' }}>
                        <Link to="/signup" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '14px', display: 'flex', gap: '0.5rem' }}>
                            Start Shipping <ChevronRight size={20} />
                        </Link>
                        <button className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '14px', display: 'flex', gap: '0.5rem' }}>
                            <PlayCircle size={20} /> Watch Demo
                        </button>
                    </div>

                    <div className="flex gap-8 items-center animate-fade-in" style={{ opacity: 0.8 }}>
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(idx => (
                                <img key={idx} src={`https://i.pravatar.cc/100?u=${idx}`} alt="user" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--bg-main)' }} />
                            ))}
                        </div>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>25k+</span> businesses trust Shipique
                        </p>
                    </div>
                </div>

                <div className="desktop-only" style={{ flex: 1, position: 'relative' }}>
                    <div className="globe-visual-container">
                        <div className="orbit-ring orbit-1"></div>
                        <div className="orbit-ring orbit-2"></div>
                        <div className="central-globe"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={() => setIsDragging(false)}
                        >
                            <div ref={globeRef} className="globe-sphere" style={{ filter: theme === 'light' ? 'brightness(1.2) contrast(0.8)' : 'none' }}></div>
                            <div ref={cloudsRef} className="globe-clouds"></div>
                            <div className="globe-overlay"></div>
                        </div>

                        <div className="floating-card top-right animate-float">
                            <Zap size={20} color="var(--accent)" />
                            <div>
                                <strong>Express Delivery</strong>
                                <span>Under 24 Hours</span>
                            </div>
                        </div>
                        <div className="floating-card bottom-left animate-float-delayed">
                            <Shield size={20} color="#10b981" />
                            <div>
                                <strong>Secure Ops</strong>
                                <span>End-to-End Encrypted</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tracking Section */}
            <section id="tracking" className="tracking-section" style={{ padding: '6rem 5%', background: 'var(--bg-main)', position: 'relative', overflow: 'hidden' }}>
                <div className="glass-card" style={{
                    maxWidth: '1000px',
                    margin: '0 auto',
                    padding: '4rem',
                    borderRadius: 'var(--radius-xl)',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow)'
                }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Track Your Momentum</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>Enter your tracking number below to see exactly where your happiness is right now.</p>

                    <form onSubmit={handleTrack} style={{
                        display: 'flex',
                        gap: '1rem',
                        maxWidth: '700px',
                        margin: '0 auto',
                        background: 'var(--glass)',
                        padding: '0.8rem',
                        borderRadius: '20px',
                        border: '1px solid var(--border)'
                    }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Search size={22} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                value={awb}
                                onChange={(e) => setAwb(e.target.value)}
                                placeholder="Enter AWB Tracking ID..."
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    border: 'none',
                                    padding: '1.2rem 1.2rem 1.2rem 4rem',
                                    color: 'var(--text-main)',
                                    fontSize: '1.1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={isTracking} style={{ padding: '0 3rem', borderRadius: '14px', fontSize: '1.1rem' }}>
                            {isTracking ? 'Searching...' : 'Track Package'}
                        </button>
                    </form>
                    {trackingError && <p style={{ color: 'var(--danger)', marginTop: '1.5rem', fontWeight: 500 }}>{trackingError}</p>}
                </div>
            </section>

            {/* Stats Grid */}
            <section style={{ padding: '4rem 5%', background: 'var(--bg-main)' }}>
                <div className="grid grid-cols-4" style={{ gap: '2rem' }}>
                    <StatItem value="150+" label="Countries Reached" icon={<Globe size={24} />} />
                    <StatItem value="2M+" label="Active Deliveries" icon={<Package size={24} />} />
                    <StatItem value="98%" label="Customer Satisfaction" icon={<Users size={24} />} />
                    <StatItem value="24/7" label="Global Support" icon={<Headset size={24} />} />
                </div>
            </section>

            {/* Services Section */}
            <section id="services" style={{ padding: '8rem 5%', background: 'var(--surface)' }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem' }}>Our Expertise</span>
                    <h2 style={{ fontSize: '3rem', marginTop: '1rem', color: 'var(--text-main)' }}>Tailored Logistics Solutions</h2>
                </div>

                <div className="grid grid-cols-3" style={{ gap: '2.5rem' }}>
                    <ServiceCard
                        icon={<Truck size={32} />}
                        title="Express Ground"
                        desc="Advanced road logistics for regional and national distributions with guaranteed timelines."
                        features={['Doorstep Pickup', 'Real-time Tracking', 'Same Day Delivery']}
                    />
                    <ServiceCard
                        icon={<Globe size={32} />}
                        title="Global Air Freight"
                        desc="Connected to 150+ countries with optimized routes and customs management handled for you."
                        features={['International Express', 'Customs Support', 'Transit Insurance']}
                    />
                    <ServiceCard
                        icon={<Smartphone size={32} />}
                        title="Hyperlocal Delivery"
                        desc="Flash deliveries within cities powered by our dense network of urban couriers."
                        features={['60 Min Delivery', 'Cash on Delivery', 'Secure Handling']}
                    />
                    <ServiceCard
                        icon={<Shield size={32} />}
                        title="Secure Fragile Care"
                        desc="Specialized handling for sensitive, high-value, or electronics with multi-layer protection."
                        features={['Special Packaging', 'Careful Transit', 'Damage Claims']}
                    />
                    <ServiceCard
                        icon={<BarChart size={32} />}
                        title="E-commerce Fullfillment"
                        desc="End-to-end warehousing and distribution services for online businesses of all sizes."
                        features={['Inventory Sync', 'Returns Ops', 'Bulk Shipping']}
                    />
                    <ServiceCard
                        icon={<Users size={32} />}
                        title="Corporate Solutions"
                        desc="Customized logistics workflows and dedicated account managers for enterprise needs."
                        features={['Volume Discounts', 'API Integration', 'Dedicated Manager']}
                    />
                </div>
            </section>

            {/* Why Choose Us */}
            <section id="why-us" style={{ padding: '8rem 5%', background: 'var(--bg-main)' }}>
                <div className="flex gap-12 items-center" style={{ flexDirection: window.innerWidth < 1024 ? 'column' : 'row' }}>
                    <div style={{ flex: 1 }}>
                        <img
                            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
                            alt="Logistics center"
                            style={{ width: '100%', borderRadius: '40px', boxShadow: 'var(--shadow)' }}
                        />
                    </div>
                    <div style={{ flex: 1.2 }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem' }}>WHY CHOOSE SHIPIQUE</span>
                        <h2 style={{ fontSize: '3.5rem', margin: '1rem 0 2rem', color: 'var(--text-main)' }}>Logistics Performance <br />That Scales With You</h2>
                        <div className="flex flex-col gap-8">
                            <FeatureItem
                                title="AI-Driven Optimization"
                                desc="We use sophisticated algorithms to calculate the fastest and most fuel-efficient routes in real-time."
                                icon={<Zap color="var(--accent)" />}
                            />
                            <FeatureItem
                                title="Zero-Compromise Security"
                                desc="Each package is insured and monitored 24/7. Our facilities use biometrics and advanced surveillance."
                                icon={<Lock color="var(--success)" />}
                            />
                            <FeatureItem
                                title="Seamless Integration"
                                desc="Our API fits perfectly into your Shopify, WooCommerce, or custom ERP system with just a few lines of code."
                                icon={<Layout color="var(--info)" />}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section style={{ padding: '8rem 5%', background: 'var(--surface)' }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <h2 style={{ fontSize: '3rem', color: 'var(--text-main)' }}>Trusted by Industry Leaders</h2>
                </div>
                <div className="grid grid-cols-3" style={{ gap: '2rem' }}>
                    <TestimonialCard
                        name="Sarah Jenkins"
                        role="CEO at UrbanTrends"
                        img="https://i.pravatar.cc/150?u=sarah"
                        quote="Shipique transformed our delivery times. We saw a 40% increase in customer satisfaction scores within three months of switching."
                    />
                    <TestimonialCard
                        name="Michael Chen"
                        role="Operations Head, TechFlow"
                        img="https://i.pravatar.cc/150?u=michael"
                        quote="The dashboard and live tracking are light years ahead of the competition. Incredible reliability and support."
                    />
                    <TestimonialCard
                        name="Amara Rodriguez"
                        role="Founder of Bloom & Co"
                        img="https://i.pravatar.cc/150?u=amara"
                        quote="As a small business, we needed a partner that could grow with us. Shipique's volume pricing and ease of use are unbeatable."
                    />
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" style={{ padding: '8rem 5%', background: 'var(--bg-main)' }}>
                <div className="grid grid-cols-2" style={{ gap: '5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '3rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>Can't find what you're looking for? Reach out to our 24/7 support team.</p>
                        <button className="btn btn-primary" style={{ padding: '1rem 2rem' }}>Contact Support</button>
                    </div>
                    <div className="flex flex-col gap-4">
                        <FaqItem question="How do I track my package internationally?" answer="You can use your AWB number in our global tracking portal. We provide end-to-end visibility even when packages switch between regional carriers." />
                        <FaqItem question="What items are restricted for shipping?" answer="Restricted items include hazardous materials, flammable liquids, and certain perishables. Please check our full restricted items guide for details." />
                        <FaqItem question="Do you offer insurance for high-value items?" answer="Yes, all shipments come with basic coverage. For high-value goods, we offer Premium Shields which cover up to $50,000 per shipment." />
                        <FaqItem question="How fast is the 'Hyperlocal' delivery?" answer="Hyperlocal delivery is designed for intra-city transit and typically takes between 60 to 120 minutes depending on distance and traffic." />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '10rem 5% 6rem' }}>
                <div style={{
                    background: 'var(--surface)',
                    borderRadius: '50px',
                    padding: '8rem 4rem',
                    textAlign: 'center',
                    border: '1px solid var(--border)',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow)'
                }}>
                    <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, var(--accent) 0%, transparent 60%)', pointerEvents: 'none', opacity: 0.1 }}></div>
                    <h2 style={{ fontSize: '4rem', color: 'var(--text-main)', marginBottom: '2rem', fontWeight: 800 }}>Ready to move your business?</h2>
                    <p style={{ fontSize: '1.4rem', color: 'var(--text-muted)', marginBottom: '4rem', maxWidth: '800px', margin: '0 auto 4rem' }}>Join thousands of businesses that trust Shipique for their mission-critical logistics.</p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/signup" className="btn btn-primary" style={{ padding: '1.2rem 3.5rem', fontSize: '1.2rem', borderRadius: '16px' }}>Create Free Account</Link>
                        <button className="btn btn-outline" style={{ padding: '1.2rem 3.5rem', fontSize: '1.2rem', borderRadius: '16px' }}>Talk to Sales</button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '6rem 5%', background: 'var(--bg-main)', borderTop: '1px solid var(--border)' }}>
                <div className="grid grid-cols-4" style={{ gap: '4rem', marginBottom: '6rem' }}>
                    <div className="col-span-1">
                        <img src="/logo.png" alt="Shipique" style={{ height: '60px', marginBottom: '2rem' }} />
                        <p style={{ color: 'var(--text-muted)', maxWidth: '350px', lineHeight: 1.8, marginBottom: '2.5rem' }}>
                            Pioneering the future of global logistics through technology, transparency, and a relentless focus on customer experience.
                        </p>
                        <div className="flex gap-4">
                            <SocialLink icon={<Facebook size={18} />} />
                            <SocialLink icon={<Twitter size={18} />} />
                            <SocialLink icon={<Instagram size={18} />} />
                            <Mail size={18} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} />
                        </div>
                    </div>
                    <div>
                        <h4 style={{ color: 'var(--text-main)', marginBottom: '2rem', fontSize: '1.1rem' }}>Services</h4>
                        <ul className="footer-links">
                            <li><a href="#">Express Ground</a></li>
                            <li><a href="#">Air Freight</a></li>
                            <li><a href="#">Sea Freight</a></li>
                            <li><a href="#">Warehousing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ color: 'var(--text-main)', marginBottom: '2rem', fontSize: '1.1rem' }}>Support</h4>
                        <ul className="footer-links">
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Safety Docs</a></li>
                            <li><a href="#">Track Order</a></li>
                            <li><a href="#">Locations</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ color: 'var(--text-main)', marginBottom: '2rem', fontSize: '1.1rem' }}>Legal</h4>
                        <ul className="footer-links">
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms of Use</a></li>
                            <li><a href="#">Insurance</a></li>
                            <li><a href="#">Cookies</a></li>
                        </ul>
                    </div>
                </div>
                <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border)', paddingTop: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <p>&copy; 2026 Shipique Logistics Global. All rights reserved.</p>
                    <div className="flex gap-8">
                        <span>Built with ❤️ for Global Trade</span>
                        <div className="flex items-center gap-2">
                            <Globe size={14} /> English (US)
                        </div>
                    </div>
                </div>
            </footer>

            {/* Global Styles */}
            <style>{`
                .nav-link { 
                    color: var(--text-muted); 
                    font-weight: 500; 
                    transition: color 0.3s;
                    text-decoration: none;
                }
                .nav-link:hover { color: var(--text-main); }
                
                .globe-visual-container {
                    position: relative;
                    width: 100%;
                    height: 600px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .orbit-ring {
                    position: absolute;
                    border: 1px dashed var(--border);
                    border-radius: 50%;
                }
                .orbit-1 { width: 550px; height: 550px; animation: spin 40s linear infinite; }
                .orbit-2 { width: 450px; height: 450px; animation: spin 60s reverse linear infinite; }
                
                .central-globe {
                    width: 420px;
                    height: 420px;
                    border-radius: 50%;
                    background: #040812;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 
                        0 0 80px -10px var(--accent),
                        inset 0 0 50px rgba(0,0,0,1);
                    cursor: grab;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .central-globe:active { cursor: grabbing; }

                .globe-sphere {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background-image: url('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
                    background-size: 210% 100%;
                    background-repeat: repeat-x;
                    border-radius: 50%;
                    box-shadow: 
                        inset 30px 0 60px rgba(0,0,0,0.9),
                        inset -30px 0 60px rgba(0,0,0,0.4),
                        inset 0 0 100px rgba(0,0,0,0.5);
                    z-index: 1;
                    transform: rotate(-12deg) scale(1.1); /* Subtle opposite tilt */
                }

                /* Clouds layer for depth */
                .globe-clouds {
                    position: absolute;
                    width: 105%;
                    height: 105%;
                    background-image: url('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_2048.jpg');
                    background-size: 210% 100%;
                    background-repeat: repeat-x;
                    border-radius: 50%;
                    opacity: 0.4;
                    mix-blend-mode: screen;
                    pointer-events: none;
                    z-index: 2;
                    transform: rotate(-12deg) scale(1.1); /* Match subtle tilt */
                }

                .globe-overlay {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.15) 0%, transparent 50%),
                                radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%);
                    pointer-events: none;
                    z-index: 3;
                    border-radius: 50%;
                }
                
                .floating-card {
                    position: absolute;
                    background: var(--surface);
                    backdrop-filter: blur(10px);
                    padding: 1rem 1.5rem;
                    border-radius: 20px;
                    border: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    box-shadow: var(--shadow);
                }
                .floating-card.top-right { top: 10%; right: 5%; }
                .floating-card.bottom-left { bottom: 10%; left: 5%; }
                .floating-card div { display: flex; flex-direction: column; }
                .floating-card strong { color: var(--text-main); font-size: 0.9rem; }
                .floating-card span { color: var(--text-muted); font-size: 0.75rem; }

                .footer-links { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 1rem; }
                .footer-links a { color: var(--text-muted); text-decoration: none; transition: color 0.3s; }
                .footer-links a:hover { color: var(--accent); }

                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes float { 
                    0% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                    100% { transform: translateY(0); }
                }
                .animate-float { animation: float 5s ease-in-out infinite; }
                .animate-float-delayed { animation: float 6s ease-in-out 1s infinite; }
                
                @media (max-width: 768px) {
                    .hero-h1 { font-size: 3rem !important; }
                    .grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

const StatItem = ({ value, label, icon }) => (
    <div style={{ padding: '2.5rem', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
        <div style={{ color: 'var(--accent)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
        <h3 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: 700 }}>{value}</h3>
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{label}</p>
    </div>
);

const ServiceCard = ({ icon, title, desc, features }) => (
    <div className="card-service" style={{
        padding: '3rem',
        background: 'var(--surface)',
        borderRadius: '30px',
        border: '1px solid var(--border)',
        transition: 'all 0.3s ease',
        boxShadow: 'var(--shadow)'
    }}>
        <div style={{ color: 'var(--accent)', marginBottom: '2rem' }}>{icon}</div>
        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>{desc}</p>
        <div className="flex flex-col gap-3">
            {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2" style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    <CheckCircle size={16} color="var(--success)" /> {f}
                </div>
            ))}
        </div>
    </div>
);

const FeatureItem = ({ title, desc, icon }) => (
    <div className="flex gap-6">
        <div style={{ padding: '1rem', background: 'var(--glass)', borderRadius: '20px', height: 'fit-content', border: '1px solid var(--border)' }}>
            {icon}
        </div>
        <div>
            <h4 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{title}</h4>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
        </div>
    </div>
);

const TestimonialCard = ({ name, role, img, quote }) => (
    <div style={{ padding: '3rem', background: 'var(--surface)', borderRadius: '30px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <div className="flex gap-1" style={{ color: 'var(--warning)', marginBottom: '1.5rem' }}>
            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
        </div>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', lineHeight: 1.7, marginBottom: '2.5rem', fontStyle: 'italic' }}>"{quote}"</p>
        <div className="flex items-center gap-4">
            <img src={img} alt={name} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
            <div>
                <h5 style={{ color: 'var(--text-main)', fontWeight: 600 }}>{name}</h5>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{role}</p>
            </div>
        </div>
    </div>
);

const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div style={{ background: 'var(--surface)', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', marginBottom: '1rem' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{ width: '100%', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
                <span style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1.1rem' }}>{question}</span>
                <ChevronRight size={20} style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.3s' }} />
            </button>
            {isOpen && (
                <div style={{ padding: '0 2rem 2rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {answer}
                </div>
            )}
        </div>
    );
};

const SocialLink = ({ icon }) => (
    <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: 'var(--glass)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all 0.3s'
    }}>
        {icon}
    </div>
);

export default LandingPage;
