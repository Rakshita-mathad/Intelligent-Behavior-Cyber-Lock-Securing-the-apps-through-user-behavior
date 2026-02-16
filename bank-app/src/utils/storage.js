// FIXED VERSION - Handles missing userId gracefully
export const storage = {
    // User data
    setUser: (user) => {
        localStorage.setItem('currentUser', JSON.stringify(user));
    },

    getUser: () => {
        try {
            const user = localStorage.getItem('currentUser');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('[Storage] Error parsing user data:', error);
            localStorage.removeItem('currentUser');
            return null;
        }
    },

    removeUser: () => {
        localStorage.removeItem('currentUser');
    },

    // All users
    getUsers: () => {
        try {
            const users = localStorage.getItem('users');
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.error('[Storage] Error parsing users data:', error);
            localStorage.removeItem('users');
            return [];
        }
    },

    setUsers: (users) => {
        localStorage.setItem('users', JSON.stringify(users));
    },

    // Behavioral data - FIXED TO STOP WARNINGS
    setBehaviorProfile: (userId, profile) => {
        const key = `behavior_${userId}`;
        const profileWithMetadata = {
            ...profile,
            userId: userId, // Always store userId
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(key, JSON.stringify(profileWithMetadata));
        console.log(`[Storage] ✅ Behavior profile saved for user ${userId}`);
    },

    getBehaviorProfile: (userId) => {
        try {
            const key = `behavior_${userId}`;
            const profileData = localStorage.getItem(key);

            // No profile = user hasn't completed demo yet (NORMAL)
            if (!profileData) {
                return null;
            }

            const parsedProfile = JSON.parse(profileData);

            // MIGRATION FIX: Old profiles don't have userId
            if (!parsedProfile.userId) {
                // Silently add userId and save
                parsedProfile.userId = userId;
                localStorage.setItem(key, JSON.stringify(parsedProfile));
                return parsedProfile;
            }

            // Validate (but only warn, don't spam console)
            if (parsedProfile.userId !== userId) {
                console.warn(`[Storage] Profile userId mismatch for ${userId}`);
                return null;
            }

            return parsedProfile;
        } catch (error) {
            console.error(`[Storage] Error getting profile for ${userId}:`, error);
            localStorage.removeItem(`behavior_${userId}`);
            return null;
        }
    },

    // Transactions
    getTransactions: (userId) => {
        try {
            const key = `transactions_${userId}`;
            const data = localStorage.getItem(key);

            if (!data) return [];

            const parsed = JSON.parse(data);

            // Auto-migrate: add userId if missing
            return parsed.map(t => ({
                ...t,
                userId: t.userId || userId
            })).filter(t => t.userId === userId);
        } catch (error) {
            console.error(`[Storage] Error getting transactions for ${userId}:`, error);
            localStorage.removeItem(`transactions_${userId}`);
            return [];
        }
    },

    setTransactions: (userId, transactions) => {
        const key = `transactions_${userId}`;
        const validated = transactions.map(t => ({
            ...t,
            userId: userId
        }));
        localStorage.setItem(key, JSON.stringify(validated));
    },

    // Alert history
    getAlertHistory: (userId) => {
        try {
            const key = `alerts_${userId}`;
            const data = localStorage.getItem(key);

            if (!data) return [];

            const parsed = JSON.parse(data);

            // Auto-migrate: add userId if missing
            return parsed.map(a => ({
                ...a,
                userId: a.userId || userId
            })).filter(a => a.userId === userId);
        } catch (error) {
            console.error(`[Storage] Error getting alerts for ${userId}:`, error);
            localStorage.removeItem(`alerts_${userId}`);
            return [];
        }
    },

    setAlertHistory: (userId, alerts) => {
        const key = `alerts_${userId}`;
        const validated = alerts.map(a => ({
            ...a,
            userId: userId
        }));
        localStorage.setItem(key, JSON.stringify(validated));
    },

    // Clear specific user data
    clearUserData: (userId) => {
        localStorage.removeItem(`behavior_${userId}`);
        localStorage.removeItem(`transactions_${userId}`);
        localStorage.removeItem(`alerts_${userId}`);
        console.log(`[Storage] Cleared data for user ${userId}`);
    },

    // Clear all
    clearAll: () => {
        localStorage.clear();
    }
};