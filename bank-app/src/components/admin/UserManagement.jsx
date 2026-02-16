import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { behaviorService } from '../../services/behaviorService';

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        const allUsers = adminService.getAllUsers();
        setUsers(allUsers);
    };

    const handleViewDetails = (user) => {
        const details = adminService.getUserDetails(user.id);
        setSelectedUser(details);
    };

    const handleLockAccount = (userId) => {
        if (window.confirm('Are you sure you want to lock this account?')) {
            adminService.lockUserAccount(userId);
            loadUsers();
            if (selectedUser && selectedUser.id === userId) {
                const details = adminService.getUserDetails(userId);
                setSelectedUser(details);
            }
        }
    };

    const handleUnlockAccount = (userId) => {
        if (window.confirm('Are you sure you want to unlock this account?')) {
            adminService.unlockUserAccount(userId);
            loadUsers();
            if (selectedUser && selectedUser.id === userId) {
                const details = adminService.getUserDetails(userId);
                setSelectedUser(details);
            }
        }
    };

    const getFilteredUsers = () => {
        let filtered = users;

        if (filterStatus !== 'all') {
            if (filterStatus === 'locked') {
                filtered = filtered.filter(u => u.isLocked);
            } else if (filterStatus === 'active') {
                filtered = filtered.filter(u => !u.isLocked);
            }
        }

        if (searchTerm) {
            filtered = filtered.filter(u =>
                u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    };

    const filteredUsers = getFilteredUsers();

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>👥 User Management</h1>
                <p>Manage user accounts and security</p>
            </div>

            <div className="management-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        All Users
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('active')}
                    >
                        Active
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'locked' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('locked')}
                    >
                        Locked
                    </button>
                </div>
            </div>

            <div className="users-grid">
                <div className="users-list-panel">
                    <h3>Users ({filteredUsers.length})</h3>
                    <div className="users-list">
                        {filteredUsers.map(user => {
                            const alertLevel = behaviorService.getAlertLevel(user.id);
                            return (
                                <div
                                    key={user.id}
                                    className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                                    onClick={() => handleViewDetails(user)}
                                >
                                    <div className="user-avatar">
                                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                    </div>
                                    <div className="user-info">
                                        <strong>{user.firstName} {user.lastName}</strong>
                                        <span className="user-email">{user.email}</span>
                                        <span className="user-account">{user.accountNumber}</span>
                                    </div>
                                    <div className="user-status">
                                        <span className={`status-badge ${user.isLocked ? 'locked' : 'active'}`}>
                                            {user.isLocked ? '🔒' : '✅'}
                                        </span>
                                        <span className={`alert-indicator alert-${alertLevel}`}></span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="user-details-panel">
                    {selectedUser ? (
                        <>
                            <div className="details-header">
                                <h3>User Details</h3>
                                {selectedUser.isLocked ? (
                                    <button
                                        className="btn btn-success"
                                        onClick={() => handleUnlockAccount(selectedUser.id)}
                                    >
                                        🔓 Unlock Account
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleLockAccount(selectedUser.id)}
                                    >
                                        🔒 Lock Account
                                    </button>
                                )}
                            </div>

                            <div className="details-section">
                                <h4>Personal Information</h4>
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <label>Name</label>
                                        <p>{selectedUser.firstName} {selectedUser.lastName}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Email</label>
                                        <p>{selectedUser.email}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Account Number</label>
                                        <p>{selectedUser.accountNumber}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Balance</label>
                                        <p>${selectedUser.balance.toFixed(2)}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Status</label>
                                        <p className={selectedUser.isLocked ? 'status-locked' : 'status-active'}>
                                            {selectedUser.isLocked ? 'Locked' : 'Active'}
                                        </p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Member Since</label>
                                        <p>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="details-section">
                                <h4>Security Status</h4>
                                <div className="security-overview">
                                    <div className="security-stat">
                                        <span>Alert Level</span>
                                        <strong className={`badge-${selectedUser.sessionStats.alertLevel}`}>
                                            {selectedUser.sessionStats.alertLevel.toUpperCase()}
                                        </strong>
                                    </div>
                                    <div className="security-stat">
                                        <span>Total Alerts</span>
                                        <strong>{selectedUser.sessionStats.totalAlerts}</strong>
                                    </div>
                                    <div className="security-stat">
                                        <span>Recent Alerts</span>
                                        <strong>{selectedUser.sessionStats.recentAlerts}</strong>
                                    </div>
                                </div>
                            </div>

                            {selectedUser.alerts.length > 0 && (
                                <div className="details-section">
                                    <h4>Recent Alerts</h4>
                                    <div className="alerts-list-admin">
                                        {selectedUser.alerts.slice(0, 5).map(alert => (
                                            <div key={alert.id} className={`alert-item-admin severity-${alert.severity}`}>
                                                <div className="alert-content">
                                                    <p>{alert.message}</p>
                                                    <small>{alert.date} at {alert.time}</small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedUser.transactions.length > 0 && (
                                <div className="details-section">
                                    <h4>Recent Transactions</h4>
                                    <div className="transactions-list-admin">
                                        {selectedUser.transactions.slice(0, 5).map(transaction => (
                                            <div key={transaction.id} className="transaction-item-admin">
                                                <div className="transaction-icon">
                                                    {transaction.type === 'credit' ? '📥' : '📤'}
                                                </div>
                                                <div className="transaction-info">
                                                    <p>{transaction.description}</p>
                                                    <small>{transaction.date}</small>
                                                </div>
                                                <div className={`amount ${transaction.type}`}>
                                                    {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-selection">
                            <p>Select a user to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;