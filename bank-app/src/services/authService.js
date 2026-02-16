import { storage } from '../utils/storage';
import { USER_ROLES } from '../utils/constants';

export const authService = {
    register: (userData) => {
        try {
            const users = storage.getUsers();

            // Check if user already exists
            const existingUser = users.find(u => u.email === userData.email);
            if (existingUser) {
                throw new Error('User already exists with this email');
            }

            // Generate account number
            const accountNumber = 'ACC' + Date.now() + Math.floor(Math.random() * 1000);

            const newUser = {
                id: Date.now().toString(),
                ...userData,
                accountNumber,
                balance: 0,
                role: USER_ROLES.USER,
                isLocked: false,
                createdAt: new Date().toISOString(),
                completedDemo: false
            };

            users.push(newUser);
            storage.setUsers(users);

            console.log(`[AuthService] User registered:`, {
                id: newUser.id,
                name: `${newUser.firstName} ${newUser.lastName}`,
                email: newUser.email
            });

            return newUser;
        } catch (error) {
            // If it's our custom error, rethrow it
            if (error.message === 'User already exists with this email') {
                throw error;
            }
            // Handle corrupted storage data
            console.error('[AuthService] Error during registration:', error);
            throw new Error('Registration failed. Please try again.');
        }
    },

    login: (email, password) => {
        try {
            const users = storage.getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (!user) {
                throw new Error('Invalid email or password');
            }

            if (user.isLocked) {
                throw new Error('Account is locked. Please contact administrator.');
            }

            storage.setUser(user);

            console.log(`[AuthService] User logged in:`, {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                role: user.role
            });

            return user;
        } catch (error) {
            // If it's our custom error, rethrow it
            if (error.message === 'Invalid email or password' ||
                error.message === 'Account is locked. Please contact administrator.') {
                throw error;
            }
            // Handle corrupted storage data
            console.error('[AuthService] Error during login:', error);
            throw new Error('Login failed. Please try clearing your browser data and try again.');
        }
    },

    logout: () => {
        try {
            const currentUser = storage.getUser();
            if (currentUser) {
                console.log(`[AuthService] User logged out:`, {
                    id: currentUser.id,
                    name: `${currentUser.firstName} ${currentUser.lastName}`
                });
            }
            storage.removeUser();
        } catch (error) {
            console.error('[AuthService] Error during logout:', error);
            // Force clear even if there's an error
            localStorage.removeItem('currentUser');
        }
    },

    getCurrentUser: () => {
        try {
            return storage.getUser();
        } catch (error) {
            console.error('[AuthService] Error getting current user:', error);
            // Clear corrupted data
            localStorage.removeItem('currentUser');
            return null;
        }
    },

    // CRITICAL FIX: Only update the SPECIFIC user, no side effects
    updateUser: (userId, updates) => {
        try {
            console.log(`[AuthService] Updating user ${userId} with:`, updates);

            // Get all users
            const users = storage.getUsers();

            // Find the specific user to update
            const userIndex = users.findIndex(u => u.id === userId);

            if (userIndex === -1) {
                console.error(`[AuthService] User ${userId} not found`);
                throw new Error('User not found');
            }

            // Log state before update
            const userBefore = { ...users[userIndex] };
            console.log(`[AuthService] User state BEFORE update:`, {
                id: userBefore.id,
                name: `${userBefore.firstName} ${userBefore.lastName}`,
                isLocked: userBefore.isLocked
            });

            // CRITICAL: Only update THIS specific user at this specific index
            // Create a new user object with the updates
            users[userIndex] = {
                ...users[userIndex],
                ...updates
            };

            // Log state after update
            console.log(`[AuthService] User state AFTER update:`, {
                id: users[userIndex].id,
                name: `${users[userIndex].firstName} ${users[userIndex].lastName}`,
                isLocked: users[userIndex].isLocked
            });

            // Save ALL users back (with only this one changed)
            storage.setUsers(users);

            // Verify the update was saved correctly
            const verifyUsers = storage.getUsers();
            const verifyUser = verifyUsers.find(u => u.id === userId);
            console.log(`[AuthService] Verification - user ${userId} after save:`, {
                id: verifyUser.id,
                isLocked: verifyUser.isLocked,
                matchesUpdate: verifyUser.isLocked === updates.isLocked
            });

            // Verify NO other users were changed
            const otherUsers = verifyUsers.filter(u => u.id !== userId && u.role !== 'admin');
            const unexpectedChanges = otherUsers.filter(u => {
                const originalUser = users.find(ou => ou.id === u.id);
                return originalUser && originalUser.isLocked !== u.isLocked;
            });

            if (unexpectedChanges.length > 0) {
                console.error(`[AuthService] ❌ WARNING: Other users were unexpectedly changed:`,
                    unexpectedChanges.map(u => ({
                        id: u.id,
                        name: `${u.firstName} ${u.lastName}`
                    }))
                );
            } else {
                console.log(`[AuthService] ✅ Verified: No other users were affected`);
            }

            // Update current user if it's the same
            const currentUser = storage.getUser();
            if (currentUser && currentUser.id === userId) {
                storage.setUser(users[userIndex]);
                console.log(`[AuthService] Current user session updated`);
            }

            return users[userIndex];
        } catch (error) {
            // If it's our custom error, rethrow it
            if (error.message === 'User not found') {
                throw error;
            }
            // Handle corrupted storage data
            console.error('[AuthService] Error updating user:', error);
            throw new Error('Failed to update user. Please try again.');
        }
    },

    // Initialize admin account
    initializeAdmin: () => {
        try {
            const users = storage.getUsers();
            const adminExists = users.find(u => u.role === USER_ROLES.ADMIN);

            if (!adminExists) {
                const admin = {
                    id: 'admin_001',
                    firstName: 'Admin',
                    lastName: 'User',
                    email: 'admin@securebank.com',
                    password: 'admin123',
                    role: USER_ROLES.ADMIN,
                    accountNumber: 'ADMIN001',
                    balance: 0,
                    isLocked: false,
                    createdAt: new Date().toISOString(),
                    completedDemo: true
                };

                users.push(admin);
                storage.setUsers(users);
                console.log('[AuthService] Admin account initialized');
            }
        } catch (error) {
            console.error('[AuthService] Error initializing admin:', error);
            // Clear corrupted data and reinitialize
            localStorage.removeItem('users');

            // Retry initialization with fresh storage
            try {
                const admin = {
                    id: 'admin_001',
                    firstName: 'Admin',
                    lastName: 'User',
                    email: 'admin@securebank.com',
                    password: 'admin123',
                    role: USER_ROLES.ADMIN,
                    accountNumber: 'ADMIN001',
                    balance: 0,
                    isLocked: false,
                    createdAt: new Date().toISOString(),
                    completedDemo: true
                };

                storage.setUsers([admin]);
                console.log('[AuthService] Admin account initialized after retry');
            } catch (retryError) {
                console.error('[AuthService] Failed to initialize admin after retry:', retryError);
            }
        }
    }
};              