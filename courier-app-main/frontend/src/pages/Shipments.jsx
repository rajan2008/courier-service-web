import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const Shipments = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders'); // orders | documents
    const [shipments, setShipments] = useState([]);

    useEffect(() => {
        const fetchShipments = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/shipments', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setShipments(res.data);
            } catch (err) {
                console.error("Failed", err);
                // Fallback
                setShipments([
                    { local_awb: 'MC20240208-032', sender_name: 'Harpil', receiver_city: 'Ahmedabad', status: 'pending', price: 500, created_at: '2024-02-08' },
                    { local_awb: 'MC20240207-005', sender_name: 'Aryan', receiver_city: 'Surat', status: 'delivered', price: 1200, created_at: '2024-02-07' },
                    { local_awb: 'MC20240206-012', sender_name: 'Kashish', receiver_city: 'Vadodara', status: 'in_transit', price: 850, created_at: '2024-02-06' }
                ]);
            }
        };
        fetchShipments();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="badge badge-warning flex items-center gap-1"><Clock size={12} /> Pending</span>;
            case 'delivered': return <span className="badge badge-success flex items-center gap-1"><CheckCircle size={12} /> Delivered</span>;
            case 'canceled': return <span className="badge badge-danger flex items-center gap-1"><XCircle size={12} /> Canceled</span>;
            default: return <span className="badge badge-info flex items-center gap-1"><Truck size={12} /> {status}</span>;
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6 responsive-flex" style={{ gap: '1rem' }}>
                <h2>{activeTab === 'orders' ? 'Shipment History' : 'Documents'}</h2>
                <div className="flex gap-2">
                    <button className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('orders')}>
                        Orders
                    </button>
                    <button className={`btn ${activeTab === 'documents' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('documents')}>
                        Documents
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 768px) {
                    .responsive-flex { flex-direction: column !important; align-items: flex-start !important; }
                }
            ` }} />

            {activeTab === 'orders' ? (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>AWB</th>
                                    <th>Date</th>
                                    <th>Sender</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Invoice</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shipments.map((s, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600 }}>{s.local_awb}</td>
                                        <td>{s.created_at?.slice(0, 10)}</td>
                                        <td>{s.sender_name}</td>
                                        <td>₹{s.price}</td>
                                        <td>{getStatusBadge(s.status)}</td>
                                        <td>
                                            <button
                                                className="btn btn-outline"
                                                style={{ color: 'var(--accent)', borderColor: 'var(--accent)', padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                onClick={() => navigate(`/dashboard/shipments/${s.local_awb}/invoice`)}
                                            >
                                                <Download size={14} /> Invoice
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-outline"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                                onClick={() => navigate(`/dashboard/shipments/${s.local_awb}`)}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="card">
                    {/* Mock Documents UI */}
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-muted">Uploaded Files (Demo)</h4>
                        <button className="btn btn-primary">Upload Document</button>
                    </div>

                    <div className="flex-col gap-2">
                        {[
                            { name: 'Invoice_Jan2024.pdf', user: 'admin', date: 'Jan 05, 24' },
                            { name: 'ShipmentList_Nov22.xlsx', user: 'admin', date: 'Nov 20, 22' },
                            { name: 'Customer_Info.docx', user: 'Jack', date: 'Nov 10, 22' },
                        ].map((doc, i) => (
                            <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded border-b">
                                <div className="flex items-center gap-3">
                                    <FileText color="var(--accent)" />
                                    <div>
                                        <span style={{ display: 'block', fontWeight: 500 }}>{doc.name}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Uploaded by {doc.user} • {doc.date}</span>
                                    </div>
                                </div>
                                <button className="btn btn-outline" style={{ border: 'none' }}><Download size={16} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shipments;
