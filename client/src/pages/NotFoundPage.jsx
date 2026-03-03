// NotFoundPage.jsx — shown when a user navigates to a route that does not exist
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                textAlign: 'center',
                padding: '2rem',
                background: 'var(--bg-page)',
            }}
        >
            <div
                style={{
                    fontSize: '5rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                    lineHeight: 1,
                    marginBottom: '0.5rem',
                }}
            >
                404
            </div>
            <h2
                style={{
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem',
                }}
            >
                Page not found
            </h2>
            <p
                style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    maxWidth: '320px',
                    marginBottom: '1.75rem',
                }}
            >
                The page you are looking for does not exist or has been moved.
            </p>
            <Link
                to="/dashboard"
                className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2"
                style={{ borderRadius: '8px' }}
            >
                <i className="bi bi-house" />
                Back to Dashboard
            </Link>
        </div>
    );
};

export default NotFoundPage;
