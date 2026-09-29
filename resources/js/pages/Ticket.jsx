import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import ManagementLayout from '../components/ManagementLayout';
import TicketStatusPanel from '../components/TicketStatusPanel';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function Ticket() {
    const { id } = useParams();
    const { user, loading } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user || !id) return;

        setBusy(true);
        api(`/concerns/${id}`)
            .then((data) => {
                setTicket(data.concern);
                setError('');
            })
            .catch((err) => {
                setTicket(null);
                setError(err.message || 'Ticket not found.');
            })
            .finally(() => setBusy(false));
    }, [user, id]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-canvas text-muted">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <ManagementLayout
            title={ticket?.ticket_no || 'Ticket'}
            subtitle={ticket?.title}
            actions={
                <Link
                    to="/threads"
                    className="rounded-lg border border-black/10 px-4 py-2 text-sm text-ink/80 hover:bg-black/[0.04]"
                >
                    Back to tickets
                </Link>
            }
        >
            {busy && <p className="text-sm text-muted">Loading ticket...</p>}
            {error && !busy && (
                <div className="rounded-xl border border-dashed border-black/10 px-6 py-14 text-center">
                    <p className="text-ink/80">{error}</p>
                    <Link to="/threads" className="mt-3 inline-block text-sm text-luntian hover:underline">
                        Return to tickets
                    </Link>
                </div>
            )}
            {!busy && !error && ticket && (
                <div className="overflow-hidden rounded-2xl border border-black/10">
                    <TicketStatusPanel thread={ticket} onUpdated={setTicket} />
                </div>
            )}
        </ManagementLayout>
    );
}
