import { useNavigate } from 'react-router-dom';
import {
    companyClass,
    companyLabel,
    formatDate,
    statusBadge,
} from '../lib/workflow';

function StatusPill({ side, status }) {
    const { label, color } = statusBadge(side, status);
    return (
        <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${color}`}>
            {label}
        </span>
    );
}

export default function ThreadsTable({ threads }) {
    const navigate = useNavigate();

    if (threads.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-black/10 px-6 py-14 text-center">
                <p className="text-ink/80">No tickets found</p>
                <p className="mt-1 text-sm text-muted">Submit a ticket or clear filters.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-stone-50 text-xs uppercase tracking-wider text-muted">
                        <tr>
                            <th className="px-4 py-3 font-medium">Ticket</th>
                            <th className="px-4 py-3 font-medium">Company</th>
                            <th className="px-4 py-3 font-medium">User</th>
                            <th className="px-4 py-3 font-medium">Developer</th>
                            <th className="px-4 py-3 font-medium">Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {threads.map((thread) => (
                            <tr
                                key={thread.id}
                                className="cursor-pointer border-t border-black/10 hover:bg-black/[0.03]"
                                onClick={() => navigate(`/threads/${thread.id}`)}
                            >
                                <td className="max-w-[20rem] px-4 py-3">
                                    <p className="font-medium text-ink">{thread.title}</p>
                                    <p className="mt-0.5 text-xs text-muted">
                                        {thread.ticket_no} · {thread.user?.name}
                                        {(thread.comments?.length || 0) > 0
                                            ? ` · ${thread.comments.length} comments`
                                            : ''}
                                        {thread.image_url ? ' · image' : ''}
                                    </p>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3">
                                    <span
                                        className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${companyClass(thread.company)}`}
                                    >
                                        {companyLabel(thread.company)}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3">
                                    <StatusPill side="user" status={thread.user_status} />
                                </td>
                                <td className="whitespace-nowrap px-4 py-3">
                                    <StatusPill side="developer" status={thread.developer_status} />
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-muted">
                                    {formatDate(thread.updated_at || thread.created_at)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
