import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Trash2, Plus, Shield, User as UserIcon, Truck } from 'lucide-react';
import '../index.css';

const Employees = () => {
    const [users, setUsers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isSuperAdmin = currentUser.role === 'admin';
    const isCourierAdmin = currentUser.role === 'courier_admin';

    const [newItem, setNewItem] = useState({
        name: '', email: '', role: isCourierAdmin ? 'employee' : 'customer',
        phone: '', password: '', courier_owner: isCourierAdmin ? currentUser.courier_owner : ''
    });

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {} finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this account?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {}
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/users', newItem, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Verified!'); fetchUsers(); setShowAddForm(false);
        } catch (err) { alert("Failed"); }
    };

    return (
        <div className="animate-fade-in" style={{ color: 'var(--text-main)' }}>
            <div className="flex justify-between items-center mb-8 responsive-flex">
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Account Directory</h1>
                    <p className="text-muted" style={{ fontSize: '0.95rem' }}>Deploy and manage high-level account roles.</p>
                </div>
                {(isSuperAdmin || isCourierAdmin) && (
                    <button className="btn-primary-v3" onClick={() => setShowAddForm(!showAddForm)}>
                        {showAddForm ? 'Cancel' : <><Plus size={18} /> Add Operator</>}
                    </button>
                )}
            </div>

            {showAddForm && (
                <div className="card animate-pop-in" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Create Operator Link</h3>
                    <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        <InputField label="Operator Name" value={newItem.name} onChange={v => setNewItem({...newItem, name: v})} placeholder="Ex: John Doe" />
                        <InputField label="Email ID" value={newItem.email} onChange={v => setNewItem({...newItem, email: v})} placeholder="auth@shippique.com" />
                        <InputField label="Contact" value={newItem.phone} onChange={v => setNewItem({...newItem, phone: v})} placeholder="10 Digit" />
                        <InputField label="Secret Key (Password)" value={newItem.password} onChange={v => setNewItem({...newItem, password: v})} type="password" />

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Role Assignment</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                                <RoleCard active={newItem.role === 'customer'} icon={UserIcon} label="Customer" onClick={() => setNewItem({...newItem, role: 'customer'})} />
                                <RoleCard active={newItem.role === 'employee'} icon={Truck} label="Driver" onClick={() => setNewItem({...newItem, role: 'employee'})} />
                                {isSuperAdmin && <RoleCard active={newItem.role === 'courier_admin'} icon={Shield} label="Branch Admin" onClick={() => setNewItem({...newItem, role: 'courier_admin'})} />}
                            </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                            <button type="submit" className="btn-primary-v3" style={{ width: '200px' }}>Finalize Account</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--divider)', borderBottom: '1px solid var(--border)' }}>
                                <th style={TH}>Operator</th>
                                <th style={TH}>Privilege</th>
                                <th style={TH}>Node</th>
                                <th style={TH}>Status</th>
                                {isSuperAdmin && <th style={{ ...TH, textAlign: 'right' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--divider)' }}>
                                    <td style={TD}>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar">{u.name[0]}</div>
                                            <div>
                                                <span style={{ display: 'block', fontWeight: 700 }}>{u.name}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={TD}><Badge role={u.role} /></td>
                                    <td style={TD}>{u.courier_owner || 'Global'}</td>
                                    <td style={TD}><span style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: 700 }}>ACTIVE</span></td>
                                    {isSuperAdmin && (
                                        <td style={{ ...TD, textAlign: 'right' }}>
                                            {u.email !== currentUser.email && (
                                                <button onClick={() => handleDelete(u.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; }
                .btn-primary-v3 { background: var(--accent); color: white; border: none; padding: 0.8rem 1.4rem; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; gap: 8px; align-items: center; }
                .table-responsive { overflow-x: auto; }
            `}</style>
        </div>
    );
};

const InputField = ({ label, value, onChange, placeholder, type="text" }) => (
    <div className="flex-col gap-1">
        <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{label}</label>
        <input className="input-v3" type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} style={{ padding: '0.8rem', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-main)' }} />
    </div>
);

const RoleCard = ({ active, icon: Icon, label, onClick }) => (
    <div onClick={onClick} style={{ 
        padding: '1rem', border: '2px solid', borderColor: active ? 'var(--accent)' : 'var(--border)', 
        borderRadius: '14px', textAlign: 'center', cursor: 'pointer', background: active ? 'var(--surface-hover)' : 'var(--input-bg)',
        color: active ? 'var(--accent)' : 'var(--text-muted)', transition: 'all 0.2s'
    }}>
        <Icon size={20} style={{ marginBottom: '8px' }} />
        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700 }}>{label}</p>
    </div>
);

const Badge = ({ role }) => {
    let color = '#38bdf8';
    if (role === 'admin') color = '#facc15';
    if (role === 'courier_admin') color = '#a78bfa';
    return <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, background: `${color}15`, color: color, border: `1px solid ${color}35` }}>{role.toUpperCase()}</span>;
};

const TH = { textAlign: 'left', padding: '1.2rem 1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px' };
const TD = { padding: '1.4rem 1rem', fontSize: '0.9rem' };

export default Employees;
