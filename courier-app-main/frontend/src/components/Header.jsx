import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
import '../index.css';

const Header = ({ toggleSidebar }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

    useEffect(() => {
        const handleUpdate = () => {
            setUser(JSON.parse(localStorage.getItem('user') || '{}'));
        };
        window.addEventListener('profileUpdated', handleUpdate);
        return () => window.removeEventListener('profileUpdated', handleUpdate);
    }, []);

    return (
        <header className="flex items-center justify-between" style={{ marginBottom: '2rem', padding: '0.5rem 0', gap: '1rem' }}>
            <div className="flex items-center gap-4" style={{ flex: 1, maxWidth: '600px' }}>
                {/* Burger Menu for Mobile */}
                <button
                    onClick={toggleSidebar}
                    className="btn btn-outline mobile-only-flex"
                    style={{ padding: '0.5rem', border: 'none', display: 'none' }}
                >
                    <Menu size={24} color="var(--primary)" />
                </button>

                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" placeholder="Search orders..." className="input" style={{ paddingLeft: '3rem' }} />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="btn btn-outline" style={{ borderRadius: '50%', padding: '0.5rem', border: 'none' }}>
                    <Bell size={20} color="var(--primary)" />
                </button>
                <div className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {user.profile_photo ? (
                            <img
                                src={user.profile_photo}
                                alt="User"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <User size={20} color="var(--text-muted)" />
                        )}
                    </div>
                    <div className="desktop-only">
                        <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>{user.name || (user.role === 'admin' ? 'Super Admin' : 'User')}</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role?.replace('_', ' ') || 'Guest'}</span>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 768px) {
                    .mobile-only-flex { display: flex !important; }
                    .desktop-only { display: none !important; }
                }
            ` }} />
        </header>
    );
};

export default Header;
