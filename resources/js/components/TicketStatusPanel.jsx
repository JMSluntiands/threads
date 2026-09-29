import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
    DEVELOPER_STEPS,
    USER_STEPS,
    companyLabel,
    developerStatusLabel,
    developerStepCopy,
    developerStepState,
    formatDate,
    formatLongDate,
    resolveDeveloperStep,
    roleLabel,
    statusBadge,
    userStatusLabel,
    userStepCopy,
    userStepState,
} from '../lib/workflow';
import Avatar from './Avatar';
import ImageModal from './ImageModal';

function StepMarker({ state, isLast }) {
    const lineClass =
        state === 'completed'
            ? 'bg-luntian'
            : state === 'active'
              ? 'bg-gradient-to-b from-luntian to-black/10'
              : 'bg-black/10';

    return (
        <div className="relative flex w-8 shrink-0 flex-col items-center">
            {state === 'completed' && (
                <div className="z-10 flex size-7 items-center justify-center rounded-full bg-luntian text-sm font-bold text-black">
                    ✓
                </div>
            )}
            {state === 'active' && (
                <div className="z-10 flex size-7 items-center justify-center rounded-full border-[3px] border-luntian bg-white">
                    <span className="size-2.5 rounded-full bg-luntian" />
                </div>
            )}
            {state === 'upcoming' && (
                <div className="z-10 size-7 rounded-full border-2 border-black/15 bg-white" />
            )}
            {!isLast && <div className={`absolute top-7 bottom-[-1.25rem] w-0.5 ${lineClass}`} />}
        </div>
    );
}

function HeaderBadge({ side = 'developer', status }) {
    const { label, color } = statusBadge(side, status);
    const solid =
        side === 'developer'
            ? status === 'published'
                ? 'bg-emerald-500 text-black border-transparent'
                : status === 'revised'
                  ? 'bg-violet-500 text-white border-transparent'
                  : status === 'on_going'
                    ? 'bg-luntian text-black border-transparent'
                    : color
            : status === 'completed'
              ? 'bg-emerald-500 text-black border-transparent'
              : status === 'revised'
                ? 'bg-violet-500 text-white border-transparent'
                : status === 'not_working'
                  ? 'bg-red-500 text-white border-transparent'
                  : status === 'working'
                    ? 'bg-luntian text-black border-transparent'
                    : color;

    return (
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${solid}`}>
            {label}
        </span>
    );
}

function StatusCommentsPanel({ thread, selectedStep, onSelectStep, onUpdated }) {
    const { user } = useAuth();
    const [comment, setComment] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [imageSrc, setImageSrc] = useState(null);

    const activeStep = resolveDeveloperStep(thread.developer_status);
    const viewingStep = selectedStep || activeStep;
    const stepCopy = developerStepCopy(viewingStep);

    const commentsForStep = useMemo(() => {
        return (thread.comments || []).filter(
            (item) => resolveDeveloperStep(item.workflow_status || 'on_going') === viewingStep,
        );
    }, [thread.comments, viewingStep]);

    const counts = useMemo(() => {
        const map = Object.fromEntries(DEVELOPER_STEPS.map((step) => [step, 0]));
        for (const item of thread.comments || []) {
            const step = resolveDeveloperStep(item.workflow_status || 'on_going');
            if (map[step] !== undefined) map[step] += 1;
        }
        return map;
    }, [thread.comments]);

    function handleImageChange(event) {
        const file = event.target.files?.[0] ?? null;
        setImage(file);
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    function clearImage() {
        setImage(null);
        setPreview(null);
    }

    async function handleComment(event) {
        event.preventDefault();
        if (!comment.trim() && !image) return;

        setSubmitting(true);
        setError('');

        const formData = new FormData();
        if (comment.trim()) formData.append('body', comment.trim());
        formData.append('workflow_status', viewingStep);
        if (image) formData.append('image', image);

        try {
            const data = await api(`/concerns/${thread.id}/comments`, {
                method: 'POST',
                body: formData,
            });
            onUpdated({
                ...thread,
                comments: [...(thread.comments || []), data.comment],
            });
            setComment('');
            clearImage();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <div className="flex h-full min-h-[22rem] flex-col rounded-2xl border border-black/10 bg-panel">
                <div className="border-b border-black/10 px-4 py-4">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <p className="text-xs uppercase tracking-[0.16em] text-muted">Comments</p>
                            <p className="mt-1 text-sm font-semibold text-ink">{stepCopy.title}</p>
                        </div>
                        <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-xs text-muted">
                            {commentsForStep.length}
                        </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {DEVELOPER_STEPS.map((step) => {
                            const selected = step === viewingStep;
                            const copy = developerStepCopy(step);
                            return (
                                <button
                                    key={step}
                                    type="button"
                                    onClick={() => onSelectStep(step)}
                                    className={[
                                        'rounded-md px-2 py-1 text-[11px] font-medium transition',
                                        selected
                                            ? 'bg-luntian text-black'
                                            : 'bg-black/[0.04] text-ink/55 hover:bg-black/[0.06] hover:text-ink',
                                    ].join(' ')}
                                >
                                    {copy.title}
                                    {counts[step] > 0 ? ` · ${counts[step]}` : ''}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                    {commentsForStep.length === 0 ? (
                        <div className="flex h-full min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-black/10 px-4 text-center">
                            <p className="text-sm text-muted">
                                No comments for {stepCopy.title} yet.
                                {user ? ' Add an update for this status.' : ''}
                            </p>
                        </div>
                    ) : (
                        commentsForStep.map((item) => (
                            <div key={item.id} className="flex gap-3">
                                <Avatar user={item.user} size="sm" className="mt-0.5" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap gap-x-2 text-xs text-muted">
                                        <span className="font-medium text-ink">{item.user?.name}</span>
                                        <span>{roleLabel(item.user?.role)}</span>
                                        <span>{formatDate(item.created_at)}</span>
                                    </div>
                                    {item.body ? (
                                        <p className="mt-1 whitespace-pre-wrap text-sm text-ink/80">{item.body}</p>
                                    ) : null}
                                    {item.image_url && (
                                        <button
                                            type="button"
                                            onClick={() => setImageSrc(item.image_url)}
                                            className="mt-2 block overflow-hidden rounded-lg border border-black/10"
                                        >
                                            <img
                                                src={item.image_url}
                                                alt="Comment attachment"
                                                className="max-h-48 max-w-full object-cover"
                                            />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <form onSubmit={handleComment} className="border-t border-black/10 p-4">
                    {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
                    <p className="mb-2 text-[11px] text-muted">
                        Posting under <span className="text-ink/70">{stepCopy.title}</span>
                    </p>

                    {preview && (
                        <div className="relative mb-3 inline-block">
                            <img
                                src={preview}
                                alt="Preview"
                                className="max-h-28 rounded-lg border border-black/10 object-cover"
                            />
                            <button
                                type="button"
                                onClick={clearImage}
                                className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white"
                            >
                                Remove
                            </button>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <label
                            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-black/10 text-ink/70 hover:bg-black/[0.04] hover:text-ink"
                            title="Attach image"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                className="size-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                aria-hidden="true"
                            >
                                <rect x="3" y="5" width="18" height="14" rx="2" />
                                <circle cx="8.5" cy="10" r="1.5" />
                                <path d="M21 15l-5-5-8 8" />
                            </svg>
                            <span className="sr-only">Attach image</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                        <input
                            value={comment}
                            onChange={(event) => setComment(event.target.value)}
                            placeholder={`Comment on ${stepCopy.title}...`}
                            className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-stone-400 focus:border-luntian"
                        />
                        <button
                            type="submit"
                            disabled={submitting || (!comment.trim() && !image)}
                            className="rounded-lg bg-luntian px-3 py-2 text-sm font-semibold text-black hover:bg-luntian-hover disabled:opacity-40"
                        >
                            Reply
                        </button>
                    </div>
                </form>
            </div>

            <ImageModal src={imageSrc} alt="Comment image" onClose={() => setImageSrc(null)} />
        </>
    );
}

export default function TicketStatusPanel({ thread, onUpdated }) {
    const { user } = useAuth();
    const [updatingKey, setUpdatingKey] = useState(null);
    const [error, setError] = useState('');
    const [imageSrc, setImageSrc] = useState(null);
    const [selectedStep, setSelectedStep] = useState(null);

    const isDeveloper = user?.role === 'developer';
    const canEditUser = thread.user_id === user?.id;
    const activeStep = resolveDeveloperStep(thread.developer_status);
    const canPublish = (thread.allowed_developer_transitions || []).includes('published');
    const canRevise = (thread.allowed_developer_transitions || []).includes('revised');
    const canOnGoing = (thread.allowed_developer_transitions || []).includes('on_going');

    const userOptions = [thread.user_status, ...(thread.allowed_user_transitions || [])].filter(
        (value, index, arr) => arr.indexOf(value) === index,
    );
    const developerOptions = [
        thread.developer_status,
        ...(thread.allowed_developer_transitions || []),
    ].filter((value, index, arr) => arr.indexOf(value) === index);

    async function handleStatusChange(side, status) {
        setUpdatingKey(side);
        setError('');

        try {
            const data = await api(`/concerns/${thread.id}/status`, {
                method: 'PATCH',
                body: { side, status },
            });
            onUpdated(data.concern);
            setSelectedStep(resolveDeveloperStep(data.concern.developer_status));
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdatingKey(null);
        }
    }

    return (
        <>
            <div className="bg-white px-5 py-6 sm:px-8 sm:py-8">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 pb-6">
                    <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
                                {thread.title}
                            </h3>
                            <HeaderBadge side="developer" status={thread.developer_status} />
                            <HeaderBadge side="user" status={thread.user_status} />
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                            <p>
                                Initiated on{' '}
                                <span className="text-ink">{formatLongDate(thread.created_at)}</span>
                            </p>
                            <p>
                                Ticket ID{' '}
                                <span className="font-mono text-ink">{thread.ticket_no}</span>
                            </p>
                            <p>
                                Company{' '}
                                <span className="text-ink">{companyLabel(thread.company)}</span>
                            </p>
                            <p>
                                Submitted by{' '}
                                <span className="text-ink">{thread.user?.name}</span>
                            </p>
                        </div>
                    </div>

                    {thread.image_url && (
                        <button
                            type="button"
                            onClick={() => setImageSrc(thread.image_url)}
                            className="overflow-hidden rounded-lg border border-black/10"
                        >
                            <img src={thread.image_url} alt="" className="h-14 w-20 object-cover" />
                        </button>
                    )}
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] lg:items-start">
                    <div className="space-y-10">
                        {/* User progress */}
                        <div>
                            <p className="mb-5 text-xs uppercase tracking-[0.18em] text-muted">User progress</p>
                            {USER_STEPS.map((step, index) => {
                                const state = userStepState(thread.user_status, step);
                                const copy = userStepCopy(step);
                                const isLast = index === USER_STEPS.length - 1;
                                const isActive = state === 'active';
                                const showNotWorking =
                                    isActive && thread.user_status === 'not_working';

                                return (
                                    <div key={step} className={`flex gap-4 ${isLast ? '' : 'pb-8'}`}>
                                        <StepMarker state={state} isLast={isLast} />
                                        <div className="min-w-0 flex-1 pt-0.5">
                                            <p
                                                className={[
                                                    'text-base',
                                                    isActive
                                                        ? 'font-semibold text-ink'
                                                        : state === 'completed'
                                                          ? 'font-medium text-ink/70'
                                                          : 'font-medium text-ink/40',
                                                ].join(' ')}
                                            >
                                                {copy.title}
                                                {showNotWorking && (
                                                    <span className="ml-2 text-sm font-medium text-red-600">
                                                        · Not working
                                                    </span>
                                                )}
                                            </p>

                                            {isActive && (
                                                <div className="mt-3 space-y-4">
                                                    <p className="max-w-xl text-sm leading-relaxed text-ink/80">
                                                        {showNotWorking
                                                            ? 'Marked as not working. Update when progress resumes or when done.'
                                                            : copy.detail}
                                                    </p>

                                                    {canEditUser && (
                                                        <div className="rounded-xl border border-luntian/25 bg-luntian/10 p-4 sm:p-5">
                                                            <p className="text-sm font-semibold text-ink">
                                                                Update user status
                                                            </p>
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                {userOptions
                                                                    .filter((status) => status !== thread.user_status)
                                                                    .map((status) => (
                                                                        <button
                                                                            key={status}
                                                                            type="button"
                                                                            disabled={updatingKey === 'user'}
                                                                            onClick={() =>
                                                                                handleStatusChange('user', status)
                                                                            }
                                                                            className={[
                                                                                'rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50',
                                                                                status === 'completed'
                                                                                    ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                                                                                    : status === 'revised'
                                                                                      ? 'bg-violet-500 text-white hover:bg-violet-400'
                                                                                      : status === 'not_working'
                                                                                        ? 'bg-red-500 text-white hover:bg-red-400'
                                                                                        : 'border border-black/15 text-ink hover:bg-black/[0.04]',
                                                                            ].join(' ')}
                                                                        >
                                                                            {userStatusLabel(status)}
                                                                        </button>
                                                                    ))}
                                                            </div>
                                                            <div className="mt-3">
                                                                <select
                                                                    value={thread.user_status}
                                                                    disabled={updatingKey === 'user'}
                                                                    onChange={(event) =>
                                                                        handleStatusChange('user', event.target.value)
                                                                    }
                                                                    className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-luntian"
                                                                >
                                                                    {userOptions.map((status) => (
                                                                        <option key={status} value={status}>
                                                                            {userStatusLabel(status)}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {error && updatingKey === 'user' && (
                                                        <p className="text-sm text-red-600">{error}</p>
                                                    )}
                                                </div>
                                            )}

                                            {!isActive && state === 'upcoming' && (
                                                <p className="mt-1 text-sm text-ink/40">{copy.summary}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Developer progress */}
                        <div>
                            <p className="mb-5 text-xs uppercase tracking-[0.18em] text-muted">
                                Developer progress
                            </p>
                            {DEVELOPER_STEPS.map((step, index) => {
                                const state = developerStepState(thread.developer_status, step);
                                const copy = developerStepCopy(step);
                                const isLast = index === DEVELOPER_STEPS.length - 1;
                                const isActive = state === 'active';
                                const isSelected = (selectedStep || activeStep) === step;

                                return (
                                    <div key={step} className={`flex gap-4 ${isLast ? '' : 'pb-8'}`}>
                                        <StepMarker state={state} isLast={isLast} />

                                        <div className="min-w-0 flex-1 pt-0.5">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedStep(step)}
                                                className={[
                                                    'text-left text-base transition',
                                                    isActive || isSelected
                                                        ? 'font-semibold text-ink'
                                                        : state === 'completed'
                                                          ? 'font-medium text-ink/70 hover:text-ink'
                                                          : 'font-medium text-ink/40 hover:text-ink/70',
                                                ].join(' ')}
                                            >
                                                {copy.title}
                                            </button>

                                            {isActive && (
                                                <div className="mt-3 space-y-4">
                                                    <div>
                                                        <p className="text-sm text-muted">
                                                            Assigned to {companyLabel(thread.company)}
                                                        </p>
                                                        <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink/80">
                                                            {copy.detail}
                                                        </p>
                                                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/60">
                                                            {thread.body}
                                                        </p>
                                                    </div>

                                                    {(thread.developer_status === 'published' ||
                                                        thread.developer_status === 'revised') && (
                                                        <div
                                                            className={[
                                                                'rounded-xl border p-4 sm:p-5',
                                                                thread.developer_status === 'revised'
                                                                    ? 'border-violet-400/35 bg-violet-500/10'
                                                                    : 'border-emerald-400/35 bg-emerald-500/10',
                                                            ].join(' ')}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div
                                                                    className={[
                                                                        'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                                                                        thread.developer_status === 'revised'
                                                                            ? 'bg-violet-500 text-white'
                                                                            : 'bg-emerald-500 text-black',
                                                                    ].join(' ')}
                                                                >
                                                                    ✓
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-sm font-semibold text-ink">
                                                                        {thread.developer_status === 'revised'
                                                                            ? 'Updated online — finished'
                                                                            : 'Published — live online'}
                                                                    </p>
                                                                    <p className="mt-1 text-sm text-ink/70">
                                                                        {thread.developer_status === 'revised'
                                                                            ? 'Developer work is done. The update is already live — walang papaedit pa dito.'
                                                                            : 'Developer published this live. Review the site, then mark Completed if it looks good.'}
                                                                    </p>

                                                                    {canEditUser &&
                                                                        thread.user_status !== 'completed' &&
                                                                        (thread.allowed_user_transitions || []).includes(
                                                                            'completed',
                                                                        ) && (
                                                                            <button
                                                                                type="button"
                                                                                disabled={updatingKey === 'user'}
                                                                                onClick={() =>
                                                                                    handleStatusChange(
                                                                                        'user',
                                                                                        'completed',
                                                                                    )
                                                                                }
                                                                                className="mt-4 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
                                                                            >
                                                                                Mark as Completed
                                                                            </button>
                                                                        )}

                                                                    {thread.user_status === 'completed' && (
                                                                        <p className="mt-3 text-sm font-medium text-emerald-700">
                                                                            You marked this ticket Completed.
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="rounded-xl border border-luntian/25 bg-luntian/10 p-4 sm:p-5">
                                                        <p className="text-sm font-semibold text-ink">
                                                            {isDeveloper ? 'Update status' : 'Track progress'}
                                                        </p>
                                                        <p className="mt-1 text-sm text-ink/70">
                                                            {isDeveloper
                                                                ? 'Set developer status: On going, Publish, or Updated online.'
                                                                : thread.developer_status === 'revised'
                                                                  ? 'Updated online means the developer already finished — the live site is updated.'
                                                                  : thread.developer_status === 'published'
                                                                    ? 'Publish means the change is already live online.'
                                                                    : 'Only developers can update this track.'}
                                                        </p>

                                                        {isDeveloper && (
                                                            <div className="mt-4 flex flex-wrap gap-2">
                                                                {canOnGoing && (
                                                                    <button
                                                                        type="button"
                                                                        disabled={updatingKey === 'developer'}
                                                                        onClick={() =>
                                                                            handleStatusChange('developer', 'on_going')
                                                                        }
                                                                        className="rounded-lg border border-black/15 px-4 py-2 text-sm text-ink hover:bg-black/[0.04] disabled:opacity-50"
                                                                    >
                                                                        On going
                                                                    </button>
                                                                )}
                                                                {canPublish && (
                                                                    <button
                                                                        type="button"
                                                                        disabled={updatingKey === 'developer'}
                                                                        onClick={() =>
                                                                            handleStatusChange(
                                                                                'developer',
                                                                                'published',
                                                                            )
                                                                        }
                                                                        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
                                                                    >
                                                                        Publish
                                                                    </button>
                                                                )}
                                                                {canRevise && (
                                                                    <button
                                                                        type="button"
                                                                        disabled={updatingKey === 'developer'}
                                                                        onClick={() =>
                                                                            handleStatusChange('developer', 'revised')
                                                                        }
                                                                        className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-400 disabled:opacity-50"
                                                                    >
                                                                        Updated online
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="mt-4 flex flex-wrap items-center gap-3">
                                                            {isDeveloper ? (
                                                                <select
                                                                    value={thread.developer_status}
                                                                    disabled={updatingKey === 'developer'}
                                                                    onChange={(event) =>
                                                                        handleStatusChange(
                                                                            'developer',
                                                                            event.target.value,
                                                                        )
                                                                    }
                                                                    className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-luntian"
                                                                >
                                                                    {developerOptions.map((status) => (
                                                                        <option key={status} value={status}>
                                                                            {developerStatusLabel(status)}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <p className="text-sm text-ink/80">
                                                                    Current:{' '}
                                                                    <span className="font-medium text-luntian">
                                                                        {developerStatusLabel(
                                                                            thread.developer_status,
                                                                        )}
                                                                    </span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {error && updatingKey === 'developer' && (
                                                        <p className="text-sm text-red-600">{error}</p>
                                                    )}
                                                    {error && !updatingKey && (
                                                        <p className="text-sm text-red-600">{error}</p>
                                                    )}
                                                </div>
                                            )}

                                            {!isActive && state === 'upcoming' && (
                                                <p className="mt-1 text-sm text-ink/40">{copy.summary}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <StatusCommentsPanel
                        thread={thread}
                        selectedStep={selectedStep}
                        onSelectStep={setSelectedStep}
                        onUpdated={onUpdated}
                    />
                </div>
            </div>

            <ImageModal src={imageSrc} onClose={() => setImageSrc(null)} />
        </>
    );
}
