import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { COMPANIES, companyClass, companyLabel } from '../lib/workflow';

const fieldClass =
    'w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-stone-400 focus:border-luntian focus:ring-1 focus:ring-luntian/40';

export default function SubmitTicketModal({ open, onClose, onCreated }) {
    const [company, setCompany] = useState('');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [createdTicket, setCreatedTicket] = useState(null);

    useEffect(() => {
        if (!open) return undefined;

        function onKeyDown(event) {
            if (event.key === 'Escape' && !submitting) onClose();
        }

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [open, onClose, submitting]);

    function reset() {
        setCompany('');
        setTitle('');
        setBody('');
        setImage(null);
        setPreview(null);
        setErrors({});
        setSubmitting(false);
        setCreatedTicket(null);
    }

    function handleClose() {
        if (submitting) return;
        reset();
        onClose();
    }

    function handleImageChange(event) {
        const file = event.target.files?.[0] ?? null;
        setImage(file);
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setErrors({});

        if (!company) {
            setErrors({ company: ['Please select a company.'] });
            return;
        }

        setSubmitting(true);

        const formData = new FormData();
        formData.append('company', company);
        formData.append('title', title.trim());
        formData.append('body', body.trim());
        if (image) formData.append('image', image);

        try {
            const data = await api('/concerns', {
                method: 'POST',
                body: formData,
            });
            setCreatedTicket(data.concern);
            onCreated(data.concern);
        } catch (error) {
            setErrors(error.errors || { form: [error.message] });
        } finally {
            setSubmitting(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="Close overlay"
                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                onClick={handleClose}
            />

            <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
                {createdTicket ? (
                    <div className="p-6 sm:p-8">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                            ✓
                        </div>
                        <h2 className="mt-4 text-center text-2xl font-semibold text-ink">Ticket submitted</h2>
                        <p className="mt-2 text-center text-sm text-muted">
                            Your request has been logged and assigned starting statuses.
                        </p>

                        <div className="mt-6 space-y-3 rounded-xl border border-black/10 bg-panel p-4">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-muted">Ticket ID</span>
                                <span className="font-mono text-sm font-medium text-ink">
                                    {createdTicket.ticket_no}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-muted">Company</span>
                                <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${companyClass(createdTicket.company)}`}>
                                    {companyLabel(createdTicket.company)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-muted">Title</span>
                                <span className="max-w-[60%] truncate text-sm text-ink">{createdTicket.title}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-muted">User status</span>
                                <span className="text-sm text-sky-300">Pending</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-muted">Developer status</span>
                                <span className="text-sm text-luntian">On going</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="mt-6 w-full rounded-lg bg-luntian px-4 py-2.5 text-sm font-semibold text-black hover:bg-luntian-hover"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="border-b border-black/10 px-6 py-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-luntian">New request</p>
                                    <h2 className="mt-1 text-xl font-semibold text-ink">Submit a ticket</h2>
                                    <p className="mt-1 text-sm text-muted">
                                        Route this issue to LUNTIAN or BLUiNQ for tracking.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="rounded-lg px-2 py-1 text-sm text-muted hover:bg-black/[0.04] hover:text-ink"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <div className="space-y-5 px-6 py-5">
                            {errors.form && (
                                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700">
                                    {errors.form[0]}
                                </p>
                            )}

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-ink">1. Select company</p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {COMPANIES.map((item) => {
                                        const selected = company === item;
                                        return (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => setCompany(item)}
                                                className={[
                                                    'rounded-xl border px-4 py-4 text-left transition',
                                                    selected
                                                        ? `${companyClass(item)} ring-1 ring-black/10`
                                                        : 'border-black/10 bg-white text-ink/80 hover:border-black/15',
                                                ].join(' ')}
                                            >
                                                <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">
                                                    Assign to
                                                </p>
                                                <p className="mt-2 text-lg font-semibold">{companyLabel(item)}</p>
                                                <p className="mt-1 text-xs opacity-70">
                                                    {item === 'luntian'
                                                        ? 'Residential building design'
                                                        : 'Platform & product support'}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.company && <p className="text-sm text-red-600">{errors.company[0]}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="ticket-title" className="text-sm font-medium text-ink">
                                    2. Ticket title
                                </label>
                                <input
                                    id="ticket-title"
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    className={fieldClass}
                                    placeholder="Brief summary of the issue"
                                    required
                                    maxLength={255}
                                />
                                {errors.title && <p className="text-sm text-red-600">{errors.title[0]}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="ticket-body" className="text-sm font-medium text-ink">
                                    3. Description
                                </label>
                                <textarea
                                    id="ticket-body"
                                    value={body}
                                    onChange={(event) => setBody(event.target.value)}
                                    rows={5}
                                    className={`${fieldClass} resize-y`}
                                    placeholder="Include steps, expected result, and any relevant context..."
                                    required
                                />
                                {errors.body && <p className="text-sm text-red-600">{errors.body[0]}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="ticket-image" className="text-sm font-medium text-ink">
                                    4. Attachment <span className="font-normal text-muted">(optional)</span>
                                </label>
                                <div className="rounded-xl border border-dashed border-black/10 bg-stone-50 px-4 py-4">
                                    <input
                                        id="ticket-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-black/[0.06] file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink"
                                    />
                                    {preview && (
                                        <img
                                            src={preview}
                                            alt="Attachment preview"
                                            className="mt-3 max-h-40 rounded-lg border border-black/10 object-cover"
                                        />
                                    )}
                                </div>
                                {errors.image && <p className="text-sm text-red-600">{errors.image[0]}</p>}
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-black/10 bg-stone-50 px-6 py-4">
                            <p className="text-xs text-muted">
                                Starts as <span className="text-sky-300">Pending</span> /{' '}
                                <span className="text-luntian">On going</span>
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="rounded-lg border border-black/10 px-4 py-2 text-sm text-ink/80 hover:bg-black/[0.04]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-lg bg-luntian px-4 py-2 text-sm font-semibold text-black hover:bg-luntian-hover disabled:opacity-60"
                                >
                                    {submitting ? 'Submitting...' : 'Submit ticket'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
