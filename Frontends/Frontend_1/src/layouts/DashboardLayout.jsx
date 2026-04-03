import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../index.css';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);
    const toggleSidebarCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    return (
        <div className="main-layout">
            {/* Mobile Overlay */}
            <div
                className={`mobile-overlay ${isSidebarOpen ? 'visible' : ''}`}
                onClick={closeSidebar}
            />

            <Sidebar
                isOpen={isSidebarOpen}
                closeSidebar={closeSidebar}
                isCollapsed={isSidebarCollapsed}
                toggleCollapse={toggleSidebarCollapse}
            />

            <div className={`main-content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                <Header toggleSidebar={toggleSidebar} />
                <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
