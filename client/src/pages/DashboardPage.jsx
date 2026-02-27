// DashboardPage.jsx — main landing page after login with summary, charts, and recent transactions
import { Alert, Spinner } from 'react-bootstrap';
import useDashboard from '../hooks/useDashboard';
import SummaryCards from '../components/dashboard/SummaryCards';
import SpendingCharts from '../components/dashboard/SpendingCharts';
import RecentTransactions from '../components/dashboard/RecentTransactions';

const DashboardPage = () => {
    const { summary, categoryData, trendsData, recentExpenses, loading, error } = useDashboard();

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 small" style={{ color: 'var(--text-secondary)' }}>
                    Loading your dashboard...
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Page header */}
            <div className="page-header mb-4">
                <h1 className="page-title mb-0">Dashboard</h1>
                <p className="page-subtitle mb-0">Your financial overview at a glance</p>
            </div>

            {/* Error banner */}
            {error && (
                <Alert variant="danger" className="mb-4">
                    <i className="bi bi-exclamation-triangle me-2" />
                    {error}
                </Alert>
            )}

            {/* Four stat cards across the top */}
            <SummaryCards summary={summary} loading={loading} />

            {/* Line chart + pie chart side by side */}
            <SpendingCharts trendsData={trendsData} categoryData={categoryData} />

            {/* Recent transactions list */}
            <RecentTransactions expenses={recentExpenses} />
        </div>
    );
};

export default DashboardPage;
