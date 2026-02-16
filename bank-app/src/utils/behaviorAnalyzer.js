import { BEHAVIOR_THRESHOLDS, ALERT_MESSAGES } from './constants';

export class BehaviorAnalyzer {
    constructor() {
        this.mouseMovements = [];
        this.keystrokes = [];
        this.windowSwitches = 0;
        this.lastActiveTime = Date.now();
        this.sessionStartTime = Date.now();
    }

    // Mouse movement tracking
    trackMouseMovement(event) {
        const now = Date.now();
        if (this.mouseMovements.length > 0) {
            const lastMovement = this.mouseMovements[this.mouseMovements.length - 1];
            const timeDiff = now - lastMovement.timestamp;
            const distance = Math.sqrt(
                Math.pow(event.clientX - lastMovement.x, 2) +
                Math.pow(event.clientY - lastMovement.y, 2)
            );
            const speed = distance / timeDiff;

            this.mouseMovements.push({
                x: event.clientX,
                y: event.clientY,
                timestamp: now,
                speed: speed
            });

            // Keep only last 100 movements
            if (this.mouseMovements.length > 100) {
                this.mouseMovements.shift();
            }
        } else {
            this.mouseMovements.push({
                x: event.clientX,
                y: event.clientY,
                timestamp: now,
                speed: 0
            });
        }
    }

    // Keystroke tracking
    trackKeystroke(event) {
        const now = Date.now();
        this.keystrokes.push({
            key: event.key,
            timestamp: now
        });

        // Keep only last 100 keystrokes
        if (this.keystrokes.length > 100) {
            this.keystrokes.shift();
        }
    }

    // Window switch tracking
    trackWindowSwitch() {
        this.windowSwitches++;
    }

    resetWindowSwitches() {
        this.windowSwitches = 0;
    }

    // Calculate average mouse speed
    getAverageMouseSpeed() {
        if (this.mouseMovements.length < 2) return 0;
        const speeds = this.mouseMovements
            .map(m => m.speed)
            .filter(s => s > 0);
        return speeds.reduce((a, b) => a + b, 0) / speeds.length;
    }

    // Calculate average keystroke speed (keys per second)
    getAverageKeystrokeSpeed() {
        if (this.keystrokes.length < 2) return 0;
        const timeSpan = this.keystrokes[this.keystrokes.length - 1].timestamp -
            this.keystrokes[0].timestamp;
        return (this.keystrokes.length / timeSpan) * 1000; // keys per second
    }

    // Compare current behavior with baseline
    compareBehavior(baseline) {
        const alerts = [];

        // Check mouse speed
        const currentMouseSpeed = this.getAverageMouseSpeed();
        if (baseline.mouseSpeed && currentMouseSpeed > 0) {
            const deviation = Math.abs(currentMouseSpeed - baseline.mouseSpeed) / baseline.mouseSpeed;
            if (deviation > BEHAVIOR_THRESHOLDS.MOUSE_SPEED_DEVIATION) {
                alerts.push({
                    type: 'mouse_speed',
                    message: ALERT_MESSAGES.MOUSE_SPEED,
                    severity: deviation > 0.5 ? 'high' : 'medium',
                    timestamp: Date.now()
                });
            }
        }

        // Check keystroke speed
        const currentKeystrokeSpeed = this.getAverageKeystrokeSpeed();
        if (baseline.keystrokeSpeed && currentKeystrokeSpeed > 0) {
            const deviation = Math.abs(currentKeystrokeSpeed - baseline.keystrokeSpeed) / baseline.keystrokeSpeed;
            if (deviation > BEHAVIOR_THRESHOLDS.KEYSTROKE_DEVIATION) {
                alerts.push({
                    type: 'keystroke_speed',
                    message: ALERT_MESSAGES.KEYSTROKE_SPEED,
                    severity: deviation > 0.5 ? 'high' : 'medium',
                    timestamp: Date.now()
                });
            }
        }

        // Check window switches
        if (this.windowSwitches > BEHAVIOR_THRESHOLDS.MAX_WINDOW_SWITCHES) {
            alerts.push({
                type: 'window_switch',
                message: ALERT_MESSAGES.WINDOW_SWITCH,
                severity: 'high',
                timestamp: Date.now()
            });
            this.resetWindowSwitches();
        }

        return alerts;
    }

    // Get baseline profile
    getBaselineProfile() {
        return {
            mouseSpeed: this.getAverageMouseSpeed(),
            keystrokeSpeed: this.getAverageKeystrokeSpeed(),
            timestamp: Date.now()
        };
    }

    // Reset all tracking
    reset() {
        this.mouseMovements = [];
        this.keystrokes = [];
        this.windowSwitches = 0;
        this.sessionStartTime = Date.now();
    }
}