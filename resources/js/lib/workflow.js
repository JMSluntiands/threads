export const COMPANIES = ['luntian', 'bluinq'];

export const BOARD_STATUSES = [
    { key: 'pending', label: 'Pending', accent: 'bg-sky-500' },
    { key: 'on_going', label: 'On Going', accent: 'bg-luntian' },
    { key: 'live_on_dev', label: 'Live on Dev', accent: 'bg-blue-500' },
    { key: 'live_on_prod', label: 'Live on Prod', accent: 'bg-violet-500' },
    { key: 'live_on_main_site', label: 'Live on Main Site', accent: 'bg-emerald-500' },
    { key: 'completed', label: 'Completed', accent: 'bg-stone-700' },
];

export const USER_WORKFLOW = ['pending', 'working', 'not_working', 'revised', 'completed'];
export const DEVELOPER_WORKFLOW = ['on_going', 'published', 'revised'];

/** Main progress tracks for the vertical steppers. */
export const USER_STEPS = ['pending', 'working', 'revised', 'completed'];
export const DEVELOPER_STEPS = ['on_going', 'published', 'revised'];

const USER_STEP_COPY = {
    pending: {
        title: 'Pending',
        summary: 'Waiting to be acknowledged.',
        detail: 'This ticket is pending on the user side.',
    },
    working: {
        title: 'Working',
        summary: 'Actively being handled.',
        detail: 'Work related to this request is underway.',
    },
    revised: {
        title: 'Update confirmed',
        summary: 'You confirmed the live update is correct.',
        detail: 'You confirmed that the online update looks good.',
    },
    completed: {
        title: 'Completed',
        summary: 'User marked this ticket as finished.',
        detail: 'The request has been completed on the user side.',
    },
};

const DEVELOPER_STEP_COPY = {
    on_going: {
        title: 'On going',
        summary: 'Developer is working on this ticket.',
        detail: 'Work is currently in progress.',
    },
    published: {
        title: 'Publish',
        summary: 'Published live — waiting for your confirmation.',
        detail: 'This change is now live online. If everything looks good, mark the ticket Completed on your side.',
    },
    revised: {
        title: 'Updated online',
        summary: 'Live update is done — developer work finished.',
        detail: 'The live site was already updated. Developer work for this ticket is finished. Review it, then mark Completed if you are satisfied.',
    },
};

const COMPANY_LABELS = {
    luntian: 'LUNTIAN',
    bluinq: 'BLUiNQ',
};

const COMPANY_STYLES = {
    luntian: 'text-luntian border-luntian/40 bg-luntian/10',
    bluinq: 'text-bluinq border-bluinq/30 bg-bluinq/10',
};

const USER_STYLES = {
    pending: 'text-sky-700',
    working: 'text-luntian',
    not_working: 'text-red-600',
    revised: 'text-violet-700',
    completed: 'text-emerald-700',
};

const USER_LABELS = {
    pending: 'Pending',
    working: 'Working',
    not_working: 'Not working',
    revised: 'Update confirmed',
    completed: 'Completed',
};

const DEVELOPER_STYLES = {
    on_going: 'text-luntian',
    published: 'text-emerald-700',
    revised: 'text-violet-700',
};

const DEVELOPER_LABELS = {
    on_going: 'On going',
    published: 'Publish',
    revised: 'Updated online',
};

export function companyLabel(company) {
    return COMPANY_LABELS[company] || company;
}

export function companyClass(company) {
    return COMPANY_STYLES[company] || COMPANY_STYLES.luntian;
}

export function userStatusClass(status) {
    return USER_STYLES[status] || USER_STYLES.pending;
}

export function userStatusLabel(status) {
    return USER_LABELS[status] || status;
}

export function developerStatusClass(status) {
    return DEVELOPER_STYLES[status] || DEVELOPER_STYLES.on_going;
}

export function developerStatusLabel(status) {
    return DEVELOPER_LABELS[status] || status;
}

export function formatDate(value) {
    if (!value) return '';

    return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

export function formatLongDate(value) {
    if (!value) return '';

    return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));
}

export function initials(name = '') {
    return (
        name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('') || '?'
    );
}

export function roleLabel(role) {
    return role === 'developer' ? 'Developer' : 'User';
}

export function statusBadge(side, status) {
    const label = side === 'user' ? userStatusLabel(status) : developerStatusLabel(status);
    const color =
        side === 'user'
            ? {
                  pending: 'bg-sky-500/10 text-sky-700 border-sky-600/25',
                  working: 'bg-luntian/15 text-luntian border-luntian/30',
                  not_working: 'bg-red-500/10 text-red-700 border-red-600/25',
                  revised: 'bg-violet-500/10 text-violet-700 border-violet-600/25',
                  completed: 'bg-emerald-500/10 text-emerald-700 border-emerald-600/25',
              }[status]
            : {
                  on_going: 'bg-luntian/15 text-luntian border-luntian/30',
                  published: 'bg-emerald-500/10 text-emerald-700 border-emerald-600/25',
                  revised: 'bg-violet-500/10 text-violet-700 border-violet-600/25',
              }[status];

    return { label, color: color || 'bg-black/[0.04] text-muted border-black/10' };
}

export function developerStepCopy(status) {
    return DEVELOPER_STEP_COPY[status] || DEVELOPER_STEP_COPY.on_going;
}

export function userStepCopy(status) {
    return USER_STEP_COPY[status] || USER_STEP_COPY.pending;
}

/** Maps not_working onto Working for the user tracker. */
export function resolveUserStep(status) {
    if (status === 'not_working') return 'working';
    if (USER_STEPS.includes(status)) return status;
    return 'pending';
}

export function userStepState(currentStatus, step) {
    const current = resolveUserStep(currentStatus);
    const currentIndex = USER_STEPS.indexOf(current);
    const stepIndex = USER_STEPS.indexOf(step);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'upcoming';
}

export function resolveDeveloperStep(status) {
    if (DEVELOPER_STEPS.includes(status)) return status;
    return 'on_going';
}

export function developerStepState(currentStatus, step) {
    const current = resolveDeveloperStep(currentStatus);
    const currentIndex = DEVELOPER_STEPS.indexOf(current);
    const stepIndex = DEVELOPER_STEPS.indexOf(step);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'upcoming';
}
