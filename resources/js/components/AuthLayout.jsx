import Navbar from './Navbar';

export default function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="min-h-screen bg-canvas text-ink">
            <Navbar />

            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-6 py-12">
                <div className="w-full">
                    <div className="mb-8 space-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight text-ink">{title}</h1>
                        <p className="text-muted">{subtitle}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
