import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import ManagementLayout from '../components/ManagementLayout';
import { useAuth } from '../context/AuthContext';

const fieldClass =
    'w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-stone-400 focus:border-luntian focus:ring-1 focus:ring-luntian/40';

export default function Profile() {
    const { user, loading, updateProfile } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [removeAvatar, setRemoveAvatar] = useState(false);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) return;
        setName(user.name || '');
        setEmail(user.email || '');
        setPreview(user.avatar_url || null);
        setRemoveAvatar(false);
        setAvatarFile(null);
    }, [user]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-canvas text-muted">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    function handleAvatarChange(event) {
        const file = event.target.files?.[0] ?? null;
        setAvatarFile(file);
        setRemoveAvatar(false);
        setPreview(file ? URL.createObjectURL(file) : user.avatar_url || null);
    }

    function handleRemoveAvatar() {
        setAvatarFile(null);
        setRemoveAvatar(true);
        setPreview(null);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setErrors({});
        setMessage('');
        setSaving(true);

        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('email', email.trim());

        if (password) {
            formData.append('current_password', currentPassword);
            formData.append('password', password);
            formData.append('password_confirmation', passwordConfirmation);
        }

        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        if (removeAvatar) {
            formData.append('remove_avatar', '1');
        }

        try {
            const data = await updateProfile(formData);
            setMessage(data.message || 'Profile updated.');
            setCurrentPassword('');
            setPassword('');
            setPasswordConfirmation('');
            setAvatarFile(null);
            setRemoveAvatar(false);
        } catch (error) {
            setErrors(error.errors || { form: [error.message] });
        } finally {
            setSaving(false);
        }
    }

    return (
        <ManagementLayout title="Profile" subtitle="Manage your account and photo">
            <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
                {message && (
                    <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
                        {message}
                    </p>
                )}
                {errors.form && (
                    <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700">
                        {errors.form[0]}
                    </p>
                )}

                <section className="rounded-2xl border border-black/10 bg-panel p-5 sm:p-6">
                    <h2 className="text-sm font-semibold text-ink">Profile photo</h2>
                    <p className="mt-1 text-sm text-muted">JPG or PNG, up to 2MB.</p>

                    <div className="mt-5 flex flex-wrap items-center gap-5">
                        <Avatar
                            name={name}
                            src={preview}
                            size="xl"
                            className="ring-2 ring-black/10"
                        />

                        <div className="space-y-3">
                            <label className="inline-flex cursor-pointer rounded-lg bg-luntian px-4 py-2 text-sm font-semibold text-black hover:bg-luntian-hover">
                                Upload photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </label>

                            {(preview || user.avatar_url) && !removeAvatar && (
                                <button
                                    type="button"
                                    onClick={handleRemoveAvatar}
                                    className="ml-2 rounded-lg border border-black/10 px-4 py-2 text-sm text-ink/80 hover:bg-black/[0.04]"
                                >
                                    Remove
                                </button>
                            )}

                            {errors.avatar && <p className="text-sm text-red-600">{errors.avatar[0]}</p>}
                        </div>
                    </div>
                </section>

                <section className="space-y-4 rounded-2xl border border-black/10 bg-panel p-5 sm:p-6">
                    <h2 className="text-sm font-semibold text-ink">Account details</h2>

                    <div className="space-y-2">
                        <label htmlFor="profile-name" className="text-sm text-ink">
                            Name
                        </label>
                        <input
                            id="profile-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className={fieldClass}
                            required
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name[0]}</p>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="profile-email" className="text-sm text-ink">
                            Email
                        </label>
                        <input
                            id="profile-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className={fieldClass}
                            required
                        />
                        {errors.email && <p className="text-sm text-red-600">{errors.email[0]}</p>}
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-ink">Role</p>
                        <p className="rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm text-muted">
                            {user.role === 'developer' ? 'Developer' : 'User'}
                        </p>
                    </div>
                </section>

                <section className="space-y-4 rounded-2xl border border-black/10 bg-panel p-5 sm:p-6">
                    <div>
                        <h2 className="text-sm font-semibold text-ink">Change password</h2>
                        <p className="mt-1 text-sm text-muted">Leave blank to keep your current password.</p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="current-password" className="text-sm text-ink">
                            Current password
                        </label>
                        <input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                            className={fieldClass}
                            autoComplete="current-password"
                        />
                        {errors.current_password && (
                            <p className="text-sm text-red-600">{errors.current_password[0]}</p>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label htmlFor="new-password" className="text-sm text-ink">
                                New password
                            </label>
                            <input
                                id="new-password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className={fieldClass}
                                autoComplete="new-password"
                            />
                            {errors.password && <p className="text-sm text-red-600">{errors.password[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirm-password" className="text-sm text-ink">
                                Confirm password
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                value={passwordConfirmation}
                                onChange={(event) => setPasswordConfirmation(event.target.value)}
                                className={fieldClass}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>
                </section>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-luntian px-5 py-2.5 text-sm font-semibold text-black hover:bg-luntian-hover disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : 'Save changes'}
                    </button>
                </div>
            </form>
        </ManagementLayout>
    );
}
