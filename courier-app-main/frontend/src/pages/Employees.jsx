import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Trash2, Plus, Shield, User as UserIcon, Truck } from 'lucide-react';
import '../index.css';

const Employees = () => {
    const [users, setUsers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);

    // Get current user info
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isSuperAdmin = currentUser.role === 'admin';
    const isCourierAdmin = currentUser.role === 'courier_admin';

    const [newItem, setNewItem] = useState({
        name: '',
        email: '',
        role: isCourierAdmin ? 'employee' : 'customer',
        phone: '',
        password: '',
        courier_owner: isCourierAdmin ? currentUser.courier_owner : ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this account?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            alert("Delete failed: " + (err.response?.data?.error || err.message));
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/users', newItem, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('User Created Successfully!');
            fetchUsers();
            setShowAddForm(false);
            setNewItem({
                name: '', email: '', role: isCourierAdmin ? 'employee' : 'customer',
                phone: '', password: '', courier_owner: isCourierAdmin ? currentUser.courier_owner : ''
            });
        } catch (err) {
            alert("Create failed: " + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center responsive-flex" style={{ marginBottom: '2rem', gap: '1rem' }}>
                <div>
                    <h2>Account Management</h2>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                        {isSuperAdmin ? 'Manage users, admins and employees across the system' : `Manage employees for ${currentUser.courier_owner}`}
                    </p>
                </div>
                {(isSuperAdmin || isCourierAdmin) && (
                    <button className="btn btn-primary flex items-center gap-2" onClick={() => setShowAddForm(!showAddForm)} style={{ whiteSpace: 'nowrap' }}>
                        {showAddForm ? 'Cancel' : <><Plus size={18} /> Add User</>}
                    </button>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 768px) {
                    .responsive-flex { flex-direction: column !important; align-items: flex-start !important; }
                }
            ` }} />

            {showAddForm && (
                <div className="card animate-pop-in" style={{ marginBottom: '2.5rem', borderLeft: '5px solid var(--accent)' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Create New Account</h3>
                    <form onSubmit={handleAdd} className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        <div className="flex-col gap-1">
                            <label className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>FULL NAME</label>
                            <input className="input" placeholder="e.g. Rajan Kumar" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} required />
                        </div>

                        <div className="flex-col gap-1">
                            <label className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>EMAIL ADDRESS</label>
                            <input className="input" placeholder="email@example.com" type="email" value={newItem.email} onChange={e => setNewItem({ ...newItem, email: e.target.value })} required />
                        </div>

                        <div className="flex-col gap-1">
                            <label className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>PHONE NUMBER</label>
                            <input className="input" placeholder="9000000000" value={newItem.phone} onChange={e => setNewItem({ ...newItem, phone: e.target.value })} />
                        </div>

                        <div className="flex-col gap-1">
                            <label className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>ACCOUNT ROLE</label>
                            <select className="input" value={newItem.role} onChange={e => setNewItem({ ...newItem, role: e.target.value })}>
                                {isSuperAdmin ? (
                                    <>
                                        <option value="customer">Customer</option>
                                        <option value="employee">Employee / Driver</option>
                                        <option value="courier_admin">Courier Admin</option>
                                        <option value="admin">Super Admin</option>
                                    </>
                                ) : (
                                    <option value="employee">Employee / Driver</option>
                                )}
                            </select>
                        </div>

                        {(isSuperAdmin && (newItem.role === 'employee' || newItem.role === 'courier_admin')) && (
                            <div className="flex-col gap-1">
                                <label className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>ASSOCIATED COMPANY</label>
                                <input className="input" placeholder="e.g. Mahavir Courier" value={newItem.courier_owner} onChange={e => setNewItem({ ...newItem, courier_owner: e.target.value })} required />
                            </div>
                        )}

                        <div className="flex-col gap-1">
                            <label className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>PASSWORD</label>
                            <input className="input" placeholder="••••••••" type="password" value={newItem.password} onChange={e => setNewItem({ ...newItem, password: e.target.value })} required />
                        </div>

                        <div className="flex items-end" style={{ gridColumn: '1 / -1' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Create User Account</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card shadow-sm" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table className="w-100">
                        <thead style={{ background: '#f8f9fa' }}>
                            <tr>
                                <th style={{ padding: '1rem' }}>User</th>
                                <th>Role</th>
                                <th>Company</th>
                                <th>Contact</th>
                                {isSuperAdmin && <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td style={{ padding: '1rem' }}>
                                        <div className="flex items-center gap-3">
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {u.role === 'admin' ? <Shield size={16} color="#4f46e5" /> : u.role === 'employee' ? <Truck size={16} color="#d97736" /> : <UserIcon size={16} color="#6b7280" />}
                                            </div>
                                            <div>
                                                <span style={{ display: 'block', fontWeight: 600 }}>{u.name}</span>
                                                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>ID: #{u.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${u.role === 'admin' ? 'badge-warning' : u.role === 'courier_admin' ? 'badge-info' : 'badge-success'}`} style={{ textTransform: 'capitalize' }}>
                                            {u.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="text-muted" style={{ fontSize: '0.9rem' }}>{u.courier_owner || 'N/A'}</td>
                                    <td>
                                        <span style={{ display: 'block', fontSize: '0.85rem' }}>{u.email}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{u.phone || 'No Phone'}</span>
                                    </td>
                                    {isSuperAdmin && (
                                        <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                                            {u.email !== currentUser.email && (
                                                <button
                                                    className="btn btn-outline"
                                                    style={{ border: 'none', color: '#ef4444', padding: '0.5rem' }}
                                                    onClick={() => handleDelete(u.id)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {users.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Employees;
