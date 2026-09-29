import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { markCommentsSeen, readCommentSeen, unreadCommentCount } from '../lib/commentSeen';
import { BOARD_STATUSES } from '../lib/workflow';
import Avatar from './Avatar';
import TicketCommentsModal from './TicketCommentsModal';
import TicketDetailsModal from './TicketDetailsModal';

export default function TicketBoard({ tickets, onMove, onUpdated }) {
    const { user } = useAuth();
    const scrollerRef = useRef(null);
    const panRef = useRef(null);
    const [panning, setPanning] = useState(false);
    const [draggingId, setDraggingId] = useState(null);
    const [overStatus, setOverStatus] = useState(null);
    const [commentTicket, setCommentTicket] = useState(null);
    const [detailTicket, setDetailTicket] = useState(null);
    const [seen, setSeen] = useState(null);

    useEffect(() => {
        if (!user) return;
        setSeen(readCommentSeen(user.id));
    }, [user]);

    function handlePanStart(event) {
        if (event.button !== 0) return;
        if (event.target.closest('[data-ticket]')) return;

        const scroller = scrollerRef.current;
        if (!scroller) return;

        const column = event.target.closest('[data-column-scroll]');
        event.preventDefault();
        panRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            scrollLeft: scroller.scrollLeft,
            scrollTop: column?.scrollTop ?? 0,
            column,
        };
        try {
            scroller.setPointerCapture(event.pointerId);
        } catch {
            // Pointer capture needs a real pointer. Panning still follows move events.
        }
        setPanning(true);
    }

    function handleBoardDragStart(event) {
        if (!event.target.closest('[data-ticket]')) {
            event.preventDefault();
        }
    }

    function handlePanMove(event) {
        if (!panRef.current || panRef.current.pointerId !== event.pointerId) return;
        const scroller = scrollerRef.current;
        if (!scroller) return;
        const pan = panRef.current;
        scroller.scrollLeft = pan.scrollLeft - (event.clientX - pan.startX);
        if (pan.column) {
            pan.column.scrollTop = pan.scrollTop - (event.clientY - pan.startY);
        }
    }

    function handlePanEnd(event) {
        if (!panRef.current || panRef.current.pointerId !== event.pointerId) return;
        panRef.current = null;
        setPanning(false);
    }

    function handleDragStart(event, ticket) {
        if (event.target.closest('[data-card-action]')) {
            event.preventDefault();
            return;
        }

        event.dataTransfer.setData('text/plain', String(ticket.id));
        event.dataTransfer.effectAllowed = 'move';
        setDraggingId(ticket.id);
    }

    function handleDragEnd() {
        setDraggingId(null);
        setOverStatus(null);
    }

    function handleDrop(event, status) {
        event.preventDefault();
        const id = Number(event.dataTransfer.getData('text/plain'));
        const ticket = tickets.find((item) => item.id === id);
        setDraggingId(null);
        setOverStatus(null);

        if (!ticket || (ticket.board_status || 'pending') === status) return;
        onMove(ticket, status);
    }

    function openComments(ticket) {
        setSeen(markCommentsSeen(user.id, ticket));
        setCommentTicket(ticket);
    }

    function handleCommentsUpdated(next) {
        setSeen(markCommentsSeen(user.id, next));
        setCommentTicket(next);
        onUpdated?.(next);
    }

    async function toggleMark(ticket, field) {
        const next = { ...ticket, [field]: !ticket[field] };
        onUpdated?.(next);

        try {
            const data = await api(`/concerns/${ticket.id}/marks`, {
                method: 'PATCH',
                body: { [field]: next[field] },
            });
            onUpdated?.(data.concern);
        } catch {
            onUpdated?.(ticket);
        }
    }

    return (
        <>
        <div
            ref={scrollerRef}
            className={`scrollbar-none flex select-none items-start gap-3 overflow-x-auto ${
                panning ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            onPointerDown={handlePanStart}
            onPointerMove={handlePanMove}
            onPointerUp={handlePanEnd}
            onPointerCancel={handlePanEnd}
            onDragStart={handleBoardDragStart}
        >
            {BOARD_STATUSES.map((column) => {
                const items = tickets
                    .filter((ticket) => (ticket.board_status || 'pending') === column.key)
                    .sort((a, b) => Number(Boolean(b.is_priority)) - Number(Boolean(a.is_priority)));
                const isOver = overStatus === column.key;

                return (
                    <section
                        key={column.key}
                        className={`flex w-72 shrink-0 flex-col rounded-2xl border bg-stone-50/80 ${
                            isOver ? 'border-luntian ring-2 ring-luntian/30' : 'border-black/10'
                        }`}
                        onDragOver={(event) => {
                            event.preventDefault();
                            event.dataTransfer.dropEffect = 'move';
                            if (overStatus !== column.key) setOverStatus(column.key);
                        }}
                        onDragLeave={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget)) {
                                setOverStatus((current) => (current === column.key ? null : current));
                            }
                        }}
                        onDrop={(event) => handleDrop(event, column.key)}
                    >
                        <header className="border-b border-black/10 px-3 py-3">
                            <div className={`mb-2 h-1 rounded-full ${column.accent}`} />
                            <div className="flex items-center justify-between gap-2">
                                <h2 className="text-sm font-semibold text-ink">{column.label}</h2>
                                <span className="rounded-full bg-white px-2 py-0.5 text-xs text-muted">{items.length}</span>
                            </div>
                        </header>

                        <div data-column-scroll className="flex flex-col gap-2 p-2">
                            {items.length === 0 ? (
                                <p className="px-2 py-6 text-center text-xs text-muted">Drop a ticket here</p>
                            ) : (
                                items.map((ticket) => {
                                    const unread = unreadCommentCount(ticket, user?.id, seen);
                                    const priority = Boolean(ticket.is_priority);
                                    const coding = Boolean(ticket.is_coding);
                                    const canPrioritize = user?.id === ticket.user_id || user?.role === 'developer';
                                    const canCode = user?.role === 'developer';
                                    const iconButton = priority
                                        ? 'text-white hover:bg-white/10'
                                        : 'text-muted hover:bg-black/[0.04] hover:text-ink';

                                    return (
                                    <article
                                        key={ticket.id}
                                        data-ticket
                                        draggable
                                        onDragStart={(event) => handleDragStart(event, ticket)}
                                        onDragEnd={handleDragEnd}
                                        className={`cursor-pointer rounded-xl border p-3 shadow-sm transition ${
                                            priority
                                                ? coding
                                                    ? 'border-2 border-white bg-[#333333] text-white'
                                                    : 'border-[#333333] bg-[#333333] text-white'
                                                : coding
                                                  ? 'border-2 border-[#333333] bg-white'
                                                  : 'border-black/10 bg-white hover:border-black/20'
                                        } ${draggingId === ticket.id ? 'cursor-grabbing opacity-40' : ''}`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Avatar
                                                user={ticket.user}
                                                size="sm"
                                                className={priority ? 'bg-white/15 text-white' : ''}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className={`truncate text-sm font-medium ${priority ? 'text-white' : 'text-ink'}`}>
                                                    {ticket.user?.name || 'Unknown'}
                                                </p>
                                                <p className={`truncate text-xs ${priority ? 'text-white/70' : 'text-muted'}`}>
                                                    {ticket.ticket_no}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                data-card-action
                                                aria-label={priority ? 'Remove priority' : 'Mark as priority'}
                                                title="Priority"
                                                disabled={!canPrioritize}
                                                onPointerDown={(event) => event.stopPropagation()}
                                                onClick={() => toggleMark(ticket, 'is_priority')}
                                                className={`shrink-0 rounded-lg p-1.5 ${iconButton} ${
                                                    canPrioritize ? 'cursor-pointer' : 'cursor-default opacity-80'
                                                }`}
                                            >
                                                <svg viewBox="0 0 24 24" className="size-4" fill={priority ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h11l-2.2 3.5L16 11H5" />
                                                </svg>
                                            </button>
                                        </div>
                                        <p className={`mt-2 text-sm ${priority ? 'text-white' : 'text-ink'}`}>{ticket.title}</p>
                                        <div className={`mt-3 flex items-center gap-1 border-t pt-2.5 ${priority ? 'border-white/15' : 'border-black/10'}`}>
                                            <button
                                                type="button"
                                                data-card-action
                                                aria-label="View ticket"
                                                title="View"
                                                onPointerDown={(event) => event.stopPropagation()}
                                                onClick={() => setDetailTicket(ticket)}
                                                className={`cursor-pointer rounded-lg p-1.5 ${iconButton}`}
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    className="size-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
                                                    />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                data-card-action
                                                aria-label={unread > 0 ? `Comment, ${unread} new` : 'Comment'}
                                                title="Comment"
                                                onPointerDown={(event) => event.stopPropagation()}
                                                onClick={() => openComments(ticket)}
                                                className={`relative cursor-pointer rounded-lg p-1.5 ${iconButton}`}
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    className="size-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M21 12a8 8 0 01-8 8H7l-4 3V12a8 8 0 018-8h2a8 8 0 018 8z"
                                                    />
                                                </svg>
                                                {unread > 0 ? (
                                                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                                                        {unread > 9 ? '9+' : unread}
                                                    </span>
                                                ) : null}
                                            </button>
                                            {coding ? (
                                                <span
                                                    aria-hidden="true"
                                                    className={`coding-developing ${priority ? 'text-white/85' : 'text-ink/70'}`}
                                                >
                                                    <span className="coding-word">developing</span>
                                                </span>
                                            ) : null}
                                            <button
                                                type="button"
                                                data-card-action
                                                aria-label={coding ? 'Remove coding mark' : 'Mark as coding'}
                                                title="Coding"
                                                disabled={!canCode}
                                                onPointerDown={(event) => event.stopPropagation()}
                                                onClick={() => toggleMark(ticket, 'is_coding')}
                                                className={`${coding ? '' : 'ml-auto'} shrink-0 rounded-lg p-1.5 ${iconButton} ${
                                                    canCode ? 'cursor-pointer' : 'cursor-default opacity-80'
                                                }`}
                                            >
                                                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 8l-4 4 4 4M16 8l4 4-4 4" />
                                                </svg>
                                            </button>
                                        </div>
                                    </article>
                                    );
                                })
                            )}
                        </div>
                    </section>
                );
            })}
        </div>
        <TicketDetailsModal ticket={detailTicket} onClose={() => setDetailTicket(null)} />
        <TicketCommentsModal
            ticket={commentTicket}
            onClose={() => setCommentTicket(null)}
            onUpdated={handleCommentsUpdated}
        />
        </>
    );
}
