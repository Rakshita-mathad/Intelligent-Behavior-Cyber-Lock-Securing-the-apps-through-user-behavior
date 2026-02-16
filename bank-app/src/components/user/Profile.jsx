import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBehavior } from '../../context/BehaviorContext';
import { behaviorService } from '../../services/behaviorService';
import AlertModal from '../common/AlertModal';

const Profile = () => {
    const { user } = useAuth();
    const { trackFirstFeature, currentAlert, clearAlert, alertLevel } = useBehavior();
    const [alerts, setAlerts] = useState([]);
    const [behaviorProfile, setBehaviorProfile] = useState(null);
    const [showAlerts, setShowAlerts] = useState(false);

    useEffect(() => {
        if (user) {
            trackFirstFeature('profile');
            setAlerts(behaviorService.getAllAlerts(user.id));
            setBehaviorProfile(behaviorService.getBehaviorProfile(user.id));
        }
    }, [user, trackFirstFeature]);

    if (!user) return null;

    const recentAlerts = alerts.slice(0, 5);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>👤 Profile</h1>
                <p>Manage your account information and security</p>
            </div>

            <div className="profile-grid">
                <div className="card profile-info-card">
                    <div className="card-header">
                        <h3>Personal Information</h3>
                    </div>
                    <div className="card-body">
                        <div className="profile-avatar">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div className="profile-details">
                            <div className="detail-item">
                                <label>Full Name</label>
                                <p>{user.firstName} {user.lastName}</p>
                            </div>
                            <div className="detail-item">
                                <label>Email</label>
                                <p>{user.email}</p>
                            </div>
                            <div className="detail-item">
                                <label>Account Number</label>
                                <p>{user.accountNumber}</p>
                            </div>
                            {user.phone && (
                                <div className="detail-item">
                                    <label>Phone</label>
                                    <p>{user.phone}</p>
                                </div>
                            )}
                            {user.address && (
                                <div className="detail-item">
                                    <label>Address</label>
                                    <p>{user.address}</p>
                                </div>
                            )}
                            <div className="detail-item">
                                <label>Member Since</label>
                                <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card security-status-card">
                    <div className="card-header">
                        <h3>Security Status</h3>
                    </div>
                    <div className="card-body">
                        <div className="security-level-display">
                            <div className={`security-badge-large badge-${alertLevel}`}>
                                {alertLevel === 'green' && '🛡️'}
                                {alertLevel === 'amber' && '⚠️'}
                                {alertLevel === 'red' && '🚨'}
                            </div>
                            <h3 className={`status-${alertLevel}`}>
                                {alertLevel === 'green' && 'Secure'}
                                {alertLevel === 'amber' && 'Caution'}
                                {alertLevel === 'red' && 'High Alert'}
                            </h3>
                            <p>
                                {alertLevel === 'green' && 'Your account is secure and no unusual activity detected.'}
                                {alertLevel === 'amber' && 'Some unusual activity detected. Please review your recent transactions.'}
                                {alertLevel === 'red' && 'Multiple security alerts! Your account may be compromised.'}
                            </p>
                        </div>

                        <div className="security-stats">
                            <div className="stat-box">
                                <span>Total Alerts</span>
                                <strong>{alerts.length}</strong>
                            </div>
                            <div className="stat-box">
                                <span>Account Status</span>
                                <strong className={user.isLocked ? 'status-locked' : 'status-active'}>
                                    {user.isLocked ? 'Locked' : 'Active'}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>

                {behaviorProfile && (
                    <div className="card behavior-profile-card">
                        <div className="card-header">
                            <h3>Behavioral Profile</h3>
                        </div>
                        <div className="card-body">
                            <p className="profile-description">
                                Your unique behavioral pattern established during demo mode:
                            </p>
                            <div className="behavior-metrics">
                                <div className="metric-item">
                                    <label>First Feature Used</label>
                                    <span className="metric-value">
                                        {behaviorProfile.firstFeature ?
                                            behaviorProfile.firstFeature.charAt(0).toUpperCase() + behaviorProfile.firstFeature.slice(1)
                                            : 'N/A'}
                                    </span>
                                </div>
                                <div className="metric-item">
                                    <label>Profile Created</label>
                                    <span className="metric-value">
                                        {new Date(behaviorProfile.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="profile-note">
                                <small>
                                    ℹ️ This profile helps us detect unauthorized access to your account.
                                </small>
                            </div>
                        </div>
                    </div>
                )}

                <div className="card alerts-card">
                    <div className="card-header">
                        <h3>Recent Security Alerts</h3>
                        <button
                            className="btn btn-sm"
                            onClick={() => setShowAlerts(!showAlerts)}
                        >
                            {showAlerts ? 'Hide' : 'Show All'}
                        </button>
                    </div>
                    <div className="card-body">
                        {alerts.length === 0 ? (
                            <p className="no-data">No security alerts</p>
                        ) : (
                            <div className="alerts-list">
                                {(showAlerts ? alerts : recentAlerts).map(alert => (
                                    <div key={alert.id} className={`alert-item severity-${alert.severity}`}>
                                        <div className="alert-icon-small">
                                            {alert.severity === 'critical' && '🚨'}
                                            {alert.severity === 'high' && '⚠️'}
                                            {alert.severity === 'medium' && '⚡'}
                                            {alert.severity === 'info' && 'ℹ️'}
                                        </div>
                                        <div className="alert-content">
                                            <p className="alert-message-small">{alert.message}</p>
                                            <span className="alert-timestamp">{alert.date} at {alert.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AlertModal alert={currentAlert} onClose={clearAlert} />
        </div>
    );
};

export default Profile;