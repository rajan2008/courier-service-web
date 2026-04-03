import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const Shipments = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders'); 
    const [shipments, setShipments] = useState([]);
    const [documents, setDocuments] = useState([
        { name: 'Invoice_Jan2024.pdf', user: 'Admin', date: 'Jan 05, 24' },
        { name: 'ShipmentList_Nov22.xlsx', user: 'Admin', date: 'Nov 20, 22' },
        { name: 'Customer_Info.docx', user: 'Jack', date: 'Nov 10, 22' }
    ]);

    useEffect(() => {
        const fetchShipments = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('http://localhost:5000/api/shipments', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setShipments(res.data);
            } catch (err) {
                console.error("Failed", err);
            }
        };
        fetchShipments();
    }, []);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isCustomer = user.role === 'customer';

    return (
        <div className="animate-fade-in" style={{ color: 'var(--text-main)' }}>
            <div className="flex justify-between items-center mb-8 responsive-flex" style={{ gap: '1rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{activeTab === 'orders' ? (isCustomer ? 'My Orders' : 'Fleet Operations') : 'Digital Vault'}</h1>
                <div className="flex gap-2" style={{ background: 'var(--input-bg)', padding: '6px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                    <button 
                        className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('orders')}
                        style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 700, fontSize: '0.9rem', background: activeTab === 'orders' ? 'var(--accent)' : 'transparent', color: activeTab === 'orders' ? 'white' : 'var(--text-muted)' }}
                    >
                        Activity
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('documents')}
                        style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 700, fontSize: '0.9rem', background: activeTab === 'documents' ? 'var(--accent)' : 'transparent', color: activeTab === 'documents' ? 'white' : 'var(--text-muted)' }}
                    >
                        Vault
                    </button>
                </div>
            </div>

            {activeTab === 'orders' ? (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--divider)', borderBottom: '1px solid var(--border)' }}>
                                    <th style={TH_STYLE}>AWB / Tracking</th>
                                    <th style={TH_STYLE}>Deployment Date</th>
                                    <th style={TH_STYLE}>Sender Node</th>
                                    <th style={TH_STYLE}>Value</th>
                                    <th style={TH_STYLE}>Status</th>
                                    <th style={TH_STYLE}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shipments.map((s, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--divider)' }} className="hover:bg-var-surface-hover">
                                        <td style={{ ...TD_STYLE, fontWeight: 700, color: 'var(--accent)' }}>{s.local_awb}</td>
                                        <td style={TD_STYLE}>{new Date(s.created_at).toLocaleDateString()}</td>
                                        <td style={TD_STYLE}>{s.sender_name}</td>
                                        <td style={{ ...TD_STYLE, fontWeight: 800 }}>₹{s.price}</td>
                                        <td style={TD_STYLE}><Badge status={s.status} /></td>
                                        <td style={TD_STYLE}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => navigate(`/dashboard/shipments/${s.local_awb}`)} style={SMALL_BTN}>View</button>
                                                <button onClick={() => navigate(`/dashboard/shipments/${s.local_awb}/invoice`)} style={{ ...SMALL_BTN, background: 'var(--accent)', color: 'white', border: 'none' }}>Invoice</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: '2rem' }}>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem' }}>Document Repository</h2>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Blockchain-backed logistics manifests and invoices.</p>
                        </div>
                        <button className="btn-primary-v3">
                            <FileText size={18} /> Sync Documents
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {documents.map((doc, i) => (
                            <div key={i} className="doc-card">
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div className="doc-icon"><FileText size={24} /></div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontWeight: 700 }}>{doc.name}</p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.date} • Verified</p>
                                    </div>
                                    <button className="doc-download"><Download size={18}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                .table-responsive { overflow-x: auto; }
                .tab-btn:hover { background: var(--glass); }
                .tab-btn.active:hover { background: var(--accent-hover); }
                .doc-card { background: var(--input-bg); padding: 1.2rem; border-radius: 18px; border: 1px solid var(--border); transition: all 0.2s; }
                .doc-card:hover { transform: translateY(-3px); border-color: var(--accent); }
                .doc-icon { width: 50px; height: 50px; border-radius: 12px; background: var(--glass); color: var(--accent); display: flex; align-items: center; justify-content: center; }
                .doc-download { background: none; border: none; color: var(--text-muted); cursor: pointer; transition: color 0.2s; }
                .doc-download:hover { color: var(--accent); }
                .btn-primary-v3 { background: var(--accent); color: white; padding: 0.8rem 1.4rem; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; gap: 8px; align-items: center; }
            `}</style>
        </div>
    );
};

const TH_STYLE = { textAlign: 'left', padding: '1.2rem 1rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' };
const TD_STYLE = { padding: '1.4rem 1rem', fontSize: '0.95rem', color: 'var(--text-main)' };
const SMALL_BTN = { padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' };

const Badge = ({ status }) => {
    let color = '#facc15';
    if (status === 'delivered') color = '#34d399';
    if (status === 'in_transit') color = '#38bdf8';
    if (status === 'canceled') color = '#ef4444';
    return (
        <span style={{ 
            padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, 
            background: `${color}15`, color: color, border: `1px solid ${color}35`, textTransform: 'uppercase' 
        }}>
            {status.replace('_', ' ')}
        </span>
    );
};

export default Shipments;
