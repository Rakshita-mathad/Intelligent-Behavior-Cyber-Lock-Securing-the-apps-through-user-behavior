import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/global.css';

const AlertModal = ({ alert, onClose }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    if (!alert) return null;

    const handleAccountLocked = () => {
        logout();
        navigate('/login');
    };

    const getSeverityColor = () => {
        switch (alert.severity) {
            case 'critical':
                return '#dc2626';
            case 'high':
                return '#ea580c';
            case 'medium':
                return '#f59e0b';
            default:
                return '#3b82f6';
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content alert-modal">
                <div className="alert-icon" style={{ backgroundColor: getSeverityColor() }}>
                    <span>⚠</span>
                </div>

                <h2 className="alert-title">
                    {alert.accountLocked ? 'Account Locked' : 'Security Alert'}
                </h2>

                <p className="alert-message">{alert.message}</p>

                {alert.details && (
                    <p className="alert-details">{alert.details}</p>
                )}

                <div className="alert-info">
                    <span className="alert-time">{alert.time}</span>
                    <span className={`alert-severity severity-${alert.severity}`}>
                        {alert.severity}
                    </span>
                </div>

                {alert.accountLocked ? (
                    <button className="btn btn-danger" onClick={handleAccountLocked}>
                        Return to Login
                    </button>
                ) : (
                    <button className="btn btn-primary" onClick={onClose}>
                        I Understand
                    </button>
                )}
            </div>
        </div>
    );
};

export default AlertModal;