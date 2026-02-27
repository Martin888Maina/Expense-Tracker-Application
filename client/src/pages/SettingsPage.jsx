// Settings page — full implementation in Commit 6
const SettingsPage = () => (
    <div>
        <div className="page-header">
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Manage your account and preferences</p>
        </div>
        <div className="card p-4 text-center" style={{ color: 'var(--text-secondary)' }}>
            <i className="bi bi-gear mb-2" style={{ fontSize: '2rem' }} />
            <p>Profile, currency and password settings coming in the next update.</p>
        </div>
    </div>
);

export default SettingsPage;
