// ExpenseFilters.jsx — filter controls for the expense list
import { useState, useEffect } from 'react';
import { Form, Button, Badge, InputGroup, Row, Col } from 'react-bootstrap';

// Quick date range presets to make filtering faster for common cases
const DATE_PRESETS = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Last Month', value: 'last_month' },
];

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'mpesa', label: 'M-Pesa' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'card', label: 'Card' },
];

// Calculate start/end dates for a given preset key
const getPresetDates = (preset) => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    switch (preset) {
        case 'today': {
            const t = fmt(now);
            return { startDate: t, endDate: t };
        }
        case 'week': {
            const day = now.getDay();
            const monday = new Date(now);
            monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
            return { startDate: fmt(monday), endDate: fmt(now) };
        }
        case 'month': {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            return { startDate: fmt(start), endDate: fmt(now) };
        }
        case 'last_month': {
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 0);
            return { startDate: fmt(start), endDate: fmt(end) };
        }
        default:
            return { startDate: '', endDate: '' };
    }
};

// Count how many non-empty filter values are currently active
const countActiveFilters = (filters) =>
    Object.values(filters).filter((v) => v !== '').length;

const ExpenseFilters = ({ filters, onFilter, onClear, categories }) => {
    const [local, setLocal] = useState(filters);
    const [activePreset, setActivePreset] = useState('');

    // Keep local state in sync when parent resets/clears filters
    useEffect(() => {
        setLocal(filters);
        const hasPreset = filters.startDate || filters.endDate;
        if (!hasPreset) setActivePreset('');
    }, [filters]);

    const handleChange = (field, value) => {
        setLocal((prev) => ({ ...prev, [field]: value }));
    };

    const handleApply = () => {
        onFilter(local);
    };

    const handlePreset = (preset) => {
        setActivePreset(preset);
        const dates = getPresetDates(preset);
        const updated = { ...local, ...dates };
        setLocal(updated);
        onFilter(updated);
    };

    const handleClear = () => {
        setActivePreset('');
        onClear();
    };

    const activeCount = countActiveFilters(filters);

    return (
        <div
            className="card mb-4"
            style={{ borderRadius: '12px', border: '1px solid var(--border-color)' }}
        >
            <div className="card-body p-3">
                {/* Quick date presets */}
                <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
                    <span className="small fw-medium" style={{ color: 'var(--text-secondary)' }}>
                        Quick:
                    </span>
                    {DATE_PRESETS.map((p) => (
                        <button
                            key={p.value}
                            type="button"
                            className={`btn btn-sm ${activePreset === p.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                            style={{ borderRadius: '20px', fontSize: '0.78rem' }}
                            onClick={() => handlePreset(p.value)}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Filter controls */}
                <Row className="g-2 align-items-end">
                    {/* Text search */}
                    <Col xs={12} sm={6} md={3}>
                        <Form.Label className="small mb-1">Search</Form.Label>
                        <InputGroup size="sm">
                            <InputGroup.Text style={{ background: 'transparent' }}>
                                <i className="bi bi-search" />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Description or notes..."
                                value={local.search}
                                onChange={(e) => handleChange('search', e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                            />
                        </InputGroup>
                    </Col>

                    {/* Category filter */}
                    <Col xs={12} sm={6} md={3}>
                        <Form.Label className="small mb-1">Category</Form.Label>
                        <Form.Select
                            size="sm"
                            value={local.categoryId}
                            onChange={(e) => handleChange('categoryId', e.target.value)}
                        >
                            <option value="">All categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>

                    {/* Payment method filter */}
                    <Col xs={12} sm={6} md={2}>
                        <Form.Label className="small mb-1">Payment</Form.Label>
                        <Form.Select
                            size="sm"
                            value={local.paymentMethod}
                            onChange={(e) => handleChange('paymentMethod', e.target.value)}
                        >
                            <option value="">All methods</option>
                            {PAYMENT_METHODS.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>

                    {/* Custom date range */}
                    <Col xs={6} sm={3} md={2}>
                        <Form.Label className="small mb-1">From</Form.Label>
                        <Form.Control
                            type="date"
                            size="sm"
                            value={local.startDate}
                            onChange={(e) => {
                                setActivePreset('');
                                handleChange('startDate', e.target.value);
                            }}
                        />
                    </Col>
                    <Col xs={6} sm={3} md={2}>
                        <Form.Label className="small mb-1">To</Form.Label>
                        <Form.Control
                            type="date"
                            size="sm"
                            value={local.endDate}
                            onChange={(e) => {
                                setActivePreset('');
                                handleChange('endDate', e.target.value);
                            }}
                        />
                    </Col>
                </Row>

                {/* Apply / Clear buttons */}
                <div className="d-flex align-items-center justify-content-between mt-3">
                    <div>
                        {activeCount > 0 && (
                            <Badge bg="primary" pill className="me-2">
                                {activeCount} active filter{activeCount > 1 ? 's' : ''}
                            </Badge>
                        )}
                    </div>
                    <div className="d-flex gap-2">
                        {activeCount > 0 && (
                            <Button variant="outline-secondary" size="sm" onClick={handleClear}>
                                Clear All
                            </Button>
                        )}
                        <Button variant="primary" size="sm" onClick={handleApply}>
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseFilters;
