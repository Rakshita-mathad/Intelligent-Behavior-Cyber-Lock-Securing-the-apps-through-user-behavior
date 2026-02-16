import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBehavior } from '../../context/BehaviorContext';
import { bankService } from '../../services/bankService';
import AlertModal from '../common/AlertModal';

const TransactionHistory = () => {
    const { user } = useAuth();
    const { trackFirstFeature, currentAlert, clearAlert } = useBehavior();
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to load transactions
    const loadTransactions = () => {
        if (!user) return;

        console.log('[TransactionHistory] Loading transactions for user:', user.id);
        setLoading(true);
        setError(null);

        try {
            // Get transactions from bankService
            const userTransactions = bankService.getTransactions(user.id);
            console.log('[TransactionHistory] Loaded transactions:', userTransactions);

            // Validate and format transactions
            const validatedTransactions = userTransactions.map(t => ({
                id: t.id || `${Date.now()}_${Math.random()}`,
                userId: t.userId,
                type: t.type || 'debit',
                amount: parseFloat(t.amount) || 0,
                description: t.description || 'Transaction',
                balanceAfter: parseFloat(t.balanceAfter) || 0,
                timestamp: t.timestamp || new Date().toISOString(),
                date: t.date || new Date(t.timestamp).toLocaleDateString(),
                time: t.time || new Date(t.timestamp).toLocaleTimeString(),
                recipient: t.recipient || null,
                sender: t.sender || null
            }));

            console.log('[TransactionHistory] Validated transactions:', validatedTransactions);
            setTransactions(validatedTransactions);
            setLoading(false);
        } catch (err) {
            console.error('[TransactionHistory] Error loading transactions:', err);
            setError('Failed to load transactions. Please try refreshing.');
            setTransactions([]);
            setLoading(false);
        }
    };

    // Load transactions on mount and when user changes
    useEffect(() => {
        if (user) {
            trackFirstFeature('history');
            loadTransactions();
        }
    }, [user?.id]); // Re-run when user ID changes

    // Refresh transactions every 2 seconds to catch new ones
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            const userTransactions = bankService.getTransactions(user.id);
            if (userTransactions.length !== transactions.length) {
                console.log('[TransactionHistory] New transactions detected, refreshing...');
                loadTransactions();
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [user?.id, transactions.length]);

    const getFilteredTransactions = () => {
        let filtered = transactions;

        // Filter by type
        if (filter !== 'all') {
            filtered = filtered.filter(t => t.type === filter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.amount.toString().includes(searchTerm) ||
                (t.recipient && t.recipient.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (t.sender && t.sender.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        return filtered;
    };

    const filteredTransactions = getFilteredTransactions();

    if (!user) {
        return (
            <div className="page-container">
                <div className="loading">Please log in to view transactions</div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>📜 Transaction History</h1>
                <p>View all your past transactions</p>
                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    Account: {user.accountNumber} | User ID: {user.id}
                </div>
            </div>

            {/* Debug Info - Remove in production */}
            <div style={{
                background: '#f3f4f6',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.85rem'
            }}>
                <strong>Debug Info:</strong> Found {transactions.length} transactions
                <button
                    onClick={loadTransactions}
                    style={{
                        marginLeft: '1rem',
                        padding: '0.25rem 0.75rem',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    🔄 Refresh
                </button>
                <button
                    onClick={() => {
                        console.log('Current transactions:', transactions);
                        console.log('Raw localStorage:', localStorage.getItem(`transactions_${user.id}`));
                        bankService.debugTransactions && bankService.debugTransactions(user.id);
                    }}
                    style={{
                        marginLeft: '0.5rem',
                        padding: '0.25rem 0.75rem',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    🐛 Debug Log
                </button>
            </div>

            {error && (
                <div style={{
                    background: '#fee2e2',
                    color: '#991b1b',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                }}>
                    ⚠️ {error}
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <div className="history-controls">
                        <div className="filter-buttons">
                            <button
                                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                All ({transactions.length})
                            </button>
                            <button
                                className={`filter-btn ${filter === 'credit' ? 'active' : ''}`}
                                onClick={() => setFilter('credit')}
                            >
                                Credits ({transactions.filter(t => t.type === 'credit').length})
                            </button>
                            <button
                                className={`filter-btn ${filter === 'debit' ? 'active' : ''}`}
                                onClick={() => setFilter('debit')}
                            >
                                Debits ({transactions.filter(t => t.type === 'debit').length})
                            </button>
                        </div>

                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="card-body">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                            <p>Loading transactions...</p>
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="no-data" style={{ textAlign: 'center', padding: '3rem' }}>
                            {transactions.length === 0 ? (
                                <>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>No transactions yet</h3>
                                    <p style={{ margin: 0, color: '#6b7280' }}>
                                        Your transaction history will appear here once you make deposits, withdrawals, or transfers.
                                    </p>
                                    <div style={{
                                        marginTop: '1.5rem',
                                        padding: '1rem',
                                        background: '#f3f4f6',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem'
                                    }}>
                                        <strong>💡 Tip:</strong> Go to the Balance page to deposit funds, or Transaction page to make transfers.
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>No matching transactions</h3>
                                    <p style={{ margin: 0, color: '#6b7280' }}>
                                        Try adjusting your filters or search term
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="history-table">
                            <div className="table-header">
                                <div className="col-date">Date & Time</div>
                                <div className="col-description">Description</div>
                                <div className="col-type">Type</div>
                                <div className="col-amount">Amount</div>
                                <div className="col-balance">Balance After</div>
                            </div>

                            {filteredTransactions.map((transaction, index) => (
                                <div key={transaction.id || index} className="table-row">
                                    <div className="col-date">
                                        <div>{transaction.date}</div>
                                        <small>{transaction.time}</small>
                                    </div>

                                    <div className="col-description">
                                        <div className="transaction-desc">{transaction.description}</div>
                                        {transaction.recipient && (
                                            <small className="transaction-meta">To: {transaction.recipient}</small>
                                        )}
                                        {transaction.sender && (
                                            <small className="transaction-meta">From: {transaction.sender}</small>
                                        )}
                                    </div>

                                    <div className="col-type">
                                        <span className={`type-badge ${transaction.type}`}>
                                            {transaction.type === 'credit' ? '📥 Credit' : '📤 Debit'}
                                        </span>
                                    </div>

                                    <div className={`col-amount amount-${transaction.type}`}>
                                        {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                    </div>

                                    <div className="col-balance">
                                        ${transaction.balanceAfter.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {transactions.length > 0 && (
                <div className="history-summary">
                    <div className="summary-card">
                        <h4>Summary</h4>
                        <div className="summary-stats">
                            <div className="summary-item">
                                <span>Total Transactions</span>
                                <strong>{transactions.length}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Total Credits</span>
                                <strong className="credit">
                                    {transactions.filter(t => t.type === 'credit').length}
                                    {' '}(${transactions
                                        .filter(t => t.type === 'credit')
                                        .reduce((sum, t) => sum + t.amount, 0)
                                        .toFixed(2)})
                                </strong>
                            </div>
                            <div className="summary-item">
                                <span>Total Debits</span>
                                <strong className="debit">
                                    {transactions.filter(t => t.type === 'debit').length}
                                    {' '}(${transactions
                                        .filter(t => t.type === 'debit')
                                        .reduce((sum, t) => sum + t.amount, 0)
                                        .toFixed(2)})
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AlertModal alert={currentAlert} onClose={clearAlert} />
        </div>
    );
};

export default TransactionHistory;