import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Menu, Moon, Sun } from 'lucide-react';
import '../index.css';

const Header = ({ toggleSidebar }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        const handleUpdate = () => {
            setUser(JSON.parse(localStorage.getItem('user') || '{}'));
        };
        window.addEventListener('profileUpdated', handleUpdate);
        return () => window.removeEventListener('profileUpdated', handleUpdate);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        window.dispatchEvent(new Event('cursor-updated')); // Ensure cursor reacts to theme change
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <header className="flex items-center justify-between" style={{ marginBottom: '2rem', padding: '0.5rem 0', gap: '1rem' }}>
            <div className="flex items-center gap-4" style={{ flex: 1, maxWidth: '600px' }}>
                {/* Mobile Toggle Burger */}
                <button
                    onClick={toggleSidebar}
                    className="mobile-only-flex header-action-btn"
                >
                    <Menu size={22} color="var(--primary)" />
                </button>

                <div className="search-container" style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" placeholder="Track shipment..." className="input" style={{ paddingLeft: '3rem' }} />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {/* Theme Toggle */}
                <button onClick={toggleTheme} className="header-action-btn">
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <button className="header-action-btn desktop-only">
                    <Bell size={20} />
                </button>

                <div className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        {user.profile_photo ? (
                            <img
                                src={user.profile_photo}
                                alt="User"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'; }}
                            />
                        ) : (
                            <User size={18} color="var(--text-muted)" />
                        )}
                    </div>
                    <div className="desktop-only text-main">
                        <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>{user.name?.split(' ')[0]}</span>
                    </div>
                </div>
            </div>

            <style>{`
                .header-action-btn {
                    background: var(--glass);
                    border: 1px solid var(--border);
                    color: var(--primary);
                    padding: 0.6rem;
                    border-radius: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                .header-action-btn:hover {
                    background: var(--surface-hover);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                @media (max-width: 768px) {
                    .desktop-only { display: none !important; }
                    .search-container { max-width: 150px !important; }
                }
            `}</style>
        </header>
    );
};

export default Header;
