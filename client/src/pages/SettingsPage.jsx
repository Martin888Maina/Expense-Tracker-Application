// SettingsPage.jsx — profile settings, currency, password change, dark mode, and account deletion
import { useState } from 'react';
import { Row, Col, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import ConfirmModal from '../components/common/ConfirmModal';

const CURRENCIES = [
    { value: 'KES', label: 'KES — Kenyan Shilling' },
    { value: 'USD', label: 'USD — US Dollar' },
    { value: 'EUR', label: 'EUR — Euro' },
    { value: 'GBP', label: 'GBP — British Pound' },
    { value: 'UGX', label: 'UGX — Ugandan Shilling' },
    { value: 'TZS', label: 'TZS — Tanzanian Shilling' },
];

// Reusable section card wrapper to keep each settings block visually consistent
const SectionCard = ({ title, subtitle, children }) => (
    <div
        className="card mb-4"
        style={{ borderRadius: '12px', border: '1px solid var(--border-color)' }}
    >
        <div className="card-body p-3 p-md-4">
            <h6 className="fw-semibold mb-0">{title}</h6>
            {subtitle && (
                <p className="small mb-3 mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {subtitle}
                </p>
            )}
            {!subtitle && <div className="mb-3" />}
            {children}
        </div>
    </div>
);

// ─── Profile form ─────────────────────────────────────────────────────────────
const ProfileSection = ({ user, onUpdated }) => {
    const [profileError, setProfileError] = useState('');
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: { name: user?.name || '', email: user?.email || '', currency: user?.currency || 'KES' },
    });

    const onSubmit = async (data) => {
        setProfileError('');
        try {
            await api.put('/auth/profile', data);
            await onUpdated();
            toast.success('Profile updated successfully.');
        } catch (err) {
            setProfileError(err.response?.data?.error?.message || 'Failed to update profile.');
        }
    };

    return (
        <SectionCard title="Profile" subtitle="Update your display name, email address, and preferred currency.">
            {profileError && <Alert variant="danger" className="mb-3">{profileError}</Alert>}
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Row className="g-3">
                    <Col xs={12} sm={6}>
                        <Form.Group>
                            <Form.Label className="small fw-medium">Full Name</Form.Label>
                            <Form.Control
                                isInvalid={!!errors.name}
                                {...register('name', { required: 'Name is required.' })}
                            />
                            <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Form.Group>
                            <Form.Label className="small fw-medium">Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                isInvalid={!!errors.email}
                                {...register('email', { required: 'Email is required.' })}
                            />
                            <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Form.Group>
                            <Form.Label className="small fw-medium">Currency</Form.Label>
                            <Form.Select {...register('currency')}>
                                {CURRENCIES.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col xs={12}>
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            disabled={isSubmitting}
                            className="d-flex align-items-center gap-2"
                        >
                            {isSubmitting && <Spinner size="sm" animation="border" />}
                            Save Profile
                        </Button>
                    </Col>
                </Row>
            </Form>
        </SectionCard>
    );
};

// ─── Password change form ─────────────────────────────────────────────────────
const PasswordSection = () => {
    const [pwError, setPwError] = useState('');
    const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm();
    const newPw = watch('newPassword', '');

    const onSubmit = async (data) => {
        setPwError('');
        try {
            await api.put('/auth/password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            toast.success('Password changed successfully.');
            reset();
        } catch (err) {
            setPwError(err.response?.data?.error?.message || 'Failed to change password.');
        }
    };

    return (
        <SectionCard title="Change Password" subtitle="Use a strong password that is at least 8 characters long.">
            {pwError && <Alert variant="danger" className="mb-3">{pwError}</Alert>}
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Row className="g-3">
                    <Col xs={12} sm={6}>
                        <Form.Group>
                            <Form.Label className="small fw-medium">Current Password</Form.Label>
                            <Form.Control
                                type="password"
                                isInvalid={!!errors.currentPassword}
                                {...register('currentPassword', { required: 'Enter your current password.' })}
                            />
                            <Form.Control.Feedback type="invalid">{errors.currentPassword?.message}</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Form.Group>
                            <Form.Label className="small fw-medium">New Password</Form.Label>
                            <Form.Control
                                type="password"
                                isInvalid={!!errors.newPassword}
                                {...register('newPassword', {
                                    required: 'Enter a new password.',
                                    minLength: { value: 8, message: 'Password must be at least 8 characters.' },
                                })}
                            />
                            <Form.Control.Feedback type="invalid">{errors.newPassword?.message}</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Form.Group>
                            <Form.Label className="small fw-medium">Confirm New Password</Form.Label>
                            <Form.Control
                                type="password"
                                isInvalid={!!errors.confirmPassword}
                                {...register('confirmPassword', {
                                    required: 'Please confirm your new password.',
                                    validate: (v) => v === newPw || 'Passwords do not match.',
                                })}
                            />
                            <Form.Control.Feedback type="invalid">{errors.confirmPassword?.message}</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col xs={12}>
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            disabled={isSubmitting}
                            className="d-flex align-items-center gap-2"
                        >
                            {isSubmitting && <Spinner size="sm" animation="border" />}
                            Change Password
                        </Button>
                    </Col>
                </Row>
            </Form>
        </SectionCard>
    );
};

// ─── Main settings page ───────────────────────────────────────────────────────
const SettingsPage = () => {
    // Pull auth state and theme from their respective context hooks
    const { user, logout, refreshUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const handleDeleteAccount = async () => {
        if (!deletePassword) { setDeleteError('Please enter your password to confirm.'); return; }
        setDeleteLoading(true);
        setDeleteError('');
        try {
            await api.delete('/auth/account', { data: { password: deletePassword } });
            toast.success('Account deleted.');
            logout();
        } catch (err) {
            setDeleteError(err.response?.data?.error?.message || 'Incorrect password.');
            setDeleteLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header mb-4">
                <h1 className="page-title mb-0">Settings</h1>
                <p className="page-subtitle mb-0">Manage your account and preferences</p>
            </div>

            {/* Profile section */}
            <ProfileSection user={user} onUpdated={refreshUser} />

            {/* Password section */}
            <PasswordSection />

            {/* Theme / appearance toggle */}
            <SectionCard title="Appearance" subtitle="Switch between light and dark mode.">
                <div className="d-flex align-items-center justify-content-between">
                    <div>
                        <p className="small fw-medium mb-0">Dark Mode</p>
                        <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                            Currently:{' '}
                            <Badge
                                bg={theme === 'dark' ? 'dark' : 'light'}
                                text={theme === 'dark' ? 'light' : 'dark'}
                            >
                                {theme === 'dark' ? 'Dark' : 'Light'}
                            </Badge>
                        </p>
                    </div>
                    <Form.Check
                        type="switch"
                        id="theme-toggle"
                        checked={theme === 'dark'}
                        onChange={toggleTheme}
                        label=""
                    />
                </div>
            </SectionCard>

            {/* Danger zone — delete account */}
            <div
                className="card"
                style={{
                    borderRadius: '12px',
                    border: '1px solid #FECACA',
                    background: '#FFF5F5',
                }}
            >
                <div className="card-body p-3 p-md-4">
                    <h6 className="fw-semibold mb-1" style={{ color: '#DC2626' }}>
                        <i className="bi bi-exclamation-triangle me-2" />
                        Danger Zone
                    </h6>
                    <p className="small mb-3" style={{ color: '#64748B' }}>
                        Permanently delete your account and all associated data. This action cannot be reversed.
                    </p>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => { setDeleteError(''); setDeletePassword(''); setShowDeleteConfirm(true); }}
                    >
                        Delete My Account
                    </Button>
                </div>
            </div>

            {/* Delete account confirmation modal with password re-entry */}
            <ConfirmModal
                show={showDeleteConfirm}
                onHide={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteAccount}
                title="Delete Account"
                message={
                    <div>
                        <p>This will permanently delete your account and all your expense data. This cannot be undone.</p>
                        {deleteError && <Alert variant="danger" className="mb-2">{deleteError}</Alert>}
                        <Form.Group>
                            <Form.Label className="small fw-medium">Enter your password to confirm</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Your current password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                            />
                        </Form.Group>
                    </div>
                }
                confirmLabel="Yes, Delete My Account"
                loading={deleteLoading}
            />
        </div>
    );
};

export default SettingsPage;
