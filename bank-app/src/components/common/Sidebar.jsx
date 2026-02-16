import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { isAdmin } = useAuth();

    if (isAdmin) {
        return (
            <div className="sidebar">
                <nav className="sidebar-nav">
                    <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <span className="nav-icon">📊</span>
                        Dashboard
                    </NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <span className="nav-icon">👥</span>
                        User Management
                    </NavLink>
                    <NavLink to="/admin/overview" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <span className="nav-icon">📈</span>
                        System Overview
                    </NavLink>
                </nav>
            </div>
        );
    }

    return (
        <div className="sidebar">
            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <span className="nav-icon">🏠</span>
                    Dashboard
                </NavLink>
                <NavLink to="/balance" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <span className="nav-icon">💰</span>
                    Balance
                </NavLink>
                <NavLink to="/transaction" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <span className="nav-icon">💸</span>
                    Transaction
                </NavLink>
                <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <span className="nav-icon">📜</span>
                    History
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <span className="nav-icon">👤</span>
                    Profile
                </NavLink>
            </nav>
        </div>
    );
};

export default Sidebar;