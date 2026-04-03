import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Phone, Mail, Camera, Save, ShieldCheck, MapPin } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        profile_photo: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            setFormData({
                name: res.data.name || '',
                phone: res.data.phone || '',
                profile_photo: res.data.profile_photo || ''
            });
        } catch (err) {
            console.error('Failed to fetch profile', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('File is too large (max 2MB)');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profile_photo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:5000/api/users/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.user) {
                setUser(res.data.user);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                window.dispatchEvent(new Event('profileUpdated'));
                alert('🎉 Profile updated successfully!');
            } else {
                alert('Update failed: No user data returned');
            }
        } catch (err) {
            console.error('Update detailed error:', err);
            const msg = err.response?.data?.error || err.response?.data?.message || err.message;
            alert('Update failed: ' + msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse">Loading Your Profile...</div>;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="flex items-center gap-3">
                        <User size={28} style={{ color: 'var(--accent)' }} />
                        My Account Settings
                    </h2>
                    <p className="text-muted">Manage your personal information and profile preferences.</p>
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>

                {/* Profile Card */}
                <div className="card text-center flex-col gap-4" style={{ height: 'fit-content', borderTop: '5px solid var(--accent)' }}>
                    <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto' }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '4px solid #fff',
                            boxShadow: 'var(--shadow-lg)',
                            background: '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {formData.profile_photo ? (
                                <img src={formData.profile_photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={64} color="#9ca3af" />
                            )}
                        </div>
                        <label className="camera-btn">
                            <Camera size={18} color="white" />
                            <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                        </label>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <h3 className="m-0">{user?.name}</h3>
                        <p className="badge badge-info mt-2" style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                            <ShieldCheck size={12} style={{ marginRight: '4px' }} />
                            {user?.role}
                        </p>
                    </div>

                    <div style={{ textAlign: 'left', marginTop: '1rem' }} className="flex-col gap-3">
                        <div className="flex items-center gap-3 text-muted" style={{ fontSize: '0.9rem' }}>
                            <Mail size={16} /> {user?.email}
                        </div>
                        {user?.courier_owner && (
                            <div className="flex items-center gap-3 text-muted" style={{ fontSize: '0.9rem' }}>
                                <MapPin size={16} /> {user?.courier_owner}
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-muted" style={{ fontSize: '0.9rem' }}>
                            <Phone size={16} /> {user?.phone || 'Not provided'}
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="card shadow-md">
                    <form onSubmit={handleSubmit} className="flex-col gap-6">
                        <div className="form-group-box">
                            <h4 className="mb-4 border-b pb-2">Basic Details</h4>
                            <div className="flex-col gap-4">
                                <div className="input-group">
                                    <label>Display Name</label>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-v2"
                                        placeholder="Your full name"
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Mobile Number</label>
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="input-v2"
                                        placeholder="Phone number"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group-box">
                            <h4 className="mb-4 border-b pb-2">Login Credentials</h4>
                            <div className="flex-col gap-4">
                                <div className="input-group" style={{ opacity: 0.7 }}>
                                    <label>Registered Email Address</label>
                                    <input value={user?.email} disabled className="input-v2" style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }} />
                                    <span style={{ fontSize: '11px', color: 'var(--accent)' }}>* Email cannot be changed for security purposes.</span>
                                </div>
                            </div>
                        </div>

                        <button disabled={saving} type="submit" className="btn-ship">
                            {saving ? 'Updating...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .camera-btn {
                    position: absolute;
                    bottom: 5px;
                    right: 5px;
                    background: var(--accent);
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border: 3px solid #fff;
                    box-shadow: var(--shadow-md);
                    transition: transform 0.2s;
                }
                .camera-btn:hover { transform: scale(1.1); }
                
                .form-group-box {
                    background: #fff;
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid #f0f0f0;
                }
                .input-group label {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #9ca3af;
                    text-transform: uppercase;
                    margin-bottom: 0.25rem;
                }
                .input-v2 {
                    width: 100%;
                    padding: 0.65rem 1rem;
                    border-radius: 8px;
                    border: 1.5px solid #e5e7eb;
                    background: #fbfbfb;
                    font-family: inherit;
                    font-weight: 500;
                    transition: border-color 0.2s;
                    box-sizing: border-box;
                }
                .input-v2:focus {
                    border-color: var(--accent);
                    outline: none;
                    background: #fff;
                }
                .btn-ship {
                    background: linear-gradient(135deg, var(--accent) 0%, #c06328 100%);
                    color: white;
                    border: none;
                    width: 100%;
                    padding: 1rem;
                    border-radius: 12px;
                    font-weight: 800;
                    cursor: pointer;
                    box-shadow: 0 10px 20px -5px rgba(217, 119, 54, 0.3);
                }
                .btn-ship:disabled { opacity: 0.7; }
            ` }} />
        </div>
    );
};

export default Profile;
