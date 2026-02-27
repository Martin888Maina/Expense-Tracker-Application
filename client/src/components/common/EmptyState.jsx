// EmptyState.jsx — displayed when a list has no items to show
const EmptyState = ({
    icon = 'bi-inbox',
    title = 'Nothing here yet',
    message = '',
    actionLabel = '',
    onAction = null,
}) => {
    return (
        <div className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>
            <i className={`bi ${icon} mb-3`} style={{ fontSize: '2.5rem', opacity: 0.5 }} />
            <h6 className="fw-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {title}
            </h6>
            {message && <p className="small mb-3">{message}</p>}
            {actionLabel && onAction && (
                <button
                    className="btn btn-primary btn-sm"
                    onClick={onAction}
                    style={{ borderRadius: '8px' }}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
