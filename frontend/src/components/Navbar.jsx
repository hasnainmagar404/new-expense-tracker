import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="text-xl font-bold text-blue-600">
                            💰 ExpenseTracker
                        </Link>
                        <div className="flex gap-4">
                            <Link
                                to="/"
                                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/analytics"
                                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/analytics') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Analytics
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            Hi, <span className="font-medium">{user?.name}</span>
                        </span>
                        <button
                            onClick={logout}
                            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
