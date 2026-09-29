import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

const inputClass =
    'w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-ink outline-none transition placeholder:text-stone-400 focus:border-luntian focus:ring-2 focus:ring-luntian/30';

export default function Login() {
    const { user, loading, login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: '',
        password: '',
        remember: false,
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    if (!loading && user) {
        return <Navigate to="/dashboard" replace />;
    }

    function updateField(event) {
        const { name, type, checked, value } = event.target;
        setForm((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            await login(form);
            navigate('/dashboard');
        } catch (error) {
            setErrors(error.errors || { form: [error.message] });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout title="Welcome back" subtitle="Sign in to the Threads management workspace.">
            <form onSubmit={handleSubmit} className="space-y-5">
                {errors.form && (
                    <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700">
                        {errors.form[0]}
                    </p>
                )}

                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-ink/80">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={form.email}
                        onChange={updateField}
                        className={inputClass}
                        placeholder="you@example.com"
                    />
                    {errors.email && <p className="text-sm text-red-600">{errors.email[0]}</p>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-ink/80">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={form.password}
                        onChange={updateField}
                        className={inputClass}
                        placeholder="••••••••"
                    />
                    {errors.password && <p className="text-sm text-red-600">{errors.password[0]}</p>}
                </div>

                <label className="flex items-center gap-2 text-sm text-muted">
                    <input
                        type="checkbox"
                        name="remember"
                        checked={form.remember}
                        onChange={updateField}
                        className="size-4 rounded border-black/15 bg-white text-luntian focus:ring-luntian"
                    />
                    Remember me
                </label>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-luntian px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-luntian-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? 'Signing in...' : 'Sign in'}
                </button>
            </form>

            <p className="mt-6 text-sm text-muted">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="font-medium text-bluinq hover:underline">
                    Create one
                </Link>
            </p>
        </AuthLayout>
    );
}
