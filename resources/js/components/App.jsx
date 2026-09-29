import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Overview from '../pages/Overview';
import Profile from '../pages/Profile';
import Register from '../pages/Register';
import Ticket from '../pages/Ticket';
import Threads from '../pages/Threads';

function GuestOnly({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user) return <Navigate to="/dashboard" replace />;
    return children;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/login"
                        element={
                            <GuestOnly>
                                <Login />
                            </GuestOnly>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <GuestOnly>
                                <Register />
                            </GuestOnly>
                        }
                    />
                    <Route path="/dashboard" element={<Overview />} />
                    <Route path="/threads" element={<Threads />} />
                    <Route path="/threads/:id" element={<Ticket />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
