import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBehavior } from '../../context/BehaviorContext';
import { bankService } from '../../services/bankService';
import { behaviorService } from '../../services/behaviorService';
import AlertModal from '../common/AlertModal';
import '../../styles/dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const { currentAlert, clearAlert, startMonitoring, alertLevel } = useBehavior();
    const [balance, setBalance] = useState(0);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [sessionStats, setSessionStats] = useState(null);

    useEffect(() => {
        if (user) {
            // Start behavior monitoring
            startMonitoring();

            // Load data
            setBalance(bankService.getBalance(user.id));
            setRecentTransactions(bankService.getTransactions(user.id, 5));
            setSessionStats(behaviorService.getSessionStats(user.id));
        }
    }, [user, startMonitoring]);

    if (!user) return null;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Welcome back, {user.firstName}!</h1>
                <p className="account-number">Account: {user.accountNumber}</p>
            </div>

            <div className="dashboard-grid">
                <div className="card balance-card">
                    <div className="card-header">
                        <h3>💰 Current Balance</h3>
                    </div>
                    <div className="card-body">
                        <div className="balance-amount">${balance.toFixed(2)}</div>
                        <p className="balance-label">Available Balance</p>
                    </div>
                </div>

                <div className="card stats-card">
                    <div className="card-header">
                        <h3>📊 Quick Stats</h3>
                    </div>
                    <div className="card-body">
                        <div className="stat-item">
                            <span>Total Transactions</span>
                            <strong>{recentTransactions.length}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Security Level</span>
                            <strong className={`security-level-${alertLevel}`}>
                                {alertLevel.toUpperCase()}
                            </strong>
                        </div>
                        {sessionStats && (
                            <div className="stat-item">
                                <span>Recent Alerts</span>
                                <strong>{sessionStats.recentAlerts}</strong>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card transactions-card">
                    <div className="card-header">
                        <h3>📜 Recent Transactions</h3>
                    </div>
                    <div className="card-body">
                        {recentTransactions.length === 0 ? (
                            <p className="no-data">No transactions yet</p>
                        ) : (
                            <div className="transaction-list">
                                {recentTransactions.map(transaction => (
                                    <div key={transaction.id} className="transaction-item">
                                        <div className="transaction-icon">
                                            {transaction.type === 'credit' ? '📥' : '📤'}
                                        </div>
                                        <div className="transaction-details">
                                            <p className="transaction-desc">{transaction.description}</p>
                                            <span className="transaction-date">{transaction.date}</span>
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

                <div className="card security-card">
                    <div className="card-header">
                        <h3>🔒 Security Status</h3>
                    </div>
                    <div className="card-body">
                        <div className="security-info">
                            <div className="security-badge">
                                <span className={`badge badge-${alertLevel}`}>
                                    {alertLevel === 'green' && '✓ Secure'}
                                    {alertLevel === 'amber' && '⚠ Warning'}
                                    {alertLevel === 'red' && '🚨 Alert'}
                                </span>
                            </div>
                            <p className="security-message">
                                {alertLevel === 'green' && 'Your account activity appears normal.'}
                                {alertLevel === 'amber' && 'Unusual activity detected. Please be cautious.'}
                                {alertLevel === 'red' && 'Multiple security alerts detected!'}
                            </p>
                            {sessionStats && sessionStats.totalAlerts > 0 && (
                                <div className="alert-summary">
                                    <p>Total Alerts: <strong>{sessionStats.totalAlerts}</strong></p>
                                    {sessionStats.lastAlert && (
                                        <p className="last-alert">
                                            Last: {sessionStats.lastAlert.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AlertModal alert={currentAlert} onClose={clearAlert} />
        </div>
    );
};

export default Dashboard;