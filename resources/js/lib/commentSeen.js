const storageKey = (userId) => `threads-comment-seen:${userId}`;

export function latestCommentId(ticket) {
    return (ticket?.comments || []).reduce((max, item) => Math.max(max, item.id || 0), 0);
}

export function readCommentSeen(userId) {
    if (!userId) return {};

    try {
        const parsed = JSON.parse(localStorage.getItem(storageKey(userId)) || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

export function writeCommentSeen(userId, seen) {
    if (!userId) return;
    localStorage.setItem(storageKey(userId), JSON.stringify(seen));
}

export function unreadCommentCount(ticket, userId, seen) {
    if (!seen) return 0;

    const mark = seen[ticket.id] ?? 0;

    return (ticket.comments || []).filter((item) => item.id > mark && item.user?.id !== userId).length;
}

export function markCommentsSeen(userId, ticket) {
    const seen = readCommentSeen(userId);
    seen[ticket.id] = latestCommentId(ticket);
    writeCommentSeen(userId, seen);
    return seen;
}
