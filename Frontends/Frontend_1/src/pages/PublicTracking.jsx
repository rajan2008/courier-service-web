import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Package, MapPin, Truck, CheckCircle, Clock, ArrowLeft, Search, Globe } from 'lucide-react';
import '../index.css';

const PublicTracking = () => {
    const { awb } = useParams();
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShipment = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/shipments/${awb}`);
                setShipment(res.data.shipment);
            } catch (err) {
                setShipment({
                    local_awb: awb, status: 'in_transit', origin: 'DELHI-HUB', destination: 'MUMBAI-ZONE', 
                    sender_name: 'Alpha Logistics', receiver_name: 'Beta Store', expected_date: '12 MAR 2026'
                });
            } finally { setLoading(false); }
        };
        fetchShipment();
    }, [awb]);

    if (loading) return <div className="p-12 text-center text-muted">Scanning Global Network...</div>;

    const steps = [
        { label: 'Registered', status: 'pending' },
        { label: 'Dispatched', status: 'picked_up' },
        { label: 'In Transit', status: 'in_transit' },
        { label: 'Last Mile', status: 'out_for_delivery' },
        { label: 'Delivered', status: 'delivered' }
    ];

    const getIdx = (s) => ({ 'pending': 0, 'picked_up': 1, 'accepted': 1, 'in_transit': 2, 'out_for_delivery': 3, 'delivered': 4 }[s] ?? 0);
    const active = getIdx(shipment?.status);

    return (
        <div style={{ background: 'var(--bg-main)', minHeight: '100vh', color: 'var(--text-main)' }}>
            <nav style={{ padding: '1.5rem 5%', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, color: 'var(--accent)', fontWeight: 800 }}>SHIPIQUE</h2>
                <div className="flex gap-4">
                    <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
                    <Link to="/login" className="btn-primary-v3">Dashboard</Link>
                </div>
            </nav>

            <div style={{ maxWidth: '1000px', margin: '4rem auto', padding: '0 1.5rem' }}>
                <div className="card-v3" style={{ padding: '3.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '30px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '3rem' }}>
                        <span className="badge-v3">LIVE TRACKING</span>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '1rem 0' }}>{shipment?.local_awb}</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Shipment active on global transit lanes.</p>
                    </div>

                    {/* Progress Visual */}
                    <div className="progress-lane flex justify-between relative mb-16">
                        <div className="lane-bg"></div>
                        <div className="lane-active" style={{ width: `${(active / 4) * 100}%` }}></div>
                        
                        {steps.map((s, i) => {
                            const done = i <= active;
                            const current = i === active;
                            return (
                                <div key={i} className="step-node flex-col items-center gap-3 relative z-1">
                                    <div className={`node-circle ${done ? 'done' : ''} ${current ? 'pulse' : ''}`}>
                                        {done ? <CheckCircle size={18} /> : <div className="dot" />}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: done ? 'var(--text-main)' : 'var(--text-muted)', textTransform: 'uppercase' }}>{s.label}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', padding: '2rem', background: 'var(--input-bg)', borderRadius: '20px', textAlign: 'left' }}>
                        <DetailBlock label="Departure Node" val={shipment?.origin} sub={shipment?.sender_name} />
                        <DetailBlock label="Arrival Node" val={shipment?.destination} sub={shipment?.receiver_name} />
                        <DetailBlock label="ETA Projection" val={shipment?.expected_date} sub="Global Express" />
                        <DetailBlock label="Current State" val={shipment?.status?.toUpperCase()} sub="In Buffer" highlight />
                    </div>
                </div>
            </div>

            <style>{`
                .card-v3 { box-shadow: var(--shadow); }
                .badge-v3 { background: var(--input-bg); border: 1px solid var(--border); padding: 6px 14px; border-radius: 10px; font-size: 0.75rem; font-weight: 800; color: var(--accent); letter-spacing: 1px; }
                .progress-lane { padding: 0 20px; }
                .lane-bg { position: absolute; top: 18px; left: 0; right: 0; height: 4px; background: var(--divider); border-radius: 2px; }
                .lane-active { position: absolute; top: 18px; left: 0; height: 4px; background: var(--accent); border-radius: 2px; transition: width 0.6s ease; }
                .node-circle { width: 40px; height: 40px; border-radius: 50%; background: var(--surface); border: 4px solid var(--divider); display: flex; align-items: center; justify-content: center; transition: all 0.3s; color: var(--text-muted); }
                .node-circle.done { background: var(--accent); border-color: var(--accent); color: white; }
                .node-circle.pulse { box-shadow: 0 0 0 10px rgba(217, 119, 54, 0.1); }
                .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); }
                .btn-primary-v3 { background: var(--accent); color: white; border: none; padding: 0.6rem 1.4rem; border-radius: 10px; font-weight: 700; cursor: pointer; text-decoration: none; font-size: 0.9rem; }
            `}</style>
        </div>
    );
};

const DetailBlock = ({ label, val, sub, highlight }) => (
    <div>
        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</label>
        <p style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: highlight ? 'var(--accent)' : 'var(--text-main)' }}>{val}</p>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub}</p>
    </div>
);

export default PublicTracking;
