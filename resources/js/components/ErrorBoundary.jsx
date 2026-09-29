import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    render() {
        if (this.state.error) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-canvas px-6">
                    <div className="max-w-lg space-y-3 text-center">
                        <h1 className="text-2xl font-semibold text-ink">Something went wrong</h1>
                        <p className="text-sm text-muted break-words">{String(this.state.error)}</p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="rounded-lg bg-luntian px-4 py-2 text-sm font-semibold text-black"
                        >
                            Reload
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
