import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, MapPin, Truck, CheckCircle, Clock, ArrowLeft, User, Phone, Download } from 'lucide-react';
import '../index.css';

const ShipmentDetails = () => {
    const { awb } = useParams();
    const navigate = useNavigate();
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShipment = async () => {
            try {
                const token = localStorage.getItem('token');
                // Support both ID and AWB lookup if needed, but route uses AWB/ID
                // The backend route is /api/shipments/:awb
                const res = await axios.get(`http://localhost:5000/api/shipments/${awb}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setShipment(res.data.shipment);
            } catch (err) {
                console.error("Failed to fetch shipment", err);
                // Mock data for demo if backend fails or strictly for dev
                setShipment({
                    local_awb: awb,
                    status: 'in_transit',
                    sender_name: 'Harpil',
                    sender_address: 'Satellite Road, Ahmedabad',
                    receiver_name: 'Arjun',
                    receiver_address: 'Ring Road, Surat',
                    created_at: '2024-02-08T10:00:00Z',
                    updated_at: '2024-02-09T14:30:00Z',
                    price: 450,
                    weight: 2.5,
                    courier_owner: 'Delhivery'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchShipment();
    }, [awb]);

    if (loading) return <div className="p-4">Loading details...</div>;
    if (!shipment) return <div className="p-4">Shipment not found</div>;

    // Timeline Status Logic
    const steps = [
        { key: 'pending', label: 'Order Placed', icon: Clock },
        { key: 'accepted', label: 'Manifested / Picked Up', icon: Package },
        { key: 'in_transit', label: 'In Transit', icon: Truck },
        { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
        { key: 'delivered', label: 'Delivered', icon: CheckCircle },
    ];

    const getCurrentStepIndex = (status) => {
        const statusMap = {
            'pending': 0,
            'accepted': 1,
            'picked_up': 1,
            'in_transit': 2,
            'out_for_delivery': 3,
            'delivered': 4
        };
        return statusMap[status] || 0;
    };

    const currentStep = getCurrentStepIndex(shipment.status);

    return (
        <div className="animate-fade-in">
            <button onClick={() => navigate(-1)} className="btn btn-outline flex items-center gap-2" style={{ marginBottom: '1.5rem', border: 'none', paddingLeft: 0 }}>
                <ArrowLeft size={18} /> Back to Shipments
            </button>

            <div className="flex gap-4 responsive-grid" style={{ alignItems: 'start' }}>
                {/* Left Column: Details */}
                <div className="flex-col gap-4">
                    {/* Header Card */}
                    <div className="card">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 style={{ marginBottom: '0.5rem' }}>#{shipment.local_awb}</h2>
                                <span className="badge badge-info">{shipment.courier_owner}</span>
                            </div>
                            <div className="flex-col gap-2" style={{ textAlign: 'right' }}>
                                <div>
                                    <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700 }}>₹{shipment.price}</span>
                                    <span className="text-muted">{shipment.weight} kg</span>
                                </div>
                                <button
                                    className="btn btn-primary flex items-center gap-2"
                                    style={{ marginTop: '1rem', fontSize: '0.9rem' }}
                                    onClick={() => navigate(`/dashboard/shipments/${shipment.local_awb}/invoice`)}
                                >
                                    <Download size={16} /> Download Invoice
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Status Update Panel (Admin Only) */}
                    {(localStorage.getItem('user') && (JSON.parse(localStorage.getItem('user')).role === 'admin' || JSON.parse(localStorage.getItem('user')).role === 'courier_admin')) && (
                        <div className="card" style={{ borderLeft: '5px solid var(--accent)', background: '#fff9f5' }}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="m-0">Admin Controls</h4>
                                    <p className="text-muted m-0" style={{ fontSize: '0.8rem' }}>Update current shipment status</p>
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        className="input"
                                        style={{ width: '180px' }}
                                        value={shipment.status}
                                        onChange={async (e) => {
                                            const newStatus = e.target.value;
                                            try {
                                                const token = localStorage.getItem('token');
                                                await axios.patch(`http://localhost:5000/api/shipments/${shipment.local_awb}/status`, { status: newStatus }, {
                                                    headers: { Authorization: `Bearer ${token}` }
                                                });
                                                setShipment(prev => ({ ...prev, status: newStatus }));
                                                alert('Status Updated Successfully! 🎉');
                                            } catch (err) {
                                                alert('Update failed: ' + (err.response?.data?.error || err.message));
                                            }
                                        }}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="accepted">Accepted / Picked Up</option>
                                        <option value="in_transit">In Transit</option>
                                        <option value="out_for_delivery">Out for Delivery</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="canceled">Canceled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Addresses */}
                    <div className="card responsive-grid" style={{ gap: '2rem' }}>
                        <div>
                            <h4 className="flex items-center gap-2 mb-3 text-muted">
                                <MapPin size={16} /> From (Sender)
                            </h4>
                            <p style={{ fontWeight: 600 }}>{shipment.sender_name}</p>
                            <p style={{ fontSize: '0.9rem', color: '#666' }}>{shipment.sender_address}</p>
                            <div className="flex items-center gap-2 mt-2 text-muted" style={{ fontSize: '0.8rem' }}>
                                <Phone size={12} /> {shipment.sender_phone || 'N/A'}
                            </div>
                        </div>
                        <div className="mobile-pt-4">
                            <h4 className="flex items-center gap-2 mb-3 text-muted">
                                <MapPin size={16} /> To (Receiver)
                            </h4>
                            <p style={{ fontWeight: 600 }}>{shipment.receiver_name}</p>
                            <p style={{ fontSize: '0.9rem', color: '#666' }}>{shipment.receiver_address}</p>
                            <div className="flex items-center gap-2 mt-2 text-muted" style={{ fontSize: '0.8rem' }}>
                                <Phone size={12} /> {shipment.receiver_phone || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Timeline */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Tracking History</h3>
                    <div className="timeline">
                        {steps.map((step, index) => {
                            const isCompleted = index <= currentStep;
                            const isCurrent = index === currentStep;

                            return (
                                <div key={step.key} className="flex gap-3 pb-6 relative">
                                    {/* Line connector */}
                                    {index !== steps.length - 1 && (
                                        <div style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '24px',
                                            bottom: 0,
                                            width: '2px',
                                            background: isCompleted && !isCurrent ? 'var(--accent)' : '#e5e7eb'
                                        }}></div>
                                    )}

                                    {/* Icon Circle */}
                                    <div style={{
                                        width: '26px',
                                        height: '26px',
                                        borderRadius: '50%',
                                        background: isCompleted ? 'var(--accent)' : '#f3f4f6',
                                        color: isCompleted ? 'white' : '#9ca3af',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 1
                                    }}>
                                        <step.icon size={14} />
                                    </div>

                                    {/* Text */}
                                    <div>
                                        <h5 style={{
                                            margin: 0,
                                            color: isCompleted ? 'var(--text-main)' : 'var(--text-muted)',
                                            fontWeight: isCurrent ? 700 : 500
                                        }}>
                                            {step.label}
                                        </h5>
                                        {isCurrent && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
                                                Last updated: {new Date().toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 768px) {
                    .mobile-pt-4 { 
                        border-top: 1px solid var(--border) !important; 
                        padding-top: 2rem !important;
                        border-left: none !important;
                        padding-left: 0 !important;
                    }
                }
            ` }} />
        </div>
    );
};

export default ShipmentDetails;
