import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

const links = [
    { to: '/dashboard', label: 'Overview', end: true },
    { to: '/threads', label: 'Tickets', end: false },
    { to: '/profile', label: 'Profile', end: true },
];

export default function ManagementLayout({ title, subtitle, actions, children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate('/login');
    }

    return (
        <div className="min-h-screen bg-canvas text-ink lg:grid lg:grid-cols-[240px_1fr]">
            <aside className="border-b border-black/10 bg-white lg:min-h-screen lg:border-b-0 lg:border-r">
                <div className="flex items-center justify-between px-5 py-5 lg:block">
                    <Link to="/dashboard" className="text-lg font-semibold tracking-tight">
                        Threads
                    </Link>
                    <p className="hidden text-xs uppercase tracking-[0.18em] text-muted lg:mt-1 lg:block">
                        Management
                    </p>
                </div>

                <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-6">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) =>
                                [
                                    'rounded-lg px-3 py-2 text-sm whitespace-nowrap transition',
                                    isActive
                                        ? 'bg-luntian/15 font-medium text-luntian'
                                        : 'text-ink/70 hover:bg-black/[0.04] hover:text-ink',
                                ].join(' ')
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden border-t border-black/10 px-5 py-4 lg:block">
                    <Link to="/profile" className="flex items-center gap-3 rounded-lg p-1 transition hover:bg-black/[0.04]">
                        <Avatar user={user} size="md" />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
                            <p className="truncate text-xs text-muted">{user?.email}</p>
                            <p className="mt-0.5 text-xs uppercase tracking-wider text-luntian">
                                {user?.role === 'developer' ? 'Developer' : 'User'}
                            </p>
                        </div>
                    </Link>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-3 text-sm text-muted hover:text-ink"
                    >
                        Log out
                    </button>
                </div>
            </aside>

            <div className="min-w-0">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-6 py-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
                        {subtitle ? <p className="mt-0.5 text-sm text-muted">{subtitle}</p> : null}
                    </div>
                    <div className="flex items-center gap-3">
                        {actions}
                        <Link
                            to="/profile"
                            className="rounded-full ring-1 ring-black/10 transition hover:ring-luntian/50 lg:hidden"
                        >
                            <Avatar user={user} size="sm" />
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-lg border border-black/10 px-3 py-2 text-sm text-ink/80 hover:bg-black/[0.04] lg:hidden"
                        >
                            Log out
                        </button>
                    </div>
                </header>

                <main className="min-w-0 px-6 py-6">{children}</main>
            </div>
        </div>
    );
}
