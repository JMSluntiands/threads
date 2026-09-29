import '../css/app.css';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import ErrorBoundary from './components/ErrorBoundary';

const root = document.getElementById('app');

if (root) {
    createRoot(root).render(
        <ErrorBoundary>
            <App />
        </ErrorBoundary>,
    );
}
