import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, MapPin, Truck, CheckCircle, Clock, ArrowLeft, User, Phone, Download, Globe } from 'lucide-react';
import '../index.css';

const ShipmentDetails = () => {
    const { awb } = useParams();
    const navigate = useNavigate();
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [drivers, setDrivers] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin' || user.role === 'courier_admin';
    const isDriver = user.role === 'employee';
    const canUpdateStatus = isAdmin || isDriver;

    useEffect(() => {
        if (isAdmin) {
            const fetchDrivers = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get('http://localhost:5000/api/users', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const validDrivers = res.data.filter(u => u.role === 'employee' &&
                        (user.role === 'admin' || (u.courier_owner === user.courier_owner))
                    );
                    setDrivers(validDrivers);
                } catch (err) {}
            };
            fetchDrivers();
        }
    }, [isAdmin, user.role, user.courier_owner]);

    useEffect(() => {
        const fetchShipment = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/shipments/${awb}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setShipment(res.data.shipment);
            } catch (err) {
            } finally { setLoading(false); }
        };
        fetchShipment();
    }, [awb]);

    if (loading) return <div className="p-12 text-center" style={{ color: 'var(--text-muted)' }}>Synchonizing Data...</div>;
    if (!shipment) return <div className="p-12 text-center" style={{ color: 'var(--text-muted)' }}>Shipment Not Found</div>;

    const steps = [
        { key: 'pending', label: 'Registered', sub: 'Hub assigned', icon: Clock },
        { key: 'accepted', label: 'Dispatched', sub: 'In sorting center', icon: Package },
        { key: 'in_transit', label: 'Transit', sub: 'Cross-border movement', icon: Globe },
        { key: 'out_for_delivery', label: 'Out for Delivery', sub: 'Last-mile link active', icon: Truck },
        { key: 'delivered', label: 'Arrived', sub: 'Drop-off confirmed', icon: CheckCircle },
    ];

    const currentStepIndex = (status) => {
        const map = { 'pending': 0, 'accepted': 1, 'picked_up': 1, 'in_transit': 2, 'out_for_delivery': 3, 'delivered': 4 };
        return map[status] ?? 0;
    };
    const activeStep = currentStepIndex(shipment.status);

    return (
        <div className="animate-fade-in" style={{ color: 'var(--text-main)', paddingBottom: '4rem' }}>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-8 bg-none border-none cursor-pointer" style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.9rem', padding: 0, background: 'none' }}>
                <ArrowLeft size={18} /> BACK TO FLEET
            </button>

            <div className="detail-layout">
                <main className="detail-main flex-col gap-6">
                    {/* Header Summary */}
                    <div className="card-v3 summary-card flex justify-between items-center bg-surface">
                        <div>
                            <span className="badge-v3">#{shipment.local_awb}</span>
                            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '14px 0 0 0' }}>{shipment.receiver_city || 'VADODARA-NODE'}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Deployment ID: {shipment.id}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>₹{shipment.price}</p>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{shipment.weight} KG • AIR FREIGHT</span>
                        </div>
                    </div>

                    {/* Operational Panel */}
                    {canUpdateStatus && (
                        <div className="card-v3 op-panel flex-col gap-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>OPERATIONAL CONTROL</h4>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Update logistics state across the network.</p>
                                </div>
                                <select className="input-v3 select-control" value={shipment.status} onChange={async (e) => {
                                    try {
                                        const token = localStorage.getItem('token');
                                        await axios.patch(`http://localhost:5000/api/shipments/${shipment.local_awb}/status`, { status: e.target.value }, { headers: { Authorization: `Bearer ${token}` } });
                                        setShipment({...shipment, status: e.target.value});
                                    } catch (err) {}
                                }}>
                                    <option value="pending">PENDING</option>
                                    <option value="accepted">ACCEPTED</option>
                                    <option value="in_transit">IN TRANSIT</option>
                                    <option value="out_for_delivery">OUT FOR DELIVERY</option>
                                    <option value="delivered">DELIVERED</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Address Grid */}
                    <div className="card-v3 address-grid">
                        <section className="address-block">
                            <h4 className="flex items-center gap-2 text-muted" style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px' }}>
                                <MapPin size={14} /> ORIGIN NODE
                            </h4>
                            <p style={{ fontWeight: 800, fontSize: '1.1rem', margin: '14px 0 8px 0' }}>{shipment.sender_name}</p>
                            <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{shipment.sender_address}</p>
                        </section>
                        <div className="address-sep"></div>
                        <section className="address-block">
                            <h4 className="flex items-center gap-2 text-muted" style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px' }}>
                                <MapPin size={14} /> DESTINATION POINT
                            </h4>
                            <p style={{ fontWeight: 800, fontSize: '1.1rem', margin: '14px 0 8px 0' }}>{shipment.receiver_name}</p>
                            <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{shipment.receiver_address}</p>
                        </section>
                    </div>
                </main>

                <aside className="detail-aside">
                    <div className="card-v3 aside-card">
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>LOGISTICS TRACK</h4>
                        <div className="timeline-container">
                            {steps.map((step, i) => {
                                const active = i === activeStep;
                                const done = i < activeStep;
                                const color = active ? 'var(--accent)' : done ? 'var(--accent)' : 'var(--border)';
                                return (
                                    <div key={i} className="timeline-node flex gap-6 pb-10 relative">
                                        {/* Node Icon */}
                                        <div className="node-icon" style={{ background: color, boxShadow: active ? '0 0 0 5px var(--surface-hover)' : 'none' }}>
                                            {done ? <CheckCircle size={14} /> : <step.icon size={14} color={done || active ? 'white' : 'var(--text-muted)'} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: active ? 'var(--accent)' : 'var(--text-main)', opacity: (done || active) ? 1 : 0.4 }}>{step.label.toUpperCase()}</h5>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{step.sub}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </aside>
            </div>

            <style>{`
                .detail-layout { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; align-items: start; }
                .card-v3 { background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 2rem; transition: all 0.2s; }
                .summary-card { border-left: 6px solid var(--accent); }
                .badge-v3 { background: var(--input-bg); padding: 5px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; color: var(--accent); }
                .input-v3 { background: var(--input-bg); color: var(--text-main); border: 1px solid var(--border); border-radius: 12px; padding: 0.8rem 1.2rem; font-weight: 700; width: 100%; outline: none; }
                .select-control { width: 220px; font-size: 0.85rem; appearance: none; border-color: var(--accent); color: var(--accent); }
                .address-grid { display: flex; gap: 2rem; }
                .address-sep { width: 1px; background: var(--divider); align-self: stretch; }
                .timeline-node::before { content: ''; position: absolute; left: 14.5px; top: 30px; bottom: 0; width: 2px; background: var(--border); z-index: 0; }
                .timeline-node:last-child::before { display: none; }
                .node-icon { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 2; flex-shrink: 0; color: white; transition: all 0.3s; }
                
                @media (max-width: 1024px) {
                    .detail-layout { grid-template-columns: 1fr; }
                    .address-grid { flex-direction: column; }
                    .address-sep { width: 100%; height: 1px; }
                }
            `}</style>
        </div>
    );
};

export default ShipmentDetails;
