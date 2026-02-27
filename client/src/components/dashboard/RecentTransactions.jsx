// RecentTransactions.jsx — compact list of the last 5 expenses for the dashboard
import { Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import EmptyState from '../common/EmptyState';

const PAYMENT_BADGE = {
    cash: 'secondary',
    mpesa: 'success',
    bank_transfer: 'info',
    card: 'primary',
};

const PAYMENT_LABEL = {
    cash: 'Cash',
    mpesa: 'M-Pesa',
    bank_transfer: 'Bank Transfer',
    card: 'Card',
};

const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-KE', { day: '2-digit', month: 'short' });

const formatKES = (amount) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

const RecentTransactions = ({ expenses = [] }) => {
    return (
        <div
            className="card"
            style={{ borderRadius: '12px', border: '1px solid var(--border-color)' }}
        >
            <div className="card-body p-3 p-md-4">
                {/* Header row with a link to the full expense list */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                        <h6 className="fw-semibold mb-0" style={{ color: 'var(--text-primary)' }}>
                            Recent Transactions
                        </h6>
                        <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                            Your last {expenses.length} expenses
                        </p>
                    </div>
                    <Link
                        to="/expenses"
                        className="small text-decoration-none"
                        style={{ color: '#2563EB' }}
                    >
                        View all <i className="bi bi-arrow-right" />
                    </Link>
                </div>

                {expenses.length === 0 ? (
                    <EmptyState
                        icon="bi-receipt"
                        title="No expenses yet"
                        message="Your recent transactions will appear here once you add expenses."
                    />
                ) : (
                    <div className="d-flex flex-column gap-2">
                        {expenses.map((expense) => {
                            const cat = expense.category || {};
                            return (
                                <div
                                    key={expense.id}
                                    className="d-flex align-items-center justify-content-between py-2"
                                    style={{ borderBottom: '1px solid var(--border-color)' }}
                                >
                                    {/* Category icon blob + description */}
                                    <div className="d-flex align-items-center gap-2 min-w-0">
                                        <div
                                            style={{
                                                width: '34px',
                                                height: '34px',
                                                borderRadius: '8px',
                                                background: cat.color ? `${cat.color}20` : '#F1F5F9',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <i
                                                className={`bi ${cat.icon || 'bi-tag'}`}
                                                style={{ color: cat.color || '#64748B', fontSize: '0.9rem' }}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p
                                                className="fw-medium small mb-0 text-truncate"
                                                style={{ color: 'var(--text-primary)', maxWidth: '180px' }}
                                            >
                                                {expense.description}
                                            </p>
                                            <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                                                {cat.name} &middot; {formatDate(expense.date)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Amount + payment badge */}
                                    <div className="text-end ms-2 flex-shrink-0">
                                        <p
                                            className="fw-semibold small mb-1"
                                            style={{ fontVariantNumeric: 'tabular-nums' }}
                                        >
                                            {formatKES(expense.amount)}
                                        </p>
                                        <Badge
                                            bg={PAYMENT_BADGE[expense.paymentMethod] || 'secondary'}
                                            className="fw-normal"
                                            style={{ fontSize: '0.7rem' }}
                                        >
                                            {PAYMENT_LABEL[expense.paymentMethod] || expense.paymentMethod}
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentTransactions;
