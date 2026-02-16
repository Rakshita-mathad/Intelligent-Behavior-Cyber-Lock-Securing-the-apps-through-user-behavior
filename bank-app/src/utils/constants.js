export const ALERT_LEVELS = {
    GREEN: 'green',
    AMBER: 'amber',
    RED: 'red'
};

export const ALERT_MESSAGES = {
    FIRST_FEATURE: 'Unusual behavior detected: Different feature accessed first',
    MOUSE_SPEED: 'Unusual behavior detected: Mouse movement speed variation',
    KEYSTROKE_SPEED: 'Unusual behavior detected: Typing speed variation',
    WINDOW_SWITCH: 'Unusual behavior detected: Excessive window switching',
    ACCOUNT_LOCKED: 'Account locked due to suspicious activity. Please contact administrator.'
};

export const BEHAVIOR_THRESHOLDS = {
    MOUSE_SPEED_DEVIATION: 0.3, // 30% deviation allowed
    KEYSTROKE_DEVIATION: 0.3, // 30% deviation allowed
    MAX_WINDOW_SWITCHES: 5,
    MAX_ALERTS: 3
};

export const DEMO_ACCOUNT = {
    accountNumber: 'DEMO000000',
    balance: 10000,
    isDemoMode: true
};

export const BANK_FEATURES = {
    BALANCE: 'balance',
    TRANSACTION: 'transaction',
    HISTORY: 'history',
    PROFILE: 'profile'
};

export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin'
};