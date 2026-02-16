import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';

const SystemOverview = () => {
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState(null);
    const [filterSeverity, setFilterSeverity] = useState('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const allAlerts = adminService.getAllSystemAlerts();
        const usageStats = adminService.getUsageStatistics();
        setAlerts(allAlerts);
        setStats(usageStats);
    };

    const getFilteredAlerts = () => {
        if (filterSeverity === 'all') return alerts;
        return alerts.filter(a => a.severity === filterSeverity);
    };

    const filteredAlerts = getFilteredAlerts();

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>📈 System Overview</h1>
                <p>Monitor system-wide activity and alerts</p>
            </div>

            {stats && (
                <div className="overview-grid">
                    <div className="overview-card">
                        <h3>Alert Levels</h3>
                        <div className="chart-data">
                            <div className="chart-item">
                                <div className="chart-bar" style={{ width: `${(stats.byAlertLevel.green / (stats.byAlertLevel.green + stats.byAlertLevel.amber + stats.byAlertLevel.red) * 100) || 0}%`, backgroundColor: '#10b981' }}></div>
                                <div className="chart-label">
                                    <span>Green</span>
                                    <strong>{stats.byAlertLevel.green}</strong>
                                </div>
                            </div>
                            <div className="chart-item">
                                <div className="chart-bar" style={{ width: `${(stats.byAlertLevel.amber / (stats.byAlertLevel.green + stats.byAlertLevel.amber + stats.byAlertLevel.red) * 100) || 0}%`, backgroundColor: '#f59e0b' }}></div>
                                <div className="chart-label">
                                    <span>Amber</span>
                                    <strong>{stats.byAlertLevel.amber}</strong>
                                </div>
                            </div>
                            <div className="chart-item">
                                <div className="chart-bar" style={{ width: `${(stats.byAlertLevel.red / (stats.byAlertLevel.green + stats.byAlertLevel.amber + stats.byAlertLevel.red) * 100) || 0}%`, backgroundColor: '#ef4444' }}></div>
                                <div className="chart-label">
                                    <span>Red</span>
                                    <strong>{stats.byAlertLevel.red}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overview-card">
                        <h3>Account Status</h3>
                        <div className="chart-data">
                            <div className="chart-item">
                                <div className="chart-bar" style={{ width: `${(stats.byAccountStatus.active / (stats.byAccountStatus.active + stats.byAccountStatus.locked) * 100) || 0}%`, backgroundColor: '#10b981' }}></div>
                                <div className="chart-label">
                                    <span>Active</span>
                                    <strong>{stats.byAccountStatus.active}</strong>
                                </div>
                            </div>
                            <div className="chart-item">
                                <div className="chart-bar" style={{ width: `${(stats.byAccountStatus.locked / (stats.byAccountStatus.active + stats.byAccountStatus.locked) * 100) || 0}%`, backgroundColor: '#ef4444' }}></div>
                                <div className="chart-label">
                                    <span>Locked</span>
                                    <strong>{stats.byAccountStatus.locked}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overview-card">
                        <h3>Demo Completion</h3>
                        <div className="chart-data">
                            <div className="chart-item">
                                <div className="chart-bar" style={{ width: `${(stats.byDemoCompletion.completed / (stats.byDemoCompletion.completed + stats.byDemoCompletion.pending) * 100) || 0}%`, backgroundColor: '#3b82f6' }}></div>
                                <div className="chart-label">
                                    <span>Completed</span>
                                    <strong>{stats.byDemoCompletion.completed}</strong>
                                </div>
                            </div>
                            <div className="chart-item">
                                <div className="chart-bar" style={{ width: `${(stats.byDemoCompletion.pending / (stats.byDemoCompletion.completed + stats.byDemoCompletion.pending) * 100) || 0}%`, backgroundColor: '#6b7280' }}></div>
                                <div className="chart-label">
                                    <span>Pending</span>
                                    <strong>{stats.byDemoCompletion.pending}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h3>🚨 All System Alerts</h3>
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filterSeverity === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterSeverity('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${filterSeverity === 'critical' ? 'active' : ''}`}
                            onClick={() => setFilterSeverity('critical')}
                        >
                            Critical
                        </button>
                        <button
                            className={`filter-btn ${filterSeverity === 'high' ? 'active' : ''}`}
                            onClick={() => setFilterSeverity('high')}
                        >
                            High
                        </button>
                        <button
                            className={`filter-btn ${filterSeverity === 'medium' ? 'active' : ''}`}
                            onClick={() => setFilterSeverity('medium')}
                        >
                            Medium
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    {filteredAlerts.length === 0 ? (
                        <p className="no-data">No alerts found</p>
                    ) : (
                        <div className="system-alerts-table">
                            <div className="table-header-admin">
                                <div>User</div>
                                <div>Alert</div>
                                <div>Severity</div>
                                <div>Date & Time</div>
                            </div>
                            {filteredAlerts.slice(0, 50).map(alert => (
                                <div key={alert.id} className={`table-row-admin severity-${alert.severity}`}>
                                    <div className="user-cell">
                                        <strong>{alert.userName}</strong>
                                        <small>{alert.accountNumber}</small>
                                    </div>
                                    <div className="alert-cell">
                                        {alert.message}
                                    </div>
                                    <div className="severity-cell">
                                        <span className={`severity-badge severity-${alert.severity}`}>
                                            {alert.severity}
                                        </span>
                                    </div>
                                    <div className="time-cell">
                                        <div>{alert.date}</div>
                                        <small>{alert.time}</small>
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

export default SystemOverview;