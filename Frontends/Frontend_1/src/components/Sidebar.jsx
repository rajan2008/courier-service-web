import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, MapPin, LogOut, FileText, User, X, ChevronLeft, ChevronRight, Settings, Truck } from 'lucide-react';
import '../index.css';

const Sidebar = ({ isOpen, closeSidebar, isCollapsed, toggleCollapse }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';

    const isDriver = user.role === 'employee';
    const isCustomer = user.role === 'customer';
    const isCourierAdmin = user.role === 'courier_admin';

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
        {
            path: '/dashboard/shipments',
            label: isCustomer ? 'My Orders' : (isDriver ? 'My Pickups / Deliveries' : 'All Shipments'),
            icon: isDriver ? Truck : FileText
        },
        ...(!isDriver ? [{ path: '/dashboard/book', label: 'Book Shipment', icon: MapPin }] : []),
        ...(isAdmin || isCourierAdmin ? [{ path: '/dashboard/employees', label: 'Employees', icon: Users }] : []),
        { path: '/dashboard/profile', label: 'My Profile', icon: User },
        { path: '/dashboard/settings', label: 'Settings', icon: Settings },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <aside className={`sidebar ${isOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
            
            {/* Sidebar Header with Mobile Close Button */}
            <div className="flex items-center justify-between" style={{ marginBottom: '2.5rem' }}>
                <div className="flex items-center justify-center" style={{ flex: 1 }}>
                    <img
                        src={isAdmin ? "/logo-pro.png" : "/logo.png"}
                        alt="Logo"
                        style={{ height: isCollapsed ? '40px' : '65px', width: 'auto', transition: 'all 0.3s' }}
                    />
                </div>
                
                {/* Close Button UI for Mobile only */}
                <button 
                    onClick={closeSidebar} 
                    className="mobile-only-flex"
                    style={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem', color: 'white', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-col gap-2" style={{ flex: 1 }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        onClick={() => { if (window.innerWidth < 1024) closeSidebar(); }}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        title={isCollapsed ? item.label : ''}
                    >
                        <item.icon size={22} className="min-w-[22px]" />
                        {!isCollapsed && <span className="label" style={{ marginLeft: '12px', whiteSpace: 'nowrap' }}>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button onClick={handleLogout} className="nav-item logout-btn" style={{ border: 'none', cursor: 'pointer', width: '100%', background: 'transparent', color: 'var(--danger)' }}>
                    <LogOut size={22} />
                    {!isCollapsed && <span style={{ marginLeft: '12px' }}>Log Out</span>}
                </button>

                {/* Desktop Collapse Toggle */}
                <button
                    onClick={toggleCollapse}
                    className="desktop-only-flex collapse-toggle"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <style>{`
                .collapse-toggle {
                    margin-top: 1rem;
                    background: var(--glass);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 0.8rem;
                    width: 100%;
                    cursor: pointer;
                    color: white;
                    display: flex;
                    justify-content: center;
                    alignItems: center;
                    transition: all 0.2s;
                }
                .collapse-toggle:hover {
                    background: var(--surface-hover);
                    transform: scale(1.02);
                }
                @media (max-width: 1024px) {
                    .desktop-only-flex { display: none !important; }
                    .mobile-only-flex { display: flex !important; }
                }
                @media (min-width: 1025px) {
                    .mobile-only-flex { display: none !important; }
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;
