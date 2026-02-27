// SummaryCards.jsx — top-of-dashboard summary stat cards
import { Row, Col, Spinner } from 'react-bootstrap';

// Format money amounts in Kenyan Shillings
const formatKES = (amount) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

// A single stat card — used four times across the top row
const StatCard = ({ icon, label, value, sub, subColor = '#64748B', iconBg, iconColor }) => (
    <div
        className="card h-100"
        style={{
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
    >
        <div className="card-body d-flex align-items-center gap-3 p-3">
            {/* Icon blob */}
            <div
                style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <i className={`bi ${icon}`} style={{ fontSize: '1.2rem', color: iconColor }} />
            </div>

            {/* Text */}
            <div className="min-w-0">
                <p className="small mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {label}
                </p>
                <p
                    className="mb-0 fw-bold"
                    style={{ fontSize: '1.1rem', fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)' }}
                >
                    {value}
                </p>
                {sub && (
                    <p className="small mb-0 mt-1" style={{ color: subColor }}>
                        {sub}
                    </p>
                )}
            </div>
        </div>
    </div>
);

const SummaryCards = ({ summary, loading }) => {
    if (loading) {
        return (
            <div className="text-center py-4">
                <Spinner animation="border" size="sm" variant="primary" />
            </div>
        );
    }

    const { totalSpent = 0, todayTotal = 0, percentChange = 0, topCategory = null } = summary || {};

    // Determine color of the month-over-month change indicator
    const changeColor = percentChange > 0 ? '#DC2626' : percentChange < 0 ? '#16A34A' : '#64748B';
    const changeLabel =
        percentChange === 0
            ? 'Same as last month'
            : `${percentChange > 0 ? '+' : ''}${percentChange}% vs last month`;

    return (
        <Row className="g-3 mb-4">
            <Col xs={12} sm={6} xl={3}>
                <StatCard
                    icon="bi-graph-up-arrow"
                    label="Total Spent This Month"
                    value={formatKES(totalSpent)}
                    sub={changeLabel}
                    subColor={changeColor}
                    iconBg="#EFF6FF"
                    iconColor="#2563EB"
                />
            </Col>

            <Col xs={12} sm={6} xl={3}>
                <StatCard
                    icon="bi-calendar-day"
                    label="Today's Spending"
                    value={formatKES(todayTotal)}
                    sub="Running total for today"
                    iconBg="#F0FDF4"
                    iconColor="#16A34A"
                />
            </Col>

            <Col xs={12} sm={6} xl={3}>
                <StatCard
                    icon="bi-calculator"
                    label="Daily Average"
                    value={formatKES(summary?.averageDailySpend || 0)}
                    sub="Average spend per day this month"
                    iconBg="#FFF7ED"
                    iconColor="#EA580C"
                />
            </Col>

            <Col xs={12} sm={6} xl={3}>
                <StatCard
                    icon={topCategory?.icon ? topCategory.icon : 'bi-tag'}
                    label="Top Category"
                    value={topCategory?.name || '—'}
                    sub={topCategory ? formatKES(topCategory.total) + ' this month' : 'No expenses yet'}
                    iconBg="#FDF4FF"
                    iconColor="#9333EA"
                />
            </Col>
        </Row>
    );
};

export default SummaryCards;
