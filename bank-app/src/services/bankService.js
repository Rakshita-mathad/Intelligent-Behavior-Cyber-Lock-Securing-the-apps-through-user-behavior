import { storage } from '../utils/storage';
import { authService } from './authService';

export const bankService = {
    getBalance: (userId) => {
        const users = storage.getUsers();
        const user = users.find(u => u.id === userId);
        console.log(`[BankService] getBalance for ${userId}: $${user?.balance || 0}`);
        return user ? user.balance : 0;
    },

    deposit: (userId, amount, description = 'Deposit') => {
        console.log(`\n🔵 [BankService] DEPOSIT START - User: ${userId}, Amount: $${amount}`);

        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        const users = storage.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            console.error(`❌ [BankService] User ${userId} not found`);
            throw new Error('User not found');
        }

        const oldBalance = users[userIndex].balance;
        users[userIndex].balance += amount;
        const newBalance = users[userIndex].balance;

        console.log(`💰 [BankService] Balance: $${oldBalance} → $${newBalance}`);

        storage.setUsers(users);

        // Update current user
        const currentUser = storage.getUser();
        if (currentUser && currentUser.id === userId) {
            storage.setUser(users[userIndex]);
        }

        // Add transaction
        const transaction = this.addTransaction(userId, {
            type: 'credit',
            amount,
            description,
            balanceAfter: newBalance
        });

        console.log(`✅ [BankService] DEPOSIT COMPLETE - Transaction ID: ${transaction.id}\n`);

        return newBalance;
    },

    withdraw: (userId, amount, description = 'Withdrawal') => {
        console.log(`\n🔴 [BankService] WITHDRAW START - User: ${userId}, Amount: $${amount}`);

        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        const users = storage.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            console.error(`❌ [BankService] User ${userId} not found`);
            throw new Error('User not found');
        }

        if (users[userIndex].balance < amount) {
            throw new Error('Insufficient balance');
        }

        const oldBalance = users[userIndex].balance;
        users[userIndex].balance -= amount;
        const newBalance = users[userIndex].balance;

        console.log(`💰 [BankService] Balance: $${oldBalance} → $${newBalance}`);

        storage.setUsers(users);

        // Update current user
        const currentUser = storage.getUser();
        if (currentUser && currentUser.id === userId) {
            storage.setUser(users[userIndex]);
        }

        // Add transaction
        const transaction = this.addTransaction(userId, {
            type: 'debit',
            amount,
            description,
            balanceAfter: newBalance
        });

        console.log(`✅ [BankService] WITHDRAW COMPLETE - Transaction ID: ${transaction.id}\n`);

        return newBalance;
    },

    transfer: (fromUserId, toAccountNumber, amount, description = 'Transfer') => {
        console.log(`\n💸 [BankService] TRANSFER START`);
        console.log(`   From User: ${fromUserId}`);
        console.log(`   To Account: ${toAccountNumber}`);
        console.log(`   Amount: $${amount}`);

        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        const users = storage.getUsers();
        const fromUserIndex = users.findIndex(u => u.id === fromUserId);
        const toUser = users.find(u => u.accountNumber === toAccountNumber);

        if (fromUserIndex === -1) {
            console.error(`❌ [BankService] Sender ${fromUserId} not found`);
            throw new Error('Sender not found');
        }

        if (!toUser) {
            console.error(`❌ [BankService] Recipient account ${toAccountNumber} not found`);
            throw new Error('Recipient account not found');
        }

        if (users[fromUserIndex].balance < amount) {
            throw new Error('Insufficient balance');
        }

        const senderOldBalance = users[fromUserIndex].balance;
        const recipientOldBalance = toUser.balance;

        // Deduct from sender
        users[fromUserIndex].balance -= amount;

        // Add to recipient
        const toUserIndex = users.findIndex(u => u.id === toUser.id);
        users[toUserIndex].balance += amount;

        console.log(`💰 [BankService] Sender Balance: $${senderOldBalance} → $${users[fromUserIndex].balance}`);
        console.log(`💰 [BankService] Recipient Balance: $${recipientOldBalance} → $${users[toUserIndex].balance}`);

        storage.setUsers(users);

        // Update current user if sender
        const currentUser = storage.getUser();
        if (currentUser && currentUser.id === fromUserId) {
            storage.setUser(users[fromUserIndex]);
        }

        // Add transaction for SENDER (debit)
        console.log(`📝 [BankService] Creating SENDER transaction...`);
        const senderTransaction = this.addTransaction(fromUserId, {
            type: 'debit',
            amount,
            description: `Transfer to ${toAccountNumber} - ${description}`,
            balanceAfter: users[fromUserIndex].balance,
            recipient: toAccountNumber
        });
        console.log(`   ✅ Sender transaction created: ${senderTransaction.id}`);

        // Add transaction for RECIPIENT (credit)
        console.log(`📝 [BankService] Creating RECIPIENT transaction...`);
        const recipientTransaction = this.addTransaction(toUser.id, {
            type: 'credit',
            amount,
            description: `Transfer from ${users[fromUserIndex].accountNumber} - ${description}`,
            balanceAfter: users[toUserIndex].balance,
            sender: users[fromUserIndex].accountNumber
        });
        console.log(`   ✅ Recipient transaction created: ${recipientTransaction.id}`);

        // VERIFICATION: Check that both transactions were saved
        console.log(`🔍 [BankService] VERIFICATION:`);
        const senderTxns = storage.getTransactions(fromUserId);
        const recipientTxns = storage.getTransactions(toUser.id);
        console.log(`   Sender (${fromUserId}): ${senderTxns.length} transactions`);
        console.log(`   Recipient (${toUser.id}): ${recipientTxns.length} transactions`);

        if (senderTxns.length === 0) {
            console.error(`❌ WARNING: Sender transactions not saved!`);
        }
        if (recipientTxns.length === 0) {
            console.error(`❌ WARNING: Recipient transactions not saved!`);
        }

        console.log(`✅ [BankService] TRANSFER COMPLETE\n`);

        return users[fromUserIndex].balance;
    },

    addTransaction: (userId, transactionData) => {
        console.log(`\n📝 [BankService] addTransaction for user ${userId}`);
        console.log(`   Type: ${transactionData.type}, Amount: $${transactionData.amount}`);

        try {
            // Get existing transactions
            const transactions = storage.getTransactions(userId);
            const oldCount = transactions.length;
            console.log(`   Current transaction count: ${oldCount}`);

            // Create new transaction
            const transaction = {
                id: `txn_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: userId,
                ...transactionData,
                timestamp: new Date().toISOString(),
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString()
            };

            console.log(`   Created transaction:`, transaction);

            // Add to beginning of array
            transactions.unshift(transaction);

            // Save to storage
            console.log(`   Saving ${transactions.length} transactions to localStorage...`);
            storage.setTransactions(userId, transactions);

            // IMMEDIATE VERIFICATION
            const savedTransactions = storage.getTransactions(userId);
            const newCount = savedTransactions.length;
            console.log(`   Verification: ${newCount} transactions in storage`);

            if (newCount !== oldCount + 1) {
                console.error(`❌ [BankService] TRANSACTION NOT SAVED!`);
                console.error(`   Expected: ${oldCount + 1}, Got: ${newCount}`);
                console.error(`   localStorage key: transactions_${userId}`);
                console.error(`   localStorage data:`, localStorage.getItem(`transactions_${userId}`));
            } else {
                console.log(`   ✅ Transaction saved successfully`);
            }

            return transaction;
        } catch (error) {
            console.error(`❌ [BankService] Error adding transaction:`, error);
            throw error;
        }
    },

    getTransactions: (userId, limit = null) => {
        console.log(`\n📊 [BankService] getTransactions for user ${userId}`);

        try {
            const transactions = storage.getTransactions(userId);
            console.log(`   Found ${transactions.length} transactions`);

            if (transactions.length > 0) {
                console.log(`   Latest transaction:`, transactions[0]);
            } else {
                console.log(`   ⚠️ No transactions found for this user`);
                console.log(`   Checking localStorage directly...`);
                const raw = localStorage.getItem(`transactions_${userId}`);
                console.log(`   localStorage data:`, raw);
            }

            const result = limit ? transactions.slice(0, limit) : transactions;
            console.log(`   Returning ${result.length} transactions\n`);

            return result;
        } catch (error) {
            console.error(`❌ [BankService] Error getting transactions:`, error);
            return [];
        }
    },

    getAllTransactions: () => {
        console.log(`\n📊 [BankService] getAllTransactions`);

        const users = storage.getUsers();
        const allTransactions = [];

        users.forEach(user => {
            if (user.role !== 'admin') {
                const transactions = storage.getTransactions(user.id);
                console.log(`   User ${user.firstName} ${user.lastName} (${user.id}): ${transactions.length} transactions`);
                allTransactions.push(...transactions);
            }
        });

        console.log(`   Total: ${allTransactions.length} transactions\n`);

        return allTransactions.sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );
    },

    // Debug utility - call this from browser console
    debugTransactions: (userId) => {
        console.log(`\n🐛 [BankService] DEBUG TRANSACTIONS FOR USER ${userId}`);
        console.log(`==========================================`);

        // Get from service
        const transactions = storage.getTransactions(userId);
        console.log(`\n1. From storage.getTransactions(): ${transactions.length} transactions`);
        if (transactions.length > 0) {
            console.log(`   Latest:`, transactions[0]);
        }

        // Get from localStorage directly
        const rawKey = `transactions_${userId}`;
        const rawData = localStorage.getItem(rawKey);
        console.log(`\n2. From localStorage directly (key: "${rawKey}"):`);
        if (rawData) {
            try {
                const parsed = JSON.parse(rawData);
                console.log(`   Parsed: ${parsed.length} transactions`);
                console.log(`   Data:`, parsed);
            } catch (e) {
                console.log(`   ❌ Error parsing:`, e);
                console.log(`   Raw:`, rawData);
            }
        } else {
            console.log(`   ❌ No data found in localStorage`);
        }

        // List all transaction keys
        console.log(`\n3. All transaction keys in localStorage:`);
        const allKeys = Object.keys(localStorage).filter(k => k.startsWith('transactions_'));
        console.log(`   ${allKeys.length} keys found:`, allKeys);

        // Get user info
        const users = storage.getUsers();
        const user = users.find(u => u.id === userId);
        console.log(`\n4. User info:`);
        if (user) {
            console.log(`   Name: ${user.firstName} ${user.lastName}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Account: ${user.accountNumber}`);
            console.log(`   Balance: $${user.balance}`);
        } else {
            console.log(`   ❌ User not found`);
        }

        console.log(`\n==========================================\n`);

        return {
            count: transactions.length,
            transactions: transactions,
            localStorage: rawData,
            allKeys: allKeys
        };
    }
};