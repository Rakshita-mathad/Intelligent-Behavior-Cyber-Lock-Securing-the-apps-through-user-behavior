import { useState, useEffect } from 'react'
import '../styles/BehaviorMonitor.css'

function BehaviorMonitor({ alertLevel, alerts, windowSwitchCount, onDismissAlert }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [showNotification, setShowNotification] = useState(false)

    useEffect(() => {
        if (alerts.length > 0) {
            setShowNotification(true)
            const timer = setTimeout(() => {
                setShowNotification(false)
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [alerts.length])

    const getStatusColor = () => {
        switch (alertLevel) {
            case 'green':
                return '#4caf50'
            case 'amber':
                return '#ff9800'
            case 'red':
                return '#f44336'
            default:
                return '#4caf50'
        }
    }

    const getStatusText = () => {
        switch (alertLevel) {
            case 'green':
                return 'Secure'
            case 'amber':
                return 'Warning'
            case 'red':
                return 'Alert'
            default:
                return 'Secure'
        }
    }

    const getStatusIcon = () => {
        switch (alertLevel) {
            case 'green':
                return '✓'
            case 'amber':
                return '⚠'
            case 'red':
                return '⚠'
            default:
                return '✓'
        }
    }

    return (
        <>
            {/* Floating Status Indicator */}
            <div
                className="behavior-monitor-indicator"
                style={{ backgroundColor: getStatusColor() }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className="indicator-icon">{getStatusIcon()}</span>
                <span className="indicator-text">{getStatusText()}</span>
                {alerts.length > 0 && (
                    <span className="alert-badge">{alerts.length}</span>
                )}
            </div>

            {/* Notification Toast */}
            {showNotification && alerts.length > 0 && (
                <div className={`notification-toast ${alertLevel}`}>
                    <div className="toast-icon">{getStatusIcon()}</div>
                    <div className="toast-content">
                        <h4>Security Alert</h4>
                        <p>{alerts[alerts.length - 1].message}</p>
                    </div>
                    <button
                        className="toast-close"
                        onClick={() => setShowNotification(false)}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Expanded Monitor Panel */}
            {isExpanded && (
                <div className="behavior-monitor-panel">
                    <div className="monitor-header">
                        <h3>Security Monitor</h3>
                        <button
                            className="close-button"
                            onClick={() => setIsExpanded(false)}
                        >
                            ×
                        </button>
                    </div>

                    <div className="monitor-body">
                        {/* Current Status */}
                        <div className="status-section">
                            <div className="status-item">
                                <span className="status-label">Current Status:</span>
                                <span
                                    className="status-value"
                                    style={{ color: getStatusColor() }}
                                >
                                    {getStatusIcon()} {getStatusText()}
                                </span>
                            </div>
                            <div className="status-item">
                                <span className="status-label">Window Switches:</span>
                                <span className={`status-value ${windowSwitchCount > 5 ? 'warning' : ''}`}>
                                    {windowSwitchCount} / 5
                                </span>
                            </div>
                            <div className="status-item">
                                <span className="status-label">Total Alerts:</span>
                                <span className={`status-value ${alerts.length >= 3 ? 'danger' : ''}`}>
                                    {alerts.length} / 3
                                </span>
                            </div>
                        </div>

                        {/* Security Level Indicator */}
                        <div className="security-level">
                            <h4>Security Level</h4>
                            <div className="level-bars">
                                <div className={`level-bar ${alertLevel === 'green' ? 'active' : ''}`}>
                                    <div className="bar green"></div>
                                    <span>Green - Secure</span>
                                </div>
                                <div className={`level-bar ${alertLevel === 'amber' ? 'active' : ''}`}>
                                    <div className="bar amber"></div>
                                    <span>Amber - Warning</span>
                                </div>
                                <div className={`level-bar ${alertLevel === 'red' ? 'active' : ''}`}>
                                    <div className="bar red"></div>
                                    <span>Red - Critical</span>
                                </div>
                            </div>
                        </div>

                        {/* Alert History */}
                        <div className="alerts-section">
                            <h4>Alert History</h4>
                            {alerts.length === 0 ? (
                                <p className="no-alerts">No security alerts</p>
                            ) : (
                                <div className="alerts-list">
                                    {alerts.slice().reverse().map((alert) => (
                                        <div
                                            key={alert.id}
                                            className={`alert-item ${alert.level}`}
                                        >
                                            <div className="alert-icon">
                                                {alert.level === 'red' ? '🔴' : '🟡'}
                                            </div>
                                            <div className="alert-details">
                                                <p className="alert-message">{alert.message}</p>
                                                <p className="alert-time">
                                                    {new Date(alert.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Warning Message */}
                        {alerts.length >= 2 && (
                            <div className="warning-box">
                                <p>
                                    ⚠️ <strong>Warning:</strong> You have {alerts.length} alert(s).
                                    After 3 alerts, your account will be automatically locked.
                                </p>
                            </div>
                        )}

                        {/* Info Section */}
                        <div className="info-section">
                            <h4>Monitored Behaviors</h4>
                            <ul>
                                <li>✓ First action pattern matching</li>
                                <li>✓ Mouse movement speed analysis</li>
                                <li>✓ Keyboard typing rhythm</li>
                                <li>✓ Window switching frequency</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay when panel is open */}
            {isExpanded && (
                <div
                    className="monitor-overlay"
                    onClick={() => setIsExpanded(false)}
                ></div>
            )}
        </>
    )
}

export default BehaviorMonitor