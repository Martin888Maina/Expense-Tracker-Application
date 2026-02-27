import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// Main sidebar navigation — always visible on desktop, slides in on mobile
const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navLinks = [
        { to: '/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
        { to: '/expenses', icon: 'bi-receipt', label: 'Expenses' },
        { to: '/budgets', icon: 'bi-wallet2', label: 'Budgets' },
        { to: '/reports', icon: 'bi-bar-chart-line', label: 'Reports' },
        { to: '/categories', icon: 'bi-tags', label: 'Categories' },
        { to: '/settings', icon: 'bi-gear', label: 'Settings' },
    ];

    return (
        <>
            {/* Mobile overlay — clicking it closes the sidebar */}
            {isOpen && (
                <div
                    className="d-md-none"
                    onClick={onClose}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.4)',
                        zIndex: 99,
                    }}
                />
            )}

            <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
                {/* Brand */}
                <NavLink to="/dashboard" className="sidebar-brand" onClick={onClose}>
                    <i className="bi bi-piggy-bank-fill" style={{ fontSize: '1.3rem' }} />
                    <span>ExpenseTracker</span>
                </NavLink>

                {/* User info snippet */}
                <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <div className="d-flex align-items-center gap-2">
                        <div
                            style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'var(--primary-light)',
                                color: 'var(--primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: '0.85rem',
                            }}
                        >
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{user?.currency || 'KES'}</div>
                        </div>
                    </div>
                </div>

                {/* Navigation links */}
                <ul className="sidebar-nav">
                    {navLinks.map((link) => (
                        <li key={link.to} className="sidebar-nav-item">
                            <NavLink
                                to={link.to}
                                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <i className={`bi ${link.icon}`} />
                                <span>{link.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>

                {/* Bottom actions */}
                <div style={{ marginTop: 'auto', padding: '0.75rem 0.5rem', borderTop: '1px solid var(--border-color)' }}>
                    <button
                        className="sidebar-nav-link w-100 border-0 bg-transparent"
                        onClick={toggleTheme}
                        style={{ cursor: 'pointer' }}
                    >
                        <i className={`bi ${isDark ? 'bi-sun' : 'bi-moon'}`} />
                        <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <button
                        className="sidebar-nav-link w-100 border-0 bg-transparent text-danger"
                        onClick={handleLogout}
                        style={{ cursor: 'pointer' }}
                    >
                        <i className="bi bi-box-arrow-left" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
