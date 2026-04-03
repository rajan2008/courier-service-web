import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Phone, Mail, Camera, Save, ShieldCheck, MapPin, Edit3 } from 'lucide-react';
import '../index.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        profile_photo: ''
    });

    useEffect(() => { fetchProfile(); }, []);

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
        } finally { setLoading(false); }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, profile_photo: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/users/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Success!'); window.location.reload();
        } catch (err) { alert('Update Failed'); } finally { setSaving(false); }
    };

    if (loading) return <div className="p-12 text-center text-muted">Analyzing Identity...</div>;

    return (
        <div className="animate-fade-in" style={{ color: 'var(--text-main)', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="mb-10">
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>Identity Core</h1>
                <p className="text-muted" style={{ fontSize: '1rem' }}>Manage your global credentials and secure profile attributes.</p>
            </div>

            <div className="profile-layout">
                {/* Visual Identity Aside */}
                <aside className="profile-aside card-v3 text-center">
                    <div className="profile-avatar-container">
                        <div className="profile-avatar-inner">
                            {formData.profile_photo ? (
                                <img src={formData.profile_photo} alt="Identity" />
                            ) : (
                                <User size={64} className="text-muted" />
                            )}
                        </div>
                        <label className="avatar-edit-btn">
                            <Camera size={18} color="white" />
                            <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                        </label>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{user?.name}</h2>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--divider)', padding: '4px 12px', borderRadius: '20px', marginTop: '12px' }}>
                            <ShieldCheck size={14} color="var(--accent)" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user?.role}</span>
                        </div>
                    </div>

                    <div className="profile-meta flex-col gap-4 mt-8">
                        <MetaItem icon={Mail} text={user?.email} />
                        <MetaItem icon={Phone} text={user?.phone || 'NO LINK'} />
                        <MetaItem icon={MapPin} text={user?.courier_owner || 'GLOBAL HUB'} />
                    </div>
                </aside>

                {/* Form Main */}
                <main className="profile-main card-v3">
                    <form onSubmit={handleSubmit} className="flex-col gap-8">
                        <div>
                            <h3 className="section-title">Attribute Synchronization</h3>
                            <div className="grid-2 gap-6">
                                <InputFieldV3 label="Full Identity Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} icon={Edit3} />
                                <InputFieldV3 label="Primary Contact Link" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} icon={Phone} />
                            </div>
                        </div>

                        <div>
                            <h3 className="section-title">Secure Registry (ReadOnly)</h3>
                            <div className="input-group-v3 disabled">
                                <label>System ID Mapping</label>
                                <div className="input-v3-inner">
                                    <Mail size={16} />
                                    <input value={user?.email} disabled />
                                </div>
                                <span className="helper-text">Identification email is hard-linked to your account.</span>
                            </div>
                        </div>

                        <button type="submit" disabled={saving} className="btn-save-v3">
                            {saving ? 'Synchronizing...' : <><Save size={20} /> Deploy Changes</>}
                        </button>
                    </form>
                </main>
            </div>

            <style>{`
                .profile-layout { display: grid; grid-template-columns: 320px 1fr; gap: 2.5rem; align-items: start; }
                .card-v3 { background: var(--surface); border: 1px solid var(--border); border-radius: 30px; padding: 2.5rem; }
                .profile-avatar-container { position: relative; width: 180px; height: 180px; margin: 0 auto; }
                .profile-avatar-inner { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; border: 6px solid var(--divider); background: var(--input-bg); display: flex; align-items: center; justify-content: center; }
                .profile-avatar-inner img { width: 100%; height: 100%; object-fit: cover; }
                .avatar-edit-btn { position: absolute; bottom: 8px; right: 8px; width: 44px; height: 44px; background: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 4px solid var(--surface); box-shadow: var(--shadow); transition: transform 0.2s; }
                .avatar-edit-btn:hover { transform: scale(1.1) rotate(10deg); }
                .section-title { font-size: 0.8rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2rem; border-bottom: 1px solid var(--divider); padding-bottom: 1rem; }
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .btn-save-v3 { background: var(--accent); color: white; border: none; padding: 1.2rem; border-radius: 18px; font-weight: 800; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; transition: all 0.3s; box-shadow: 0 10px 30px -10px var(--accent); }
                .btn-save-v3:hover { transform: translateY(-3px); box-shadow: 0 15px 35px -10px var(--accent); }
                .input-group-v3 { display: flex; flex-direction: column; gap: 0.5rem; }
                .input-group-v3.disabled { opacity: 0.7; }
                .input-group-v3 label { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
                .input-v3-inner { display: flex; items-center: center; gap: 12px; background: var(--input-bg); border: 1px solid var(--border); padding: 0 1.2rem; border-radius: 14px; color: var(--text-muted); }
                .input-v3-inner input { background: transparent; border: none; padding: 1rem 0; width: 100%; color: var(--text-main); font-weight: 700; outline: none; }
                .helper-text { font-size: 0.7rem; color: var(--accent); font-weight: 600; }
                
                @media (max-width: 900px) {
                    .profile-layout { grid-template-columns: 1fr; }
                    .grid-2 { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

const MetaItem = ({ icon: Icon, text }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} /></div>
        <span style={{ fontWeight: 600 }}>{text}</span>
    </div>
);

const InputFieldV3 = ({ label, value, onChange, icon: Icon }) => (
    <div className="input-group-v3">
        <label>{label}</label>
        <div className="input-v3-inner" style={{ background: 'var(--input-bg)' }}>
            <Icon size={16} className="text-muted" />
            <input value={value} onChange={e => onChange(e.target.value)} placeholder={`Entry...`} />
        </div>
    </div>
);

export default Profile;
