import { initials } from '../lib/workflow';

export default function Avatar({ user, name, src, size = 'md', className = '' }) {
    const label = name || user?.name || '?';
    const image = src || user?.avatar_url;
    const sizeClass =
        {
            sm: 'size-7 text-[10px]',
            md: 'size-9 text-xs',
            lg: 'size-16 text-lg',
            xl: 'size-24 text-2xl',
        }[size] || 'size-9 text-xs';

    if (image) {
        return (
            <img
                src={image}
                alt={label}
                className={`shrink-0 rounded-full object-cover ${sizeClass} ${className}`}
            />
        );
    }

    return (
        <div
            className={`flex shrink-0 items-center justify-center rounded-full bg-black/[0.06] font-semibold text-ink/80 ${sizeClass} ${className}`}
            aria-hidden="true"
        >
            {initials(label)}
        </div>
    );
}
