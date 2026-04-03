import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, Clock, MapPin, User, CheckCircle, TrendingUp, Activity, ChevronRight, MoreHorizontal } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import '../index.css';

const STYLES = {
    wrapper: { minHeight: '100vh', background: 'transparent' },
    container: { maxWidth: '1400px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' },
    title: { fontSize: '2.2rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: 'var(--text-main)' },
    subtitle: { fontSize: '1rem', color: 'var(--text-muted)', margin: 0 },
    primaryBtn: { background: 'var(--accent)', color: '#fff', padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)' },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' },
    card: { background: 'var(--surface)', borderRadius: '24px', padding: '1.8rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow)' },
    cardTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' },
    cardIcon: { width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    cardTitle: { color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' },
    cardValue: { color: 'var(--text-main)', fontSize: '2.2rem', fontWeight: '800', margin: '0.4rem 0 0 0' },
    gridMain: { display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '1.5rem', marginBottom: '2rem' },
    panel: { background: 'var(--surface)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' },
    panelTitle: { color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: '600', marginBottom: '1.8rem', marginTop: 0 },
    tr: { borderBottom: '1px solid var(--divider)' },
    th: { textAlign: 'left', padding: '1.2rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' },
    td: { padding: '1.4rem 0.5rem', color: 'var(--text-main)', fontSize: '0.95rem' },
    quickLink: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem', background: 'var(--glass)', borderRadius: '16px', marginBottom: '1rem', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' },
    badge: { padding: '6px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }
};

const Dashboard = () => {
    const [stats, setStats] = useState({ total_shipments: 0, pending_shipments: 0, out_for_delivery: 0, delivered_shipments: 0, total_revenue: 0 });
    const [recentShipments, setRecentShipments] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [activeModal, setActiveModal] = useState(null);
    const [drivers, setDrivers] = useState([]);
    const [assignSelections, setAssignSelections] = useState({});

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin' || user.role === 'courier_admin';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                if (isAdmin) {
                    const ansRes = await axios.get('http://localhost:5000/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } });
                    setStats(ansRes.data.stats || stats);
                    setRevenueData(ansRes.data.revenueData || []);
                }

                const sRes = await axios.get('http://localhost:5000/api/shipments', { headers: { Authorization: `Bearer ${token}` } });
                setRecentShipments(sRes.data.slice(0, 8));

                if (!isAdmin) {
                    const data = sRes.data;
                    setStats({
                        total_shipments: data.length,
                        pending_shipments: data.filter(s => s.status === 'pending').length,
                        delivered_shipments: data.filter(s => s.status === 'delivered').length,
                        out_for_delivery: data.filter(s => s.status === 'out_for_delivery').length
                    });
                }
            } catch (err) {}
        };
        fetchDashboardData();
    }, [isAdmin]);

    return (
        <div style={STYLES.wrapper} className="animate-fade-in">
            <div style={STYLES.container}>
                <header style={STYLES.header}>
                    <div>
                        <h1 style={STYLES.title}>Summary</h1>
                        <p style={STYLES.subtitle}>
                            {user.role === 'admin' ? 'Network Global Performance' : `Welcome, ${user.name}`}
                        </p>
                    </div>
                    {user.role === 'customer' && (
                        <button style={STYLES.primaryBtn} onClick={() => navigate('/dashboard/book')}>
                            <Package size={18} /> Book Shipment
                        </button>
                    )}
                </header>

                <div style={STYLES.grid4}>
                    <MetricCard title="Total Shipments" value={stats.total_shipments} icon={Package} cBg="var(--blue-light)" cFg="#38bdf8" />
                    <MetricCard title="Pending" value={stats.pending_shipments} icon={Clock} cBg="var(--yellow-light)" cFg="#f97316" />
                    <MetricCard title="Delivered" value={stats.delivered_shipments} icon={CheckCircle} cBg="var(--green-light)" cFg="#34d399" />
                    {isAdmin && <MetricCard title="Total Revenue" value={`₹${stats.total_revenue || 0}`} icon={TrendingUp} cBg="var(--red-light)" cFg="#a78bfa" />}
                </div>

                <div style={{ ...STYLES.gridMain, gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '2.2fr 1fr' }}>
                    <div style={STYLES.panel}>
                        <h2 style={STYLES.panelTitle}>Operations Chart</h2>
                        <div style={{ height: '350px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <XAxis dataKey="month" stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} dy={10} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', boxShadow: 'var(--shadow)' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={3} fillOpacity={0.15} fill="var(--accent)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={STYLES.panel}>
                        <h2 style={STYLES.panelTitle}>Network Actions</h2>
                        <QuickLink title="Route Map" sub="Hub Connectivity" icon={MapPin} onClick={() => {}} />
                        <QuickLink title="Live Tracking" sub="Active AWB Status" icon={Package} onClick={() => navigate('/dashboard/shipments')} />
                        <QuickLink title="Settings" sub="Account Security" icon={Activity} onClick={() => navigate('/dashboard/settings')} />
                    </div>
                </div>

                <div style={STYLES.panel}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={STYLES.panelTitle}>Recent Consignments</h2>
                        <button style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }} onClick={() => navigate('/dashboard/shipments')}>View History</button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={STYLES.tr}>
                                    <th style={STYLES.th}>ID</th>
                                    <th style={STYLES.th}>Logistics Route</th>
                                    <th style={STYLES.th}>Date</th>
                                    <th style={STYLES.th}>Value</th>
                                    <th style={STYLES.th}>Stage</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentShipments.map(s => (
                                    <tr key={s.id} style={STYLES.tr} className="hover:bg-opacity-50 transition-colors">
                                        <td style={{ ...STYLES.td, color: 'var(--text-main)', fontWeight: '600' }}>{s.local_awb}</td>
                                        <td style={STYLES.td}>{s.sender_city?.split(' ')[0]} → {s.receiver_city?.split(' ')[0]}</td>
                                        <td style={STYLES.td}>{new Date(s.created_at).toLocaleDateString()}</td>
                                        <td style={{ ...STYLES.td, color: 'var(--text-main)', fontWeight: '700' }}>₹{s.price}</td>
                                        <td style={STYLES.td}><Badge status={s.status} /></td>
                                        <td style={STYLES.td}><button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => navigate(`/dashboard/shipments/${s.local_awb}`)}><MoreHorizontal size={20}/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon: Icon, cBg, cFg }) => (
    <div style={STYLES.card} className="hover:scale-[1.02] transition-transform">
        <div style={STYLES.cardTop}>
            <div style={{ ...STYLES.cardIcon, background: cBg, color: cFg }}><Icon size={24} /></div>
        </div>
        <p style={STYLES.cardTitle}>{title}</p>
        <p style={STYLES.cardValue}>{value}</p>
    </div>
);

const QuickLink = ({ title, sub, icon: Icon, onClick }) => (
    <div style={STYLES.quickLink} onClick={onClick} className="hover:bg-var-surface-hover">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.8rem', background: 'var(--surface-hover)', borderRadius: '12px', color: 'var(--accent)' }}><Icon size={20}/></div>
            <div>
                <p style={{ margin: '0 0 4px 0', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.95rem' }}>{title}</p>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{sub}</p>
            </div>
        </div>
        <ChevronRight size={18} color="var(--text-muted)" />
    </div>
);

const Badge = ({ status }) => {
    let color = '#fff', label = status.replace('_', ' ');
    if (status === 'pending') color = '#facc15';
    if (status === 'delivered') color = '#34d399';
    if (status === 'in_transit') color = '#38bdf8';
    return <span style={{ ...STYLES.badge, background: `${color}15`, color: color, border: `1px solid ${color}40` }}>{label}</span>;
};

export default Dashboard;
