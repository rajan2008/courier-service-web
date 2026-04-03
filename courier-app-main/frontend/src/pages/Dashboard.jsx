import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, Clock, AlertTriangle, X, MapPin, User, FileText, CheckCircle, XCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, transit: 0, out_for_delivery: 0, delivered: 0, canceled: 0 });
    const [recentShipments, setRecentShipments] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [ordersData, setOrdersData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [topCity, setTopCity] = useState('');
    const navigate = useNavigate();
    const [activeModal, setActiveModal] = useState(null); // 'map' | 'assign' | 'logs'
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isSuperAdmin = user.role === 'admin';
    const isCourierAdmin = user.role === 'courier_admin';
    const isAdmin = isSuperAdmin || isCourierAdmin;

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get('http://localhost:5000/api/shipments', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = res.data;

                // 1. Basic Stats
                const total = data.length;
                const pending = data.filter(s => s.status === 'pending').length;
                const transit = data.filter(s => ['accepted', 'picked_up', 'in_transit'].includes(s.status)).length;
                const ofd = data.filter(s => s.status === 'out_for_delivery').length;
                const delivered = data.filter(s => s.status === 'delivered').length;
                const canceled = data.filter(s => s.status === 'canceled').length;

                setStats({ total, pending, transit, out_for_delivery: ofd, delivered, canceled });
                setRecentShipments(data.slice(0, 5));

                // 2. Process Chart Data (Last 7 Days)
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const weeklyRevenue = {};
                const weeklyOrders = {};

                // Initialize last 7 days including today
                for (let i = 0; i < 7; i++) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dayName = days[d.getDay()];
                    weeklyRevenue[dayName] = 0;
                    weeklyOrders[dayName] = 0;
                }

                data.forEach(s => {
                    const date = new Date(s.created_at);
                    const dayName = days[date.getDay()];
                    if (weeklyRevenue[dayName] !== undefined) {
                        weeklyRevenue[dayName] += Number(s.price || 0);
                        weeklyOrders[dayName] += 1;
                    }
                });

                // Convert to Recharts format (ordered chronologically)
                const rev = [];
                const ord = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dayName = days[d.getDay()];
                    rev.push({ name: dayName, v: weeklyRevenue[dayName] });
                    ord.push({ name: dayName, v: weeklyOrders[dayName] });
                }
                setRevenueData(rev);
                setOrdersData(ord);

                // 3. City Distribution (Pie Chart)
                const cityMap = {};
                data.forEach(s => {
                    const city = s.receiver_city || 'Unknown';
                    cityMap[city] = (cityMap[city] || 0) + 1;
                });

                const pie = Object.keys(cityMap).map(city => ({
                    name: city,
                    value: cityMap[city]
                })).sort((a, b) => b.value - a.value).slice(0, 4);

                setPieData(pie);
                if (pie.length > 0) setTopCity(pie[0].name);

            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            }
        };
        fetchStats();
    }, []);

    const COLORS = ['#d97736', '#4a4a4a', '#8b4513', '#bc8f8f'];

    return (
        <div className="animate-fade-in relative">
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h2>{isCourierAdmin ? `${user.courier_owner || 'Courier'} Overview` : 'Dashboard'}</h2>
                    {isCourierAdmin && <p className="text-muted" style={{ fontSize: '0.85rem' }}>Account: {user.email} | Company: {user.courier_owner || 'Not Set (Please recreate account)'}</p>}
                </div>
                {isCourierAdmin && <span className="badge badge-info">Courier Admin Mode</span>}
            </div>

            {/* Courier Admin Operations Toolbar */}
            {isCourierAdmin && (
                <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', borderLeft: '4px solid var(--accent)' }}>
                    <div style={{ marginRight: 'auto' }}>
                        <h4 style={{ margin: 0 }}>Live Operations</h4>
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>Manage your fleet and orders</span>
                    </div>
                    <button className="btn btn-primary" onClick={() => setActiveModal('map')}>
                        <MapPin size={16} style={{ marginRight: '0.5rem' }} /> Live Map
                    </button>
                    <button className="btn btn-outline" onClick={() => setActiveModal('assign')}>
                        <Truck size={16} style={{ marginRight: '0.5rem' }} /> Assign Drivers
                    </button>
                    <button className="btn btn-outline" onClick={() => setActiveModal('logs')}>
                        <FileText size={16} style={{ marginRight: '0.5rem' }} /> Detailed Logs
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <StatsCard title="Total Shipments" value={stats.total} icon={Package} color="var(--primary)" />
                <StatsCard title="Pending" value={stats.pending} icon={Clock} color="#6b7280" />
                <StatsCard title="In Transit" value={stats.transit} icon={Truck} color="#3b82f6" />
                <StatsCard title="Out for Delivery" value={stats.out_for_delivery} icon={MapPin} color="#8b5cf6" />
                <StatsCard title="Delivered" value={stats.delivered} icon={CheckCircle} color="#10b981" />
                <StatsCard title="Canceled" value={stats.canceled} icon={XCircle} color="#ef4444" />
            </div>

            {/* Charts Row */}
            <div className="responsive-grid" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <h4>Revenue</h4>
                    <div style={{ height: '200px', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#d97736" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#d97736" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="v" stroke="#d97736" fillOpacity={1} fill="url(#colorPv)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h4>Orders</h4>
                    <div style={{ height: '200px', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ordersData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="v" fill="#4a4a4a" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Orders & Pie Chart */}
            <div className="responsive-grid">
                <div className="card">
                    <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                        <h4>Recent Shipments</h4>
                        <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>View All</button>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>AWB</th>
                                    <th>Sender</th>
                                    <th>Status</th>
                                    <th>Price</th>
                                    <th>Invoice</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentShipments.map((s, i) => (
                                    <tr key={i}>
                                        <td>{s.local_awb || s.awb}</td>
                                        <td>{s.sender_name || s.sender}</td>
                                        <td>
                                            <span className={`badge ${s.status === 'delivered' ? 'badge-success' :
                                                s.status === 'pending' ? 'badge-warning' : 'badge-info'
                                                }`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td>₹{s.price}</td>
                                        <td>
                                            <button
                                                onClick={() => navigate(`/dashboard/shipments/${s.local_awb || s.awb}/invoice`)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}
                                                title="View Invoice"
                                            >
                                                <FileText size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <h4>Shipments by City</h4>
                    <div style={{ height: '200px', marginTop: '1rem', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text Trick */}
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Top</span><br />
                            <strong style={{ fontSize: '0.85rem' }}>{topCity || 'N/A'}</strong>
                        </div>
                    </div>
                </div>
            </div>
            {/* Live Operations Modals */}
            {activeModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', padding: '2rem'
                }}>
                    <div className="card modal-content animate-pop-in" style={{
                        width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto',
                        position: 'relative', background: '#fff'
                    }}>
                        <button
                            onClick={() => setActiveModal(null)}
                            style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                        >
                            <X size={24} />
                        </button>

                        {/* 1. LIVE MAP VIEW */}
                        {activeModal === 'map' && (
                            <div className="flex-col gap-6">
                                <h3>Live Tracking Fleet</h3>
                                <div style={{
                                    height: '500px', background: '#f3f4f6', borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '2px dashed #d1d5db', position: 'relative', overflow: 'hidden'
                                }}>
                                    {/* Mock Map Background */}
                                    <div style={{ position: 'absolute', width: '200%', height: '200%', opacity: 0.2, backgroundImage: 'radial-gradient(#4a4a4a 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                                    <p className="text-muted">Live fleet tracking enabled for {user.courier_owner}...</p>

                                    {/* Mock Moving Assets */}
                                    <div className="pulse-map" style={{ position: 'absolute', top: '30%', left: '40%' }}>
                                        <div className="ping"></div>
                                        <Truck color="var(--accent)" size={20} />
                                        <span style={{ fontSize: '10px', fontWeight: 600 }}>D-101 (Active)</span>
                                    </div>
                                    <div className="pulse-map" style={{ position: 'absolute', top: '60%', left: '70%' }}>
                                        <div className="ping"></div>
                                        <Truck color="var(--accent)" size={20} />
                                        <span style={{ fontSize: '10px', fontWeight: 600 }}>D-402 (Active)</span>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="badge badge-success">● 14 Drivers Online</div>
                                    <div className="badge badge-info">● 8 Moving</div>
                                </div>
                            </div>
                        )}

                        {/* 2. ASSIGN DRIVERS VIEW */}
                        {activeModal === 'assign' && (
                            <div className="flex-col gap-6">
                                <h3>Assign Drivers to Shipments</h3>
                                <div className="flex-col gap-4">
                                    {recentShipments.filter(s => s.status === 'pending').slice(0, 3).map((s, idx) => (
                                        <div key={idx} className="card shadow-sm flex items-center justify-between" style={{ background: '#f9fafb' }}>
                                            <div>
                                                <strong>AWB: {s.local_awb || s.awb}</strong>
                                                <p className="text-muted m-0" style={{ fontSize: '0.85rem' }}>From: {s.sender_city} ➔ To: {s.receiver_city}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <select className="input" style={{ width: '150px' }}>
                                                    <option>Select Driver</option>
                                                    <option>Rajiv Shah</option>
                                                    <option>Amit Patel</option>
                                                    <option>Sunil Verma</option>
                                                </select>
                                                <button className="btn btn-primary" onClick={() => alert('Assigned!')}>Assign</button>
                                            </div>
                                        </div>
                                    ))}
                                    {recentShipments.filter(s => s.status === 'pending').length === 0 && (
                                        <div className="text-center p-8 border rounded-xl">
                                            <ShieldCheck size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
                                            <p>All pending shipments have been assigned!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 3. DETAILED LOGS VIEW */}
                        {activeModal === 'logs' && (
                            <div className="flex-col gap-6">
                                <div className="flex justify-between items-center">
                                    <h3>Operations Activity Logs</h3>
                                    <button className="btn btn-outline" style={{ fontSize: '0.8rem' }} onClick={() => window.print()}>Export CSV</button>
                                </div>
                                <div className="table-responsive">
                                    <table className="logs-table">
                                        <thead>
                                            <tr>
                                                <th>Timestamp</th>
                                                <th>Action</th>
                                                <th>AWB</th>
                                                <th>User</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...recentShipments, ...recentShipments].map((s, i) => (
                                                <tr key={i}>
                                                    <td style={{ fontSize: '0.8rem' }}>{new Date().toLocaleString()}</td>
                                                    <td><strong>System Update</strong></td>
                                                    <td>{s.local_awb || s.awb}</td>
                                                    <td>{user.name}</td>
                                                    <td><span className="badge badge-info">Processed</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .pulse-map {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }
                .ping {
                    width: 10px;
                    height: 10px;
                    background-color: var(--accent);
                    border-radius: 50%;
                    position: absolute;
                    top: 5px;
                    animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
                @keyframes ping {
                    75%, 100% { transform: scale(3); opacity: 0; }
                }
                .logs-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .logs-table th {
                    text-align: left;
                    padding: 12px;
                    background: #f9fafb;
                    border-bottom: 2px solid #eee;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                }
                .logs-table td {
                    padding: 12px;
                    border-bottom: 1px solid #f0f0f0;
                }
                .animate-pop-in {
                    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                @keyframes popIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            ` }} />
        </div>
    );
};

const StatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="card flex items-center justify-between" style={{ padding: '1.25rem' }}>
        <div>
            <span style={{ display: 'block', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.25rem' }}>{value}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
        </div>
        <div style={{ padding: '0.6rem', borderRadius: '10px', background: `${color}15` || 'rgba(217, 119, 54, 0.1)' }}>
            <Icon size={20} color={color || "var(--accent)"} />
        </div>
    </div>
);

export default Dashboard;
