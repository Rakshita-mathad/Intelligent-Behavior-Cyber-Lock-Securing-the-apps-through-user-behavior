import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import '../../styles/admin.css';

const AdminDashboard = () => {
    const [overview, setOverview] = useState(null);
    const [highRiskUsers, setHighRiskUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = () => {
        setLoading(true);
        const data = adminService.getSystemOverview();
        const riskUsers = adminService.getHighRiskUsers();
        setOverview(data);
        setHighRiskUsers(riskUsers);
        setLoading(false);
    };

    if (loading || !overview) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>📊 Admin Dashboard</h1>
                <p>System Overview and Statistics</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>{overview.totalUsers}</h3>
                        <p>Total Users</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <h3>{overview.activeUsers}</h3>
                        <p>Active Users</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🔒</div>
                    <div className="stat-info">
                        <h3>{overview.lockedAccounts}</h3>
                        <p>Locked Accounts</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">💸</div>
                    <div className="stat-info">
                        <h3>{overview.totalTransactions}</h3>
                        <p>Total Transactions</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <h3>${overview.totalBalance.toFixed(2)}</h3>
                        <p>Total Balance</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-info">
                        <h3>{overview.totalAlerts}</h3>
                        <p>Security Alerts</p>
                    </div>
                </div>
            </div>

            {highRiskUsers.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h3>🚨 High Risk Users</h3>
                    </div>
                    <div className="card-body">
                        <div className="risk-users-list">
                            {highRiskUsers.map(user => (
                                <div key={user.id} className={`risk-user-item alert-${user.alertLevel}`}>
                                    <div className="user-info">
                                        <strong>{user.firstName} {user.lastName}</strong>
                                        <span className="account-number">{user.accountNumber}</span>
                                    </div>
                                    <div className="risk-info">
                                        <span className={`alert-badge badge-${user.alertLevel}`}>
                                            {user.alertLevel.toUpperCase()}
                                        </span>
                                        <span className="alert-count">{user.recentAlerts} alerts</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h3>📜 Recent Transactions</h3>
                </div>
                <div className="card-body">
                    {overview.recentTransactions.length === 0 ? (
                        <p className="no-data">No recent transactions</p>
                    ) : (
                        <div className="transactions-table">
                            {overview.recentTransactions.map(transaction => (
                                <div key={transaction.id} className="transaction-row">
                                    <div className="transaction-type">
                                        {transaction.type === 'credit' ? '📥' : '📤'}
                                    </div>
                                    <div className="transaction-details">
                                        <p>{transaction.description}</p>
                                        <small>{transaction.date} at {transaction.time}</small>
                                    </div>
                                    <div className={`transaction-amount ${transaction.type}`}>
                                        {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;