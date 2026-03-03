// ReportsPage.jsx — analytics page with date range selector, summary stats, charts, and CSV export
import { useState } from 'react';
import { Row, Col, Button, Alert, Spinner, Table } from 'react-bootstrap';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from 'recharts';
import reportService from '../services/reportService';
import expenseService from '../services/expenseService';

const formatKES = (amount) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

// Compact axis formatter
const shortKES = (v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v);

const FALLBACK_COLORS = [
    '#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#9333EA',
    '#0891B2', '#EA580C', '#65A30D', '#DB2777', '#4F46E5',
];

// Date range preset definitions — mapped to start/end date strings
const PRESETS = [
    { label: 'This Month', value: 'month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'Last 3 Months', value: '3months' },
    { label: 'Last 6 Months', value: '6months' },
    { label: 'This Year', value: 'year' },
];

const getPresetDates = (preset) => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    switch (preset) {
        case 'month': {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            return { startDate: fmt(start), endDate: fmt(now) };
        }
        case 'last_month': {
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 0);
            return { startDate: fmt(start), endDate: fmt(end) };
        }
        case '3months': {
            const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
            return { startDate: fmt(start), endDate: fmt(now) };
        }
        case '6months': {
            const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
            return { startDate: fmt(start), endDate: fmt(now) };
        }
        case 'year': {
            const start = new Date(now.getFullYear(), 0, 1);
            return { startDate: fmt(start), endDate: fmt(now) };
        }
        default:
            return { startDate: '', endDate: fmt(now) };
    }
};

// Custom bar chart tooltip
const BarTooltip = ({ active, payload }) => {
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
            <p className="mb-1 fw-medium">{payload[0]?.payload?.name}</p>
            <p className="mb-0" style={{ color: '#2563EB' }}>
                {formatKES(payload[0]?.value)}
            </p>
            <p className="mb-0" style={{ color: '#64748B' }}>
                {payload[0]?.payload?.percentage}% of total
            </p>
        </div>
    );
};

const ReportsPage = () => {
    const [activePreset, setActivePreset] = useState('month');
    const [dates, setDates] = useState(() => getPresetDates('month'));
    const [summary, setSummary] = useState(null);
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);

    // Load report data initially on mount
    const [initialLoad, setInitialLoad] = useState(false);
    if (!initialLoad) {
        setInitialLoad(true);
        fetchReports(getPresetDates('month'));
    }

    function fetchReports(params) {
        setLoading(true);
        setError(null);
        Promise.all([
            reportService.getSummary(params),
            reportService.getByCategory(params),
        ])
            .then(([summaryRes, catRes]) => {
                setSummary(summaryRes.data.data);
                setCategoryData(catRes.data.data || []);
            })
            .catch(() => setError('Failed to load report data. Please try again.'))
            .finally(() => setLoading(false));
    }

    const handlePreset = (preset) => {
        setActivePreset(preset);
        const d = getPresetDates(preset);
        setDates(d);
        fetchReports(d);
    };

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            await expenseService.exportExpensesCSV(dates);
        } finally {
            setExporting(false);
        }
    };

    // Prepare bar chart data — category name + total
    const chartData = categoryData.map((c, i) => ({
        name: c.category?.name || 'Other',
        total: c.total,
        percentage: c.percentage,
        color: c.category?.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }));

    const grandTotal = categoryData.reduce((sum, c) => sum + c.total, 0);

    return (
        <div>
            {/* Page header */}
            <div className="page-header d-flex align-items-start justify-content-between mb-4 flex-wrap gap-2">
                <div>
                    <h1 className="page-title mb-0">Reports</h1>
                    <p className="page-subtitle mb-0">Analyse your financial trends and export data</p>
                </div>
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleExportCSV}
                    disabled={exporting}
                    className="d-flex align-items-center gap-2"
                >
                    {exporting ? (
                        <Spinner size="sm" animation="border" />
                    ) : (
                        <i className="bi bi-download" />
                    )}
                    Export CSV
                </Button>
            </div>

            {/* Date range preset selector */}
            <div
                className="card mb-4"
                style={{ borderRadius: '12px', border: '1px solid var(--border-color)' }}
            >
                <div className="card-body p-3">
                    <p className="small fw-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Report Period
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                        {PRESETS.map((p) => (
                            <button
                                key={p.value}
                                type="button"
                                className={`btn btn-sm ${activePreset === p.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                                style={{ borderRadius: '20px', fontSize: '0.8rem' }}
                                onClick={() => handlePreset(p.value)}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {error && (
                <Alert variant="danger" className="mb-4">
                    <i className="bi bi-exclamation-triangle me-2" />
                    {error}
                </Alert>
            )}

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 small" style={{ color: 'var(--text-secondary)' }}>
                        Loading report data...
                    </p>
                </div>
            ) : (
                <>
                    {/* Summary stat cards */}
                    {summary && (
                        <Row className="g-3 mb-4">
                            {[
                                { label: 'Total Spent', value: formatKES(summary.totalSpent), icon: 'bi-receipt', bg: '#EFF6FF', clr: '#2563EB' },
                                { label: 'Daily Average', value: formatKES(summary.averageDailySpend), icon: 'bi-calculator', bg: '#F0FDF4', clr: '#16A34A' },
                                { label: "Today's Spending", value: formatKES(summary.todayTotal), icon: 'bi-calendar-day', bg: '#FFF7ED', clr: '#EA580C' },
                                {
                                    label: 'vs Last Month',
                                    value: summary.percentChange === 0 ? 'No change' : `${summary.percentChange > 0 ? '+' : ''}${summary.percentChange}%`,
                                    icon: summary.percentChange >= 0 ? 'bi-arrow-up-right' : 'bi-arrow-down-right',
                                    bg: summary.percentChange > 0 ? '#FEF2F2' : '#F0FDF4',
                                    clr: summary.percentChange > 0 ? '#DC2626' : '#16A34A',
                                },
                            ].map((s) => (
                                <Col key={s.label} xs={6} lg={3}>
                                    <div
                                        className="card h-100"
                                        style={{ borderRadius: '12px', border: '1px solid var(--border-color)' }}
                                    >
                                        <div className="card-body p-3 d-flex align-items-center gap-3">
                                            <div
                                                style={{
                                                    width: '40px', height: '40px', borderRadius: '10px',
                                                    background: s.bg, display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', flexShrink: 0,
                                                }}
                                            >
                                                <i className={`bi ${s.icon}`} style={{ color: s.clr, fontSize: '1.1rem' }} />
                                            </div>
                                            <div>
                                                <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
                                                <p className="fw-bold mb-0" style={{ fontVariantNumeric: 'tabular-nums' }}>{s.value}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    )}

                    <Row className="g-4">
                        {/* Category bar chart */}
                        <Col xs={12} lg={7}>
                            <div
                                className="card h-100"
                                style={{ borderRadius: '12px', border: '1px solid var(--border-color)' }}
                            >
                                <div className="card-body p-3 p-md-4">
                                    <h6 className="fw-semibold mb-3">Spending by Category</h6>
                                    {chartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={260}>
                                            <BarChart
                                                data={chartData}
                                                layout="vertical"
                                                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                                                <XAxis
                                                    type="number"
                                                    tickFormatter={shortKES}
                                                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    type="category"
                                                    dataKey="name"
                                                    width={90}
                                                    tick={{ fontSize: 11, fill: '#64748B' }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <Tooltip content={<BarTooltip />} />
                                                <Bar dataKey="total" radius={[0, 6, 6, 0]} maxBarSize={24}>
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>
                                            <i className="bi bi-bar-chart mb-2" style={{ fontSize: '2rem', opacity: 0.4 }} />
                                            <p className="small mb-0">No expense data for this period</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>

                        {/* Category breakdown table */}
                        <Col xs={12} lg={5}>
                            <div
                                className="card h-100"
                                style={{ borderRadius: '12px', border: '1px solid var(--border-color)' }}
                            >
                                <div className="card-body p-3 p-md-4">
                                    <h6 className="fw-semibold mb-3">Category Breakdown</h6>
                                    {categoryData.length > 0 ? (
                                        <Table className="mb-0" style={{ fontSize: '0.85rem' }}>
                                            <thead>
                                                <tr>
                                                    <th>Category</th>
                                                    <th className="text-end">Amount</th>
                                                    <th className="text-end">%</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {categoryData.map((c, i) => (
                                                    <tr key={c.categoryId || i}>
                                                        <td>
                                                            <span className="d-flex align-items-center gap-2">
                                                                <span
                                                                    style={{
                                                                        width: '8px', height: '8px', borderRadius: '50%',
                                                                        background: c.category?.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
                                                                        display: 'inline-block', flexShrink: 0,
                                                                    }}
                                                                />
                                                                {c.category?.name || 'Other'}
                                                            </span>
                                                        </td>
                                                        <td className="text-end" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                                            {formatKES(c.total)}
                                                        </td>
                                                        <td className="text-end" style={{ color: 'var(--text-secondary)' }}>
                                                            {c.percentage}%
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="fw-semibold">
                                                    <td>Total</td>
                                                    <td className="text-end" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                                        {formatKES(grandTotal)}
                                                    </td>
                                                    <td className="text-end">100%</td>
                                                </tr>
                                            </tfoot>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>
                                            <i className="bi bi-table mb-2" style={{ fontSize: '2rem', opacity: 0.4 }} />
                                            <p className="small mb-0">No data for this period</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};

export default ReportsPage;
