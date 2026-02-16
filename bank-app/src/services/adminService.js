import { storage } from '../utils/storage';
import { behaviorService } from './behaviorService';
import { bankService } from './bankService';

export const adminService = {
    // Get all users
    getAllUsers: () => {
        return storage.getUsers().filter(u => u.role !== 'admin');
    },

    // Get user by ID
    getUserById: (userId) => {
        const users = storage.getUsers();
        return users.find(u => u.id === userId);
    },

    // Get user details with behavior and transactions
    getUserDetails: (userId) => {
        const user = adminService.getUserById(userId);
        if (!user) return null;

        return {
            ...user,
            behaviorProfile: behaviorService.getBehaviorProfile(userId),
            alerts: behaviorService.getAllAlerts(userId),
            transactions: bankService.getTransactions(userId),
            sessionStats: behaviorService.getSessionStats(userId)
        };
    },

    // Lock user account
    lockUserAccount: (userId) => {
        return behaviorService.lockAccount(userId);
    },

    // Unlock user account
    unlockUserAccount: (userId) => {
        return behaviorService.unlockAccount(userId);
    },

    // Get system overview
    getSystemOverview: () => {
        const users = adminService.getAllUsers();
        const allTransactions = bankService.getAllTransactions();

        let totalBalance = 0;
        let lockedAccounts = 0;
        let activeUsers = 0;
        let totalAlerts = 0;

        users.forEach(user => {
            totalBalance += user.balance;
            if (user.isLocked) lockedAccounts++;
            if (user.completedDemo) activeUsers++;

            const alerts = behaviorService.getAllAlerts(user.id);
            totalAlerts += alerts.length;
        });

        return {
            totalUsers: users.length,
            activeUsers,
            lockedAccounts,
            totalTransactions: allTransactions.length,
            totalBalance,
            totalAlerts,
            recentTransactions: allTransactions.slice(0, 10)
        };
    },

    // Get users with high alert levels
    getHighRiskUsers: () => {
        const users = adminService.getAllUsers();

        return users
            .map(user => ({
                ...user,
                alertLevel: behaviorService.getAlertLevel(user.id),
                recentAlerts: behaviorService.getRecentAlerts(user.id, 60).length
            }))
            .filter(user => user.alertLevel === 'red' || user.alertLevel === 'amber')
            .sort((a, b) => b.recentAlerts - a.recentAlerts);
    },

    // Get all alerts across system
    getAllSystemAlerts: () => {
        const users = adminService.getAllUsers();
        const allAlerts = [];

        users.forEach(user => {
            const alerts = behaviorService.getAllAlerts(user.id);
            alerts.forEach(alert => {
                allAlerts.push({
                    ...alert,
                    userId: user.id,
                    userName: `${user.firstName} ${user.lastName}`,
                    accountNumber: user.accountNumber
                });
            });
        });

        return allAlerts.sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );
    },

    // Get usage statistics
    getUsageStatistics: () => {
        const users = adminService.getAllUsers();

        const stats = {
            byAlertLevel: { green: 0, amber: 0, red: 0 },
            byAccountStatus: { active: 0, locked: 0 },
            byDemoCompletion: { completed: 0, pending: 0 }
        };

        users.forEach(user => {
            const alertLevel = behaviorService.getAlertLevel(user.id);
            stats.byAlertLevel[alertLevel]++;

            if (user.isLocked) {
                stats.byAccountStatus.locked++;
            } else {
                stats.byAccountStatus.active++;
            }

            if (user.completedDemo) {
                stats.byDemoCompletion.completed++;
            } else {
                stats.byDemoCompletion.pending++;
            }
        });

        return stats;
    }
};