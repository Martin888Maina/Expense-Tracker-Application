// BudgetCard.jsx — individual budget card showing progress, spending, and status
import { ProgressBar, Badge, Button } from 'react-bootstrap';

const formatKES = (amount) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

// Return a status label and Bootstrap color variant based on percentage used
const getBudgetStatus = (percent) => {
    if (percent >= 100) return { label: 'Over Budget', variant: 'danger', color: '#DC2626' };
    if (percent >= 90) return { label: 'Critical', variant: 'danger', color: '#DC2626' };
    if (percent >= 75) return { label: 'Caution', variant: 'warning', color: '#F59E0B' };
    return { label: 'On Track', variant: 'success', color: '#16A34A' };
};

// Format a date range into a short human-readable label like "Feb 2026"
const formatPeriodLabel = (startDate, period) => {
    if (!startDate) return '';
    const d = new Date(startDate);
    if (period === 'yearly') return d.getFullYear().toString();
    if (period === 'weekly') {
        return `Week of ${d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short' })}`;
    }
    return d.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });
};

const BudgetCard = ({ budget, onEdit, onDelete }) => {
    const spent = parseFloat(budget.spent || 0);
    const budgetAmount = parseFloat(budget.amount || 0);
    const remaining = budgetAmount - spent;
    const percent = budgetAmount > 0 ? Math.min(Math.round((spent / budgetAmount) * 100), 100) : 0;
    const isOverBudget = spent > budgetAmount;

    const status = getBudgetStatus((spent / budgetAmount) * 100);
    const category = budget.category || {};

    return (
        <div
            className="card h-100"
            style={{
                borderRadius: '12px',
                border: `1px solid ${isOverBudget ? '#FECACA' : 'var(--border-color)'}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
        >
            <div className="card-body p-3">
                {/* Card header: category info + status badge */}
                <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2">
                        {/* Category color icon blob */}
                        <div
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                background: category.color ? `${category.color}20` : '#F1F5F9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <i
                                className={`bi ${category.icon || 'bi-wallet2'}`}
                                style={{ color: category.color || '#64748B', fontSize: '1rem' }}
                            />
                        </div>
                        <div>
                            <p className="fw-semibold mb-0 small">{category.name || 'Category'}</p>
                            <p className="mb-0" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                {formatPeriodLabel(budget.startDate, budget.period)}
                            </p>
                        </div>
                    </div>

                    <Badge bg={status.variant} className="fw-normal" style={{ fontSize: '0.72rem' }}>
                        {status.label}
                    </Badge>
                </div>

                {/* Amounts: spent vs budget */}
                <div className="d-flex justify-content-between mb-1">
                    <span className="small" style={{ color: 'var(--text-secondary)' }}>
                        Spent
                    </span>
                    <span className="small" style={{ color: 'var(--text-secondary)' }}>
                        Budget
                    </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                    <span
                        className="fw-semibold"
                        style={{
                            fontVariantNumeric: 'tabular-nums',
                            color: isOverBudget ? '#DC2626' : 'var(--text-primary)',
                        }}
                    >
                        {formatKES(spent)}
                    </span>
                    <span
                        className="fw-semibold"
                        style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)' }}
                    >
                        {formatKES(budgetAmount)}
                    </span>
                </div>

                {/* Progress bar */}
                <ProgressBar
                    now={percent}
                    variant={status.variant}
                    style={{ height: '7px', borderRadius: '4px' }}
                    className="mb-2"
                />

                {/* Percentage and remaining/overspent */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="small fw-medium" style={{ color: status.color }}>
                        {percent}% used
                    </span>
                    <span
                        className="small"
                        style={{
                            color: isOverBudget ? '#DC2626' : '#16A34A',
                            fontVariantNumeric: 'tabular-nums',
                        }}
                    >
                        {isOverBudget
                            ? `Overspent by ${formatKES(Math.abs(remaining))}`
                            : `${formatKES(remaining)} remaining`}
                    </span>
                </div>

                {/* Edit / Delete action buttons */}
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        className="flex-fill"
                        onClick={() => onEdit(budget)}
                        style={{ fontSize: '0.8rem' }}
                    >
                        <i className="bi bi-pencil me-1" />
                        Edit
                    </Button>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        className="flex-fill"
                        onClick={() => onDelete(budget)}
                        style={{ fontSize: '0.8rem' }}
                    >
                        <i className="bi bi-trash me-1" />
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BudgetCard;
