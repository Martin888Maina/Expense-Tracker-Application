import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (values) => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/auth/login', values);
            login(data.data.user, data.data.token);
            toast.success(`Welcome back, ${data.data.user.name}!`);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                {/* Brand header */}
                <div className="auth-logo mb-1">
                    <i className="bi bi-piggy-bank-fill" />
                    <span>ExpenseTracker</span>
                </div>
                <p className="text-center mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Sign in to manage your finances
                </p>

                {error && <Alert variant="danger" className="py-2">{error}</Alert>}

                <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* Email */}
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-500" style={{ fontSize: '0.875rem' }}>Email address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="you@example.com"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                            })}
                            isInvalid={!!errors.email}
                        />
                        <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                    </Form.Group>

                    {/* Password with show/hide toggle */}
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-500" style={{ fontSize: '0.875rem' }}>Password</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                {...register('password', { required: 'Password is required' })}
                                isInvalid={!!errors.password}
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowPassword((p) => !p)}
                                tabIndex={-1}
                                style={{ borderColor: 'var(--border-color)' }}
                            >
                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                            </Button>
                            <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    <Button
                        type="submit"
                        className="w-100"
                        style={{ background: 'var(--primary)', borderColor: 'var(--primary)', fontWeight: 600 }}
                        disabled={loading}
                    >
                        {loading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </Form>

                <p className="text-center mt-3 mb-0" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Don&apos;t have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
