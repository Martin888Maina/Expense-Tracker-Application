// SpendingCharts.jsx — Recharts line chart (trend) + pie chart (category breakdown)
import { Row, Col } from 'react-bootstrap';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';

// Compact KES formatter for chart axis labels
const shortKES = (value) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value;
};

// Format a period timestamp for the X-axis — shows day and month
const formatPeriod = (value) => {
    if (!value) return '';
    const d = new Date(value);
    return d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short' });
};

// Custom tooltip shown when hovering over the line chart
const TrendTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.8rem',
            }}
        >
            <p className="mb-1 fw-medium">{formatPeriod(label)}</p>
            <p className="mb-0" style={{ color: '#2563EB' }}>
                KES {payload[0]?.value?.toLocaleString()}
            </p>
        </div>
    );
};

// Custom tooltip for the pie chart slices
const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.8rem',
            }}
        >
            <p className="mb-1 fw-medium">{payload[0]?.name}</p>
            <p className="mb-0">
                KES {payload[0]?.value?.toLocaleString()} ({payload[0]?.payload?.percentage}%)
            </p>
        </div>
    );
};

const FALLBACK_COLORS = [
    '#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#9333EA',
    '#0891B2', '#EA580C', '#65A30D', '#DB2777', '#4F46E5',
];

const SpendingCharts = ({ trendsData = [], categoryData = [] }) => {
    // Use the category's own color if available, otherwise fall back to palette
    const getColor = (cat, index) => cat?.category?.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length];

    const hasTrends = trendsData.length > 0;
    const hasCategories = categoryData.length > 0;

    return (
        <Row className="g-4 mb-4">
            {/* Spending Trend Line Chart */}
            <Col xs={12} lg={7}>
                <div
                    className="card h-100"
                    style={{ borderRadius: '12px', border: '1px solid var(--border-color)' }}
                >
                    <div className="card-body p-3 p-md-4">
                        <h6 className="fw-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                            Spending Trend
                        </h6>
                        <p className="small mb-3" style={{ color: 'var(--text-secondary)' }}>
                            Daily spending over the current month
                        </p>

                        {hasTrends ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={trendsData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                    <XAxis
                                        dataKey="period"
                                        tickFormatter={formatPeriod}
                                        tick={{ fontSize: 11, fill: '#94A3B8' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tickFormatter={shortKES}
                                        tick={{ fontSize: 11, fill: '#94A3B8' }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={45}
                                    />
                                    <Tooltip content={<TrendTooltip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#2563EB"
                                        strokeWidth={2.5}
                                        dot={{ r: 3, fill: '#2563EB' }}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                                <i className="bi bi-bar-chart mb-2" style={{ fontSize: '2rem', opacity: 0.4 }} />
                                <p className="small mb-0">Add expenses to see your spending trend</p>
                            </div>
                        )}
                    </div>
                </div>
            </Col>

            {/* Category Breakdown Donut Chart */}
            <Col xs={12} lg={5}>
                <div
                    className="card h-100"
                    style={{ borderRadius: '12px', border: '1px solid var(--border-color)' }}
                >
                    <div className="card-body p-3 p-md-4">
                        <h6 className="fw-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                            Category Breakdown
                        </h6>
                        <p className="small mb-3" style={{ color: 'var(--text-secondary)' }}>
                            Spending by category this month
                        </p>

                        {hasCategories ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        dataKey="total"
                                        nameKey={(entry) => entry.category?.name || 'Other'}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={2}
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={entry.categoryId || index} fill={getColor(entry, index)} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<PieTooltip />} />
                                    <Legend
                                        formatter={(value) => (
                                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                                {value}
                                            </span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                                <i className="bi bi-pie-chart mb-2" style={{ fontSize: '2rem', opacity: 0.4 }} />
                                <p className="small mb-0">No category data for this month</p>
                            </div>
                        )}
                    </div>
                </div>
            </Col>
        </Row>
    );
};

export default SpendingCharts;
