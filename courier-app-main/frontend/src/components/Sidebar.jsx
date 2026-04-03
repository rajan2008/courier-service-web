import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, MapPin, LogOut, FileText, User, X } from 'lucide-react';
import '../index.css';

const Sidebar = ({ isOpen, closeSidebar }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { path: '/dashboard/shipments', label: 'Documents / Orders', icon: FileText },
        { path: '/dashboard/book', label: 'Book Shipment', icon: MapPin },
        ...(isAdmin ? [{ path: '/dashboard/employees', label: 'Employees', icon: Users }] : []),
        { path: '/dashboard/profile', label: 'My Profile', icon: User },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-logo flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Package size={28} color="var(--accent)" />
                    <span>CourierWithUs</span>
                </div>
                {/* Mobile Close Button */}
                <button
                    onClick={closeSidebar}
                    className="flex md-hidden"
                    style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: isOpen ? 'block' : 'none' }}
                >
                    <X size={24} />
                </button>
            </div>

            <nav className="flex-col gap-2" style={{ flex: 1 }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <item.icon size={20} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <button onClick={handleLogout} className="nav-item" style={{ marginTop: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%' }}>
                <LogOut size={20} />
                Log Out
            </button>
        </aside>
    );
};

export default Sidebar;
