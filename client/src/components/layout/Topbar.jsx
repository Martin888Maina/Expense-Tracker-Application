import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Top navigation bar — sticky at the top of the main content area
const Topbar = ({ onMenuToggle }) => {
    const { user } = useAuth();

    return (
        <header className="app-topbar">
            {/* Hamburger button — only shown on mobile */}
            <button
                className="btn btn-link p-0 d-md-none"
                onClick={onMenuToggle}
                style={{ color: 'var(--text-secondary)', fontSize: '1.3rem' }}
                aria-label="Open menu"
            >
                <i className="bi bi-list" />
            </button>

            {/* Page breadcrumb spacer */}
            <div className="flex-grow-1" />

            {/* Right-side actions */}
            <div className="d-flex align-items-center gap-3">
                {/* Quick add expense button */}
                <Link to="/expenses" className="btn btn-primary btn-sm d-flex align-items-center gap-1">
                    <i className="bi bi-plus-lg" />
                    <span className="d-none d-sm-inline">Add Expense</span>
                </Link>

                {/* User initials avatar */}
                <div
                    style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.875rem',
                        cursor: 'default',
                    }}
                    title={user?.name}
                >
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
