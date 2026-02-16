import { storage } from '../utils/storage';
import { BEHAVIOR_THRESHOLDS, ALERT_MESSAGES, ALERT_LEVELS } from '../utils/constants';
import { authService } from './authService';

export const behaviorService = {
    // Save baseline behavior profile from demo mode with unique user identifier
    saveBaselineProfile: (userId, profile) => {
        const behaviorProfile = {
            ...profile,
            userId: userId, // Store userId to ensure uniqueness
            createdAt: new Date().toISOString(),
            profileId: `${userId}_${Date.now()}` // Unique profile identifier
        };

        storage.setBehaviorProfile(userId, behaviorProfile);

        console.log(`[BehaviorService] Baseline profile saved for user ${userId}:`, behaviorProfile);
    },

    // Get behavior profile
    getBehaviorProfile: (userId) => {
        const profile = storage.getBehaviorProfile(userId);

        // Verify profile belongs to correct user
        if (profile && profile.userId !== userId) {
            console.warn(`[BehaviorService] Profile mismatch for user ${userId}`);
            return null;
        }

        return profile;
    },

    // Add alert to history
    addAlert: (userId, alert) => {
        const alerts = storage.getAlertHistory(userId);

        const newAlert = {
            ...alert,
            id: `${userId}_${Date.now()}_${Math.random()}`, // Unique alert ID per user
            userId: userId, // Store userId with alert
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        };

        alerts.unshift(newAlert);
        storage.setAlertHistory(userId, alerts);

        console.log(`[BehaviorService] Alert added for user ${userId}:`, newAlert);

        // Check if account should be locked
        const recentAlerts = behaviorService.getRecentAlerts(userId, 10); // Last 10 minutes
        if (recentAlerts.length >= BEHAVIOR_THRESHOLDS.MAX_ALERTS) {
            console.log(`[BehaviorService] Maximum alerts reached for user ${userId}. Locking account...`);
            behaviorService.lockAccount(userId);
            return { ...newAlert, accountLocked: true };
        }

        return newAlert;
    },

    // Get recent alerts (within timeframe in minutes)
    getRecentAlerts: (userId, minutes = 10) => {
        const alerts = storage.getAlertHistory(userId);
        const timeThreshold = Date.now() - (minutes * 60 * 1000);

        return alerts.filter(alert =>
            alert.userId === userId && // Ensure alert belongs to this user
            new Date(alert.timestamp).getTime() > timeThreshold
        );
    },

    // Get all alerts
    getAllAlerts: (userId) => {
        const alerts = storage.getAlertHistory(userId);
        // Filter to ensure only this user's alerts are returned
        return alerts.filter(alert => alert.userId === userId || !alert.userId);
    },

    // Get alert level based on recent alerts
    getAlertLevel: (userId) => {
        const recentAlerts = behaviorService.getRecentAlerts(userId, 10);

        if (recentAlerts.length === 0) {
            return ALERT_LEVELS.GREEN;
        } else if (recentAlerts.length < 2) {
            return ALERT_LEVELS.AMBER;
        } else {
            return ALERT_LEVELS.RED;
        }
    },

    // Lock account - FIXED to only lock the specific user
    lockAccount: (userId) => {
        try {
            console.log(`[BehaviorService] Attempting to lock account for user: ${userId}`);

            // Get all users to verify user exists
            const users = storage.getUsers();
            const userToLock = users.find(u => u.id === userId);

            if (!userToLock) {
                console.error(`[BehaviorService] User ${userId} not found. Cannot lock.`);
                return false;
            }

            console.log(`[BehaviorService] Found user to lock:`, {
                id: userToLock.id,
                name: `${userToLock.firstName} ${userToLock.lastName}`,
                currentLockStatus: userToLock.isLocked
            });

            // CRITICAL: Only update THIS specific user's lock status
            // Do NOT modify any other users
            const updateResult = authService.updateUser(userId, { isLocked: true });

            if (!updateResult) {
                console.error(`[BehaviorService] Failed to update user ${userId}`);
                return false;
            }

            // Verify the lock was applied correctly
            const updatedUsers = storage.getUsers();
            const lockedUser = updatedUsers.find(u => u.id === userId);

            console.log(`[BehaviorService] Lock verification for user ${userId}:`, {
                locked: lockedUser?.isLocked,
                name: `${lockedUser?.firstName} ${lockedUser?.lastName}`
            });

            // Verify NO other users were affected
            const otherUsersChanged = updatedUsers.filter(u =>
                u.id !== userId &&
                u.role !== 'admin'
            );

            console.log(`[BehaviorService] Other users status:`,
                otherUsersChanged.map(u => ({
                    id: u.id,
                    name: `${u.firstName} ${u.lastName}`,
                    isLocked: u.isLocked
                }))
            );

            // Add lock alert ONLY for this specific user
            const alerts = storage.getAlertHistory(userId);
            const lockAlert = {
                id: `${userId}_lock_${Date.now()}`,
                userId: userId,
                type: 'account_locked',
                message: ALERT_MESSAGES.ACCOUNT_LOCKED,
                severity: 'critical',
                timestamp: new Date().toISOString(),
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString()
            };

            alerts.unshift(lockAlert);
            storage.setAlertHistory(userId, alerts);

            console.log(`[BehaviorService] ✅ Account successfully locked for user ${userId}`);
            return true;
        } catch (error) {
            console.error(`[BehaviorService] ❌ Error locking account for user ${userId}:`, error);
            return false;
        }
    },

    // Unlock account (admin only) - FIXED to only unlock the specific user
    unlockAccount: (userId) => {
        try {
            console.log(`[BehaviorService] Attempting to unlock account for user: ${userId}`);

            // Get all users to verify user exists and check current state
            const usersBefore = storage.getUsers();
            const userToUnlock = usersBefore.find(u => u.id === userId);

            if (!userToUnlock) {
                console.error(`[BehaviorService] User ${userId} not found. Cannot unlock.`);
                return false;
            }

            console.log(`[BehaviorService] Found user to unlock:`, {
                id: userToUnlock.id,
                name: `${userToUnlock.firstName} ${userToUnlock.lastName}`,
                currentLockStatus: userToUnlock.isLocked,
                accountNumber: userToUnlock.accountNumber
            });

            // Log state of ALL users BEFORE unlock
            console.log(`[BehaviorService] Users state BEFORE unlock:`,
                usersBefore.filter(u => u.role !== 'admin').map(u => ({
                    id: u.id,
                    name: `${u.firstName} ${u.lastName}`,
                    isLocked: u.isLocked,
                    accountNumber: u.accountNumber
                }))
            );

            // CRITICAL: Only update THIS specific user's lock status
            // This is the key fix - ensure authService.updateUser only affects the target user
            const updateResult = authService.updateUser(userId, { isLocked: false });

            if (!updateResult) {
                console.error(`[BehaviorService] Failed to update user ${userId}`);
                return false;
            }

            // Get users AFTER update to verify
            const usersAfter = storage.getUsers();
            const unlockedUser = usersAfter.find(u => u.id === userId);

            console.log(`[BehaviorService] Unlock verification for user ${userId}:`, {
                unlocked: !unlockedUser?.isLocked,
                name: `${unlockedUser?.firstName} ${unlockedUser?.lastName}`,
                accountNumber: unlockedUser?.accountNumber
            });

            // CRITICAL VERIFICATION: Check that NO other users were affected
            const otherUsersAfter = usersAfter.filter(u =>
                u.id !== userId &&
                u.role !== 'admin'
            );

            console.log(`[BehaviorService] Users state AFTER unlock:`,
                otherUsersAfter.map(u => ({
                    id: u.id,
                    name: `${u.firstName} ${u.lastName}`,
                    isLocked: u.isLocked,
                    accountNumber: u.accountNumber,
                    changed: usersBefore.find(ub => ub.id === u.id)?.isLocked !== u.isLocked ? '⚠️ CHANGED!' : '✅ unchanged'
                }))
            );

            // Detect if any other users were incorrectly affected
            const incorrectlyAffectedUsers = otherUsersAfter.filter(afterUser => {
                const beforeUser = usersBefore.find(u => u.id === afterUser.id);
                return beforeUser && beforeUser.isLocked !== afterUser.isLocked;
            });

            if (incorrectlyAffectedUsers.length > 0) {
                console.error(`[BehaviorService] ❌ BUG DETECTED: Other users were affected by unlock:`,
                    incorrectlyAffectedUsers.map(u => ({
                        id: u.id,
                        name: `${u.firstName} ${u.lastName}`,
                        accountNumber: u.accountNumber
                    }))
                );
                // Attempt to fix by reverting those users
                incorrectlyAffectedUsers.forEach(affectedUser => {
                    const originalState = usersBefore.find(u => u.id === affectedUser.id);
                    if (originalState) {
                        console.log(`[BehaviorService] Reverting user ${affectedUser.id} to original state`);
                        authService.updateUser(affectedUser.id, { isLocked: originalState.isLocked });
                    }
                });
            }

            // Clear alerts and add unlock message ONLY for this specific user
            const unlockAlert = {
                id: `${userId}_unlock_${Date.now()}`,
                userId: userId,
                type: 'account_unlocked',
                message: 'Account unlocked by administrator',
                severity: 'info',
                timestamp: new Date().toISOString(),
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString()
            };

            // Reset alert history with just the unlock message for THIS user ONLY
            storage.setAlertHistory(userId, [unlockAlert]);

            console.log(`[BehaviorService] ✅ Account successfully unlocked for user ${userId}`);
            return true;
        } catch (error) {
            console.error(`[BehaviorService] ❌ Error unlocking account for user ${userId}:`, error);
            return false;
        }
    },

    // Check first feature accessed
    checkFirstFeature: (userId, feature, expectedFeature) => {
        if (feature !== expectedFeature) {
            console.log(`[BehaviorService] First feature mismatch for user ${userId}: expected ${expectedFeature}, got ${feature}`);
            return behaviorService.addAlert(userId, {
                type: 'first_feature',
                message: ALERT_MESSAGES.FIRST_FEATURE,
                severity: 'high',
                details: `Expected: ${expectedFeature}, Accessed: ${feature}`,
                userId: userId
            });
        }
        return null;
    },

    // Get session statistics
    getSessionStats: (userId) => {
        const alerts = behaviorService.getAllAlerts(userId);
        const recentAlerts = behaviorService.getRecentAlerts(userId, 60); // Last hour

        return {
            totalAlerts: alerts.length,
            recentAlerts: recentAlerts.length,
            alertLevel: behaviorService.getAlertLevel(userId),
            lastAlert: alerts[0] || null,
            userId: userId // Include userId in stats
        };
    },

    // Validate behavioral profile uniqueness
    validateProfileUniqueness: (userId) => {
        const profile = behaviorService.getBehaviorProfile(userId);

        if (!profile) {
            return { valid: false, reason: 'No profile found' };
        }

        if (profile.userId !== userId) {
            return { valid: false, reason: 'Profile user mismatch' };
        }

        if (!profile.profileId || !profile.profileId.startsWith(userId)) {
            return { valid: false, reason: 'Invalid profile ID' };
        }

        return { valid: true };
    },

    // Debug utility: Get all users' lock status
    debugGetAllUsersLockStatus: () => {
        const users = storage.getUsers();
        console.log('[BehaviorService] Current lock status of all users:',
            users.filter(u => u.role !== 'admin').map(u => ({
                id: u.id,
                name: `${u.firstName} ${u.lastName}`,
                email: u.email,
                accountNumber: u.accountNumber,
                isLocked: u.isLocked,
                alertLevel: behaviorService.getAlertLevel(u.id)
            }))
        );
        return users;
    }
};