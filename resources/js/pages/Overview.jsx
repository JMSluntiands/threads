import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import ManagementLayout from '../components/ManagementLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
    COMPANIES,
    companyLabel,
    developerStatusLabel,
    roleLabel,
    userStatusLabel,
} from '../lib/workflow';

export default function Overview() {
    const { user, loading } = useAuth();
    const [stats, setStats] = useState({ total: 0, company: {} });
    const [recent, setRecent] = useState([]);
    const [busy, setBusy] = useState(true);

    useEffect(() => {
        if (!user) return;

        api('/concerns')
            .then((data) => {
                setStats(data.stats || { total: 0, company: {} });
                setRecent(data.concerns || []);
            })
            .catch(() => {
                setStats({ total: 0, company: {} });
                setRecent([]);
            })
            .finally(() => setBusy(false));
    }, [user]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-canvas text-muted">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <ManagementLayout
            title="Overview"
            subtitle={roleLabel(user.role)}
            actions={
                <Link
                    to="/threads"
                    className="rounded-lg bg-luntian px-4 py-2 text-sm font-semibold text-black hover:bg-luntian-hover"
                >
                    View tickets
                </Link>
            }
        >
            {busy ? (
                <p className="text-sm text-muted">Loading...</p>
            ) : (
                <div className="space-y-8">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-black/10 bg-panel p-5">
                            <p className="text-sm text-muted">All tickets</p>
                            <p className="mt-2 text-3xl font-semibold text-ink">{stats.total || 0}</p>
                        </div>
                        {COMPANIES.map((company) => (
                            <Link
                                key={company}
                                to={`/threads?company=${company}`}
                                className="rounded-xl border border-black/10 bg-panel p-5 transition hover:border-black/15"
                            >
                                <p className="text-sm text-muted">{companyLabel(company)}</p>
                                <p className="mt-2 text-3xl font-semibold text-ink">
                                    {stats.company?.[company] || 0}
                                </p>
                            </Link>
                        ))}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {COMPANIES.map((company) => {
                            const tickets = recent.filter((ticket) => ticket.company === company).slice(0, 6);

                            return (
                                <section key={company}>
                                    <div className="mb-3 flex items-center justify-between">
                                        <h2 className="text-sm font-semibold tracking-wide text-ink">
                                            {companyLabel(company)}
                                        </h2>
                                        <Link
                                            to={`/threads?company=${company}`}
                                            className="text-sm text-muted hover:text-ink"
                                        >
                                            See all
                                        </Link>
                                    </div>

                                    {tickets.length === 0 ? (
                                        <p className="rounded-xl border border-dashed border-black/10 px-5 py-10 text-center text-sm text-muted">
                                            No {companyLabel(company)} tickets yet.
                                        </p>
                                    ) : (
                                        <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
                                            {tickets.map((ticket, index) => (
                                                <div
                                                    key={ticket.id}
                                                    className={`flex items-center justify-between gap-4 px-5 py-4 ${
                                                        index > 0 ? 'border-t border-black/10' : ''
                                                    }`}
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium text-ink">{ticket.title}</p>
                                                        <p className="mt-0.5 text-xs text-muted">{ticket.ticket_no}</p>
                                                    </div>
                                                    <div className="shrink-0 text-right text-xs text-muted">
                                                        <p>{userStatusLabel(ticket.user_status)}</p>
                                                        <p>{developerStatusLabel(ticket.developer_status)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                </div>
            )}
        </ManagementLayout>
    );
}
