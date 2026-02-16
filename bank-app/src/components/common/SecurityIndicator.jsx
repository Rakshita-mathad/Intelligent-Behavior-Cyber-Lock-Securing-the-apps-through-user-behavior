import React from 'react';
import { useBehavior } from '../../context/BehaviorContext';
import { ALERT_LEVELS } from '../../utils/constants';

const SecurityIndicator = () => {
    const { alertLevel, isMonitoring } = useBehavior();

    if (!isMonitoring) return null;

    const getIndicatorColor = () => {
        switch (alertLevel) {
            case ALERT_LEVELS.GREEN:
                return '#10b981';
            case ALERT_LEVELS.AMBER:
                return '#f59e0b';
            case ALERT_LEVELS.RED:
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    const getIndicatorText = () => {
        switch (alertLevel) {
            case ALERT_LEVELS.GREEN:
                return 'Secure';
            case ALERT_LEVELS.AMBER:
                return 'Warning';
            case ALERT_LEVELS.RED:
                return 'Alert';
            default:
                return 'Unknown';
        }
    };

    return (
        <div className="security-indicator">
            <div
                className="security-light"
                style={{ backgroundColor: getIndicatorColor() }}
            ></div>
            <span className="security-text">{getIndicatorText()}</span>
        </div>
    );
};

export default SecurityIndicator;