import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { markCommentsSeen } from '../lib/commentSeen';
import { formatDate } from '../lib/workflow';
import Avatar from './Avatar';
import ImageModal from './ImageModal';

export default function TicketCommentsModal({ ticket, onClose, onUpdated }) {
    const { user } = useAuth();
    const fileRef = useRef(null);
    const [body, setBody] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [imageSrc, setImageSrc] = useState(null);

    useEffect(() => {
        if (!ticket) return undefined;

        function onKeyDown(event) {
            if (event.key === 'Escape' && !submitting) onClose();
        }

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [ticket, onClose, submitting]);

    useEffect(() => {
        if (!ticket || !user) return;
        markCommentsSeen(user.id, ticket);
    }, [ticket, user]);

    useEffect(() => () => {
        if (preview) URL.revokeObjectURL(preview);
    }, [preview]);

    function setAttachment(file) {
        if (preview) URL.revokeObjectURL(preview);

        if (!file) {
            setImage(null);
            setPreview(null);
            if (fileRef.current) fileRef.current.value = '';
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('Attach an image file.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be 5 MB or smaller.');
            return;
        }

        setError('');
        setImage(file);
        setPreview(URL.createObjectURL(file));
        if (fileRef.current) fileRef.current.value = '';
    }

    function handlePaste(event) {
        const imageItem = [...(event.clipboardData?.items || [])].find((item) => item.type.startsWith('image/'));
        if (!imageItem) return;

        const file = imageItem.getAsFile();
        if (!file) return;

        event.preventDefault();
        setAttachment(file);
    }

    if (!ticket) return null;

    const comments = [...(ticket.comments || [])].sort((a, b) => a.id - b.id);

    async function handleSubmit(event) {
        event.preventDefault();
        const text = body.trim();
        if ((!text && !image) || submitting) return;

        setSubmitting(true);
        setError('');

        const formData = new FormData();
        if (text) formData.append('body', text);
        if (image) formData.append('image', image);

        try {
            const data = await api(`/concerns/${ticket.id}/comments`, {
                method: 'POST',
                body: formData,
            });
            const next = {
                ...ticket,
                comments: [...(ticket.comments || []), data.comment],
            };
            markCommentsSeen(user.id, next);
            onUpdated(next);
            setBody('');
            setAttachment(null);
        } catch (err) {
            setError(err.message || 'Could not post comment.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="Close comments"
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                className="relative z-10 flex max-h-[min(40rem,calc(100vh-2rem))] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl"
                onPaste={handlePaste}
            >
                <div className="flex items-start justify-between gap-3 border-b border-black/10 px-5 py-4">
                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted">Comments</p>
                        <h2 className="mt-1 truncate text-base font-semibold text-ink">{ticket.title}</h2>
                        <p className="mt-0.5 text-xs text-muted">{ticket.ticket_no}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-2 py-1 text-sm text-muted hover:bg-black/[0.04] hover:text-ink"
                    >
                        Close
                    </button>
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
                    {comments.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-black/10 px-4 py-10 text-center text-sm text-muted">
                            No comments yet.
                        </p>
                    ) : (
                        comments.map((item) => (
                            <div key={item.id} className="flex gap-3">
                                <Avatar user={item.user} size="sm" className="mt-0.5" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap gap-x-2 text-xs text-muted">
                                        <span className="font-medium text-ink">{item.user?.name}</span>
                                        <span>{formatDate(item.created_at)}</span>
                                    </div>
                                    {item.body ? (
                                        <p className="mt-1 whitespace-pre-wrap text-sm text-ink/80">{item.body}</p>
                                    ) : null}
                                    {item.image_url ? (
                                        <button
                                            type="button"
                                            onClick={() => setImageSrc(item.image_url)}
                                            className="mt-2 block overflow-hidden rounded-lg border border-black/10"
                                        >
                                            <img
                                                src={item.image_url}
                                                alt="Comment attachment"
                                                className="max-h-40 max-w-full object-cover"
                                            />
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <form onSubmit={handleSubmit} className="border-t border-black/10 p-4">
                    {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
                    {preview ? (
                        <div className="relative mb-2 inline-block">
                            <img src={preview} alt="Attachment preview" className="h-16 rounded-lg border border-black/10 object-cover" />
                            <button
                                type="button"
                                onClick={() => setAttachment(null)}
                                aria-label="Remove image"
                                className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-ink text-[11px] text-white"
                            >
                                ×
                            </button>
                        </div>
                    ) : null}
                    <div className="flex gap-2">
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => setAttachment(event.target.files?.[0] ?? null)}
                        />
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            aria-label="Attach image"
                            title="Attach image"
                            className="shrink-0 rounded-lg border border-black/10 px-2.5 text-muted hover:bg-black/[0.04] hover:text-ink"
                        >
                            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                <rect x="3" y="5" width="18" height="14" rx="2" />
                                <circle cx="8.5" cy="10" r="1.5" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 16l-5.5-5.5a1.5 1.5 0 0 0-2.1 0L6 18" />
                            </svg>
                        </button>
                        <input
                            value={body}
                            onChange={(event) => setBody(event.target.value)}
                            placeholder="Write a comment or paste an image..."
                            className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-stone-400 focus:border-luntian"
                        />
                        <button
                            type="submit"
                            disabled={submitting || (!body.trim() && !image)}
                            className="rounded-lg bg-luntian px-3 py-2 text-sm font-semibold text-black hover:bg-luntian-hover disabled:opacity-40"
                        >
                            {submitting ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </form>
            </div>

            <ImageModal src={imageSrc} alt="Comment image" onClose={() => setImageSrc(null)} />
        </div>
    );
}
