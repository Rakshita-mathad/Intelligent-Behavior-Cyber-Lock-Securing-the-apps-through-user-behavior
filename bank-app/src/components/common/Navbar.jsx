import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBehavior } from '../../context/BehaviorContext';
import SecurityIndicator from './SecurityIndicator';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();
    const { stopMonitoring } = useBehavior();

    const handleLogout = () => {
        stopMonitoring();
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <h1>🏦 SecureBank</h1>
                {!isAdmin && <SecurityIndicator />}
            </div>

            <div className="navbar-user">
                <div className="user-info">
                    <span className="user-name">{user.firstName} {user.lastName}</span>
                    <span className="user-role">{isAdmin ? 'Administrator' : 'Customer'}</span>
                </div>
                <button className="btn btn-secondary" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;