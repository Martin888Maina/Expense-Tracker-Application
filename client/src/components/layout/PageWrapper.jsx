import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

// PageWrapper is the root layout for all authenticated pages.
// It combines the sidebar, sticky topbar, and the page content area.
const PageWrapper = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="app-layout">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="app-main">
                <Topbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
                <main className="app-content">
                    {/* Outlet renders the currently active child route */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default PageWrapper;
