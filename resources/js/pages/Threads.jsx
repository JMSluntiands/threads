import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import ManagementLayout from '../components/ManagementLayout';
import SubmitTicketModal from '../components/SubmitTicketModal';
import TicketBoard from '../components/TicketBoard';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { COMPANIES, companyLabel } from '../lib/workflow';

export default function Threads() {
    const { user, loading } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const company = searchParams.get('company') || '';

    const [threads, setThreads] = useState([]);
    const [query, setQuery] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (!user || !COMPANIES.includes(company)) return;

        setThreads([]);
        setBusy(true);
        api(`/concerns?company=${company}`)
            .then((data) => {
                setThreads(data.concerns || []);
                setError('');
            })
            .catch((err) => setError(err.message))
            .finally(() => setBusy(false));
    }, [user, company]);

    useEffect(() => {
        setQuery('');
    }, [company]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-canvas text-muted">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    function selectCompany(next) {
        setSearchParams({ company: next });
    }

    function handleCreated(ticket) {
        if (ticket.company === company) {
            setThreads((current) => [ticket, ...current]);
        }
    }

    async function handleMove(ticket, boardStatus) {
        const previous = threads;
        setThreads((current) =>
            current.map((item) => (item.id === ticket.id ? { ...item, board_status: boardStatus } : item)),
        );
        setError('');

        try {
            const data = await api(`/concerns/${ticket.id}/board`, {
                method: 'PATCH',
                body: { board_status: boardStatus },
            });
            setThreads((current) => current.map((item) => (item.id === ticket.id ? data.concern : item)));
        } catch (err) {
            setThreads(previous);
            setError(err.message || 'Could not move ticket.');
        }
    }

    const companySelected = COMPANIES.includes(company);
    const needle = query.trim().toLowerCase();
    const visibleTickets = needle
        ? threads.filter((ticket) =>
              [ticket.title, ticket.ticket_no, ticket.user?.name]
                  .filter(Boolean)
                  .join(' ')
                  .toLowerCase()
                  .includes(needle),
          )
        : threads;

    return (
        <ManagementLayout
            title="Tickets"
            subtitle={companySelected ? companyLabel(company) : 'Choose a company'}
            actions={
                <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="rounded-lg bg-luntian px-4 py-2 text-sm font-semibold text-black hover:bg-luntian-hover"
                >
                    Submit ticket
                </button>
            }
        >
            <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                    {COMPANIES.map((item) => {
                        const selected = company === item;
                        const tone =
                            item === 'luntian'
                                ? selected
                                    ? 'border-luntian bg-luntian text-black'
                                    : 'border-black/10 bg-white text-ink hover:border-luntian/50'
                                : selected
                                  ? 'border-bluinq bg-bluinq text-white'
                                  : 'border-black/10 bg-white text-ink hover:border-bluinq/40';

                        return (
                            <button
                                key={item}
                                type="button"
                                onClick={() => selectCompany(item)}
                                className={`rounded-xl border px-5 py-3 text-sm font-semibold tracking-wide transition ${tone}`}
                            >
                                {companyLabel(item)}
                            </button>
                        );
                    })}
                    {companySelected && (
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search tickets"
                            aria-label="Search tickets"
                            className="ml-auto w-full max-w-xs rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-stone-400 focus:border-black/30"
                        />
                    )}
                </div>

                {!companySelected && (
                    <p className="rounded-xl border border-dashed border-black/10 px-6 py-16 text-center text-sm text-muted">
                        Select LUNTIAN or BLUiNQ to open its tickets.
                    </p>
                )}

                {companySelected && busy && <p className="text-sm text-muted">Loading tickets...</p>}
                {error && <p className="text-sm text-red-600">{error}</p>}

                {companySelected && !busy && needle && visibleTickets.length === 0 && (
                    <p className="rounded-xl border border-dashed border-black/10 px-6 py-16 text-center text-sm text-muted">
                        No tickets match “{query.trim()}”.
                    </p>
                )}

                {companySelected && !busy && (!needle || visibleTickets.length > 0) && (
                    <TicketBoard
                        tickets={visibleTickets}
                        onMove={handleMove}
                        onUpdated={(ticket) =>
                            setThreads((current) => current.map((item) => (item.id === ticket.id ? ticket : item)))
                        }
                    />
                )}
            </div>

            <SubmitTicketModal open={showForm} onClose={() => setShowForm(false)} onCreated={handleCreated} />
        </ManagementLayout>
    );
}
