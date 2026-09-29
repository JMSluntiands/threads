import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

const inputClass =
    'w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-ink outline-none transition placeholder:text-stone-400 focus:border-luntian focus:ring-2 focus:ring-luntian/30';

export default function Register() {
    const { user, loading, register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    if (!loading && user) {
        return <Navigate to="/dashboard" replace />;
    }

    function updateField(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            await register(form);
            navigate('/dashboard');
        } catch (error) {
            setErrors(error.errors || { form: [error.message] });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout title="Create your account" subtitle="Join the Threads management workspace.">
            <form onSubmit={handleSubmit} className="space-y-5">
                {errors.form && (
                    <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700">
                        {errors.form[0]}
                    </p>
                )}

                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-ink/80">
                        Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={form.name}
                        onChange={updateField}
                        className={inputClass}
                        placeholder="Your name"
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name[0]}</p>}
                </div>

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
                    <label htmlFor="role" className="block text-sm font-medium text-ink/80">
                        Account type
                    </label>
                    <select
                        id="role"
                        name="role"
                        required
                        value={form.role}
                        onChange={updateField}
                        className={inputClass}
                    >
                        <option value="user">User</option>
                        <option value="developer">Developer</option>
                    </select>
                    {errors.role && <p className="text-sm text-red-600">{errors.role[0]}</p>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-ink/80">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={form.password}
                        onChange={updateField}
                        className={inputClass}
                        placeholder="••••••••"
                    />
                    {errors.password && <p className="text-sm text-red-600">{errors.password[0]}</p>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-ink/80">
                        Confirm password
                    </label>
                    <input
                        id="password_confirmation"
                        name="password_confirmation"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={form.password_confirmation}
                        onChange={updateField}
                        className={inputClass}
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-luntian px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-luntian-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? 'Creating account...' : 'Create account'}
                </button>
            </form>

            <p className="mt-6 text-sm text-muted">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-bluinq hover:underline">
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    );
}
