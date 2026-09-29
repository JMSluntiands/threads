import { useEffect } from 'react';

export default function ImageModal({ src, alt = 'Concern image', onClose }) {
    useEffect(() => {
        if (!src) return undefined;

        function onKeyDown(event) {
            if (event.key === 'Escape') onClose();
        }

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [src, onClose]);

    if (!src) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg border border-white/15 bg-black/60 px-3 py-1.5 text-sm text-white hover:bg-white/10"
            >
                Close
            </button>

            <img
                src={src}
                alt={alt}
                className="max-h-[85vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            />
        </div>
    );
}
