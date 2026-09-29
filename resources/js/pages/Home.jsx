import { Link, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { user, loading } = useAuth();

    if (!loading && user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-canvas text-ink">
            <Navbar
                actions={
                    <>
                        <Link
                            to="/login"
                            className="rounded-lg px-4 py-2 text-sm font-medium text-ink/80 hover:bg-black/[0.04] hover:text-ink"
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/register"
                            className="rounded-lg bg-luntian px-4 py-2 text-sm font-semibold text-black hover:bg-luntian-hover"
                        >
                            Register
                        </Link>
                    </>
                }
            />

            <main className="mx-auto flex max-w-6xl flex-col px-6 pb-24 pt-20">
                <p className="mb-3 text-sm uppercase tracking-[0.2em] text-luntian">Ticketing platform</p>
                <h1 className="max-w-3xl text-5xl font-semibold tracking-tight leading-tight text-ink">
                    Tickets for LUNTIAN and BLUiNQ.
                </h1>
                <p className="mt-4 max-w-2xl text-lg text-muted">
                    Create tickets per company, track separate user and developer statuses, attach images, and keep
                    comments in one workspace.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                        to="/register"
                        className="rounded-lg bg-luntian px-5 py-2.5 text-sm font-semibold text-black hover:bg-luntian-hover"
                    >
                        Get started
                    </Link>
                    <Link
                        to="/login"
                        className="rounded-lg border border-black/10 px-5 py-2.5 text-sm font-medium text-ink hover:bg-black/[0.04]"
                    >
                        Sign in
                    </Link>
                </div>

                <div className="mt-16 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-black/10 bg-panel px-5 py-5">
                        <p className="text-xs uppercase tracking-wider text-muted">Companies</p>
                        <p className="mt-3 text-sm text-ink/80">LUNTIAN · BLUiNQ</p>
                    </div>
                    <div className="rounded-xl border border-black/10 bg-panel px-5 py-5">
                        <p className="text-xs uppercase tracking-wider text-muted">Statuses</p>
                        <p className="mt-3 text-sm text-ink/80">User workflow + Developer workflow</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
