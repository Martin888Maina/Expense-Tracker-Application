import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from 'react-bootstrap';

// ProtectedRoute wraps pages that require an authenticated user.
// While the auth state is being verified on first load, it shows a spinner
// rather than briefly flashing the login page.
const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <Spinner animation="border" style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    // Redirect to login if there is no authenticated user
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
