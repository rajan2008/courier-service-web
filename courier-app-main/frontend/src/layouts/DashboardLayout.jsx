import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../index.css';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="flex" style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
            {/* Mobile Overlay */}
            <div
                className={`mobile-overlay ${isSidebarOpen ? 'visible' : ''}`}
                onClick={closeSidebar}
            />

            <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />

            <div className="main-content" style={{ flex: 1, padding: '2rem', marginLeft: '260px', overflowY: 'auto', background: 'var(--bg-main)' }}>
                <Header toggleSidebar={toggleSidebar} />
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
