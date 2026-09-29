import { Link } from 'react-router-dom';

export default function Navbar({ actions }) {
    return (
        <header className="sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <Link to="/" className="text-lg font-semibold tracking-tight text-ink">
                    Threads
                </Link>
                {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
            </div>
        </header>
    );
}
