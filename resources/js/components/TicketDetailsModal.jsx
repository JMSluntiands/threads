import { useEffect, useState } from 'react';
import { BOARD_STATUSES, companyLabel, formatLongDate } from '../lib/workflow';
import Avatar from './Avatar';
import ImageModal from './ImageModal';

export default function TicketDetailsModal({ ticket, onClose }) {
    const [imageSrc, setImageSrc] = useState(null);

    useEffect(() => {
        if (!ticket) return undefined;

        function onKeyDown(event) {
            if (event.key === 'Escape') onClose();
        }

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [ticket, onClose]);

    if (!ticket) return null;

    const status = BOARD_STATUSES.find((item) => item.key === (ticket.board_status || 'pending'));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="Close ticket"
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative z-10 flex max-h-[min(40rem,calc(100vh-2rem))] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-3 border-b border-black/10 px-5 py-4">
                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted">Ticket</p>
                        <h2 className="mt-1 text-lg font-semibold text-ink">{ticket.title}</h2>
                        <p className="mt-0.5 font-mono text-xs text-muted">{ticket.ticket_no}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-2 py-1 text-sm text-muted hover:bg-black/[0.04] hover:text-ink"
                    >
                        Close
                    </button>
                </div>

                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
                    <div className="flex items-center gap-3">
                        <Avatar user={ticket.user} size="md" />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-ink">{ticket.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted">Requested this ticket</p>
                        </div>
                    </div>

                    <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <dt className="text-xs text-muted">Company</dt>
                            <dd className="mt-0.5 font-medium text-ink">{companyLabel(ticket.company)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted">Status</dt>
                            <dd className="mt-0.5 font-medium text-ink">{status?.label || 'Pending'}</dd>
                        </div>
                        <div className="col-span-2">
                            <dt className="text-xs text-muted">Submitted</dt>
                            <dd className="mt-0.5 font-medium text-ink">{formatLongDate(ticket.created_at)}</dd>
                        </div>
                    </dl>

                    {ticket.body ? (
                        <div>
                            <p className="text-xs text-muted">Details</p>
                            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink">{ticket.body}</p>
                        </div>
                    ) : null}

                    {ticket.image_url ? (
                        <div>
                            <p className="text-xs text-muted">Image</p>
                            <button
                                type="button"
                                onClick={() => setImageSrc(ticket.image_url)}
                                className="mt-1 block overflow-hidden rounded-xl border border-black/10"
                            >
                                <img src={ticket.image_url} alt="Ticket attachment" className="max-h-80 w-full object-contain" />
                            </button>
                        </div>
                    ) : ticket.image_missing ? (
                        <p className="text-sm text-muted">An image was attached to this ticket, but the file is missing from storage.</p>
                    ) : null}
                </div>
            </div>

            <ImageModal src={imageSrc} alt="Ticket image" onClose={() => setImageSrc(null)} />
        </div>
    );
}
