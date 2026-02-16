// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { useBehavior } from '../../context/BehaviorContext';
// import { DEMO_ACCOUNT } from '../../utils/constants';
// import '../../styles/dashboard.css';

// const DemoMode = () => {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const { user, updateUser } = useAuth();
//     const { startMonitoring, saveBaseline, trackFirstFeature, firstFeatureUsed } = useBehavior();
//     const [demoBalance] = useState(DEMO_ACCOUNT.balance);
//     const [showInstructions, setShowInstructions] = useState(true);
//     const [countdown, setCountdown] = useState(30);

//     useEffect(() => {
//         if (!user) {
//             navigate('/login');
//             return;
//         }

//         if (user.completedDemo) {
//             navigate('/dashboard');
//             return;
//         }

//         // Start monitoring behavior
//         startMonitoring();

//         // Countdown timer
//         const timer = setInterval(() => {
//             setCountdown(prev => {
//                 if (prev <= 1) {
//                     clearInterval(timer);
//                     return 0;
//                 }
//                 return prev - 1;
//             });
//         }, 1000);

//         return () => clearInterval(timer);
//     }, [user, navigate, startMonitoring]);

//     const handleFeatureClick = (feature) => {
//         trackFirstFeature(feature);
//         setShowInstructions(false);
//     };

//     const handleCompleteDemoMode = () => {
//         // Save behavioral baseline
//         saveBaseline();

//         // Update user to mark demo as completed
//         updateUser({ completedDemo: true });

//         // Navigate to main dashboard
//         navigate('/dashboard');
//     };

//     if (!user) return null;

//     return (
//         <div className="demo-container">
//             <div className="demo-header">
//                 <h1>🎓 Demo Mode - Behavioral Training</h1>
//                 <p>Welcome, {user.firstName}! Let's set up your behavioral security profile.</p>
//                 <div className="demo-timer">
//                     Time remaining: <strong>{countdown}s</strong>
//                 </div>
//             </div>

//             {showInstructions && (
//                 <div className="demo-instructions">
//                     <h2>📋 Instructions</h2>
//                     <p>Please interact naturally with the demo account features below. We're learning your:</p>
//                     <ul>
//                         <li>🖱️ Mouse movement patterns</li>
//                         <li>⌨️ Typing speed and rhythm</li>
//                         <li>🎯 First feature preference</li>
//                     </ul>
//                     <p>This helps us protect your account from unauthorized access!</p>
//                     <p className="demo-note">
//                         <strong>Note:</strong> Click on any feature below to start. Try all features to get the best protection.
//                     </p>
//                 </div>
//             )}

//             <div className="demo-account-card">
//                 <h3>Demo Account Details</h3>
//                 <div className="account-info">
//                     <div className="info-item">
//                         <span>Account Number:</span>
//                         <strong>{DEMO_ACCOUNT.accountNumber}</strong>
//                     </div>
//                     <div className="info-item">
//                         <span>Balance:</span>
//                         <strong>${demoBalance.toFixed(2)}</strong>
//                     </div>
//                     <div className="info-item">
//                         <span>Status:</span>
//                         <strong className="status-demo">Demo Mode</strong>
//                     </div>
//                 </div>
//             </div>

//             <div className="demo-features">
//                 <div className="feature-card" onClick={() => handleFeatureClick('balance')}>
//                     <div className="feature-icon">💰</div>
//                     <h3>Check Balance</h3>
//                     <p>View your current balance</p>
//                     {firstFeatureUsed === 'balance' && <span className="first-badge">First Used ⭐</span>}
//                 </div>

//                 <div className="feature-card" onClick={() => handleFeatureClick('transaction')}>
//                     <div className="feature-icon">💸</div>
//                     <h3>Make Transaction</h3>
//                     <p>Send or receive money</p>
//                     {firstFeatureUsed === 'transaction' && <span className="first-badge">First Used ⭐</span>}
//                 </div>

//                 <div className="feature-card" onClick={() => handleFeatureClick('history')}>
//                     <div className="feature-icon">📜</div>
//                     <h3>Transaction History</h3>
//                     <p>View past transactions</p>
//                     {firstFeatureUsed === 'history' && <span className="first-badge">First Used ⭐</span>}
//                 </div>

//                 <div className="feature-card" onClick={() => handleFeatureClick('profile')}>
//                     <div className="feature-icon">👤</div>
//                     <h3>Profile</h3>
//                     <p>Manage your account</p>
//                     {firstFeatureUsed === 'profile' && <span className="first-badge">First Used ⭐</span>}
//                 </div>
//             </div>

//             {firstFeatureUsed && countdown === 0 && (
//                 <div className="demo-complete">
//                     <h3>✅ Training Complete!</h3>
//                     <p>We've captured your behavioral patterns. Your account is now more secure!</p>
//                     <button className="btn btn-primary btn-large" onClick={handleCompleteDemoMode}>
//                         Continue to Dashboard
//                     </button>
//                 </div>
//             )}

//             {firstFeatureUsed && countdown > 0 && (
//                 <div className="demo-progress">
//                     <p>Keep interacting with the features. The more you interact, the better we can protect you!</p>
//                     <p className="progress-hint">Move your mouse naturally and type in any input fields if available.</p>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default DemoMode;








import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBehavior } from '../../context/BehaviorContext';
import { DEMO_ACCOUNT } from '../../utils/constants';
import '../../styles/dashboard.css';

const DemoMode = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const { startMonitoring, saveBaseline, trackFirstFeature, firstFeatureUsed } = useBehavior();
    const [countdown, setCountdown] = useState(45);
    const [demoBalance, setDemoBalance] = useState(DEMO_ACCOUNT.balance);
    const [demoTransactions, setDemoTransactions] = useState([]);
    const [activeView, setActiveView] = useState(null);
    const [showInstructions, setShowInstructions] = useState(true);

    // Transaction form state
    const [transactionType, setTransactionType] = useState('transfer');
    const [formData, setFormData] = useState({
        amount: '',
        accountNumber: '',
        description: ''
    });
    const [transactionMessage, setTransactionMessage] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.completedDemo) {
            navigate('/dashboard');
            return;
        }

        // Start monitoring behavior
        startMonitoring();

        // Initialize with some demo transactions
        setDemoTransactions([
            {
                id: 'demo_1',
                type: 'credit',
                amount: 5000,
                description: 'Initial Demo Deposit',
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                balanceAfter: 10000
            },
            {
                id: 'demo_2',
                type: 'credit',
                amount: 5000,
                description: 'Demo Credit from Previous Account',
                date: new Date(Date.now() - 86400000).toLocaleDateString(),
                time: new Date(Date.now() - 86400000).toLocaleTimeString(),
                balanceAfter: 5000
            }
        ]);

        // Countdown timer
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [user, navigate, startMonitoring]);

    const handleFeatureClick = (feature) => {
        trackFirstFeature(feature);
        setActiveView(feature);
        setShowInstructions(false);
    };

    const handleCompleteDemoMode = () => {
        // Save behavioral baseline
        saveBaseline();

        // Update user to mark demo as completed
        updateUser({ completedDemo: true });

        // Navigate to main dashboard
        navigate('/dashboard');
    };

    const handleDemoDeposit = (amount) => {
        const newBalance = demoBalance + amount;
        const transaction = {
            id: `demo_${Date.now()}`,
            type: 'credit',
            amount: amount,
            description: 'Demo Deposit',
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            balanceAfter: newBalance
        };

        setDemoBalance(newBalance);
        setDemoTransactions(prev => [transaction, ...prev]);
        setTransactionMessage(`Successfully deposited $${amount.toFixed(2)} (Demo)`);
        setTimeout(() => setTransactionMessage(''), 3000);
    };

    const handleDemoTransaction = (e) => {
        e.preventDefault();

        const amount = parseFloat(formData.amount);

        if (isNaN(amount) || amount <= 0) {
            setTransactionMessage('Please enter a valid amount');
            return;
        }

        if (transactionType === 'withdraw' && amount > demoBalance) {
            setTransactionMessage('Insufficient demo balance');
            return;
        }

        let newBalance;
        let transactionData;

        if (transactionType === 'transfer') {
            if (!formData.accountNumber) {
                setTransactionMessage('Please enter recipient account number');
                return;
            }

            if (amount > demoBalance) {
                setTransactionMessage('Insufficient demo balance');
                return;
            }

            newBalance = demoBalance - amount;
            transactionData = {
                id: `demo_${Date.now()}`,
                type: 'debit',
                amount: amount,
                description: `Demo Transfer to ${formData.accountNumber}${formData.description ? ' - ' + formData.description : ''}`,
                recipient: formData.accountNumber,
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                balanceAfter: newBalance
            };
            setTransactionMessage(`Successfully transferred $${amount.toFixed(2)} (Demo)`);
        } else if (transactionType === 'withdraw') {
            newBalance = demoBalance - amount;
            transactionData = {
                id: `demo_${Date.now()}`,
                type: 'debit',
                amount: amount,
                description: formData.description || 'Demo Withdrawal',
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                balanceAfter: newBalance
            };
            setTransactionMessage(`Successfully withdrew $${amount.toFixed(2)} (Demo)`);
        }

        setDemoBalance(newBalance);
        setDemoTransactions(prev => [transactionData, ...prev]);
        setFormData({ amount: '', accountNumber: '', description: '' });
        setTimeout(() => setTransactionMessage(''), 3000);
    };

    if (!user) return null;

    // Balance View
    const renderBalanceView = () => (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card-header">
                <h3>💰 Demo Balance</h3>
            </div>
            <div className="card-body">
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        color: '#667eea',
                        marginBottom: '1rem'
                    }}>
                        ${demoBalance.toFixed(2)}
                    </div>
                    <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                        Demo Account: {DEMO_ACCOUNT.accountNumber}
                    </p>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Quick Demo Deposit
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                                className="btn btn-outline"
                                onClick={() => handleDemoDeposit(100)}
                            >
                                $100
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => handleDemoDeposit(500)}
                            >
                                $500
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => handleDemoDeposit(1000)}
                            >
                                $1000
                            </button>
                        </div>
                    </div>

                    {transactionMessage && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '0.75rem',
                            backgroundColor: transactionMessage.includes('Successfully') ? '#d1fae5' : '#fee2e2',
                            color: transactionMessage.includes('Successfully') ? '#065f46' : '#991b1b',
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                        }}>
                            {transactionMessage}
                        </div>
                    )}

                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        backgroundColor: '#fef3c7',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        textAlign: 'left'
                    }}>
                        <strong>ℹ️ Demo Mode:</strong> All transactions here are simulated and won't affect real accounts.
                    </div>
                </div>
            </div>
        </div>
    );

    // Transaction View
    const renderTransactionView = () => (
        <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div className="card-header">
                <h3>💸 Demo Transaction</h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button
                        className={`type-btn ${transactionType === 'transfer' ? 'active' : ''}`}
                        onClick={() => setTransactionType('transfer')}
                    >
                        Transfer
                    </button>
                    <button
                        className={`type-btn ${transactionType === 'withdraw' ? 'active' : ''}`}
                        onClick={() => setTransactionType('withdraw')}
                    >
                        Withdraw
                    </button>
                </div>
            </div>
            <div className="card-body">
                <div style={{
                    padding: '1rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ color: '#6b7280' }}>Available Demo Balance:</span>
                    <strong style={{ fontSize: '1.25rem', color: '#111827' }}>
                        ${demoBalance.toFixed(2)}
                    </strong>
                </div>

                {transactionMessage && (
                    <div style={{
                        marginBottom: '1rem',
                        padding: '0.75rem',
                        backgroundColor: transactionMessage.includes('Successfully') ? '#d1fae5' : '#fee2e2',
                        color: transactionMessage.includes('Successfully') ? '#065f46' : '#991b1b',
                        borderRadius: '6px',
                        fontSize: '0.9rem'
                    }}>
                        {transactionMessage}
                    </div>
                )}

                <form onSubmit={handleDemoTransaction}>
                    {transactionType === 'transfer' && (
                        <div className="form-group">
                            <label>Recipient Account Number *</label>
                            <input
                                type="text"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                placeholder="Enter demo account number (e.g., ACC123456)"
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Amount *</label>
                        <div className="input-with-icon">
                            <span className="input-icon">$</span>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                                step="0.01"
                                min="0.01"
                                max={demoBalance}
                                required
                            />
                        </div>
                        <small className="form-help">Maximum: ${demoBalance.toFixed(2)}</small>
                    </div>

                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter description"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">
                        {transactionType === 'transfer' ? 'Demo Transfer' : 'Demo Withdraw'}
                    </button>
                </form>

                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    backgroundColor: '#fef3c7',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                }}>
                    <strong>ℹ️ Demo Mode:</strong> These are simulated transactions for training purposes only.
                </div>
            </div>
        </div>
    );

    // History View
    const renderHistoryView = () => (
        <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="card-header">
                <h3>📜 Demo Transaction History</h3>
            </div>
            <div className="card-body">
                {demoTransactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                        <p>No demo transactions yet. Try the Balance or Transaction features!</p>
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

                        {demoTransactions.map((transaction) => (
                            <div key={transaction.id} className="table-row">
                                <div className="col-date">
                                    <div>{transaction.date}</div>
                                    <small>{transaction.time}</small>
                                </div>

                                <div className="col-description">
                                    <div className="transaction-desc">{transaction.description}</div>
                                    {transaction.recipient && (
                                        <small className="transaction-meta">To: {transaction.recipient}</small>
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

                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    backgroundColor: '#fef3c7',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                }}>
                    <strong>ℹ️ Demo Mode:</strong> This history shows simulated demo transactions only.
                </div>
            </div>
        </div>
    );

    // Profile View
    const renderProfileView = () => (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card-header">
                <h3>👤 Demo Profile</h3>
            </div>
            <div className="card-body">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '2rem',
                        fontWeight: '700',
                        margin: '0 auto 1.5rem'
                    }}>
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="detail-item">
                        <label>Full Name</label>
                        <p>{user.firstName} {user.lastName}</p>
                    </div>
                    <div className="detail-item">
                        <label>Email</label>
                        <p>{user.email}</p>
                    </div>
                    <div className="detail-item">
                        <label>Demo Account Number</label>
                        <p>{DEMO_ACCOUNT.accountNumber}</p>
                    </div>
                    <div className="detail-item">
                        <label>Demo Balance</label>
                        <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#667eea' }}>
                            ${demoBalance.toFixed(2)}
                        </p>
                    </div>
                    <div className="detail-item">
                        <label>Training Status</label>
                        <p style={{ color: '#f59e0b', fontWeight: '600' }}>
                            🎓 In Progress - {countdown}s remaining
                        </p>
                    </div>
                </div>

                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    backgroundColor: '#fef3c7',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                }}>
                    <strong>ℹ️ Demo Mode:</strong> We're learning your behavioral patterns to secure your real account.
                </div>
            </div>
        </div>
    );

    return (
        <div className="demo-container">
            <div className="demo-header">
                <h1>🎓 Demo Mode - Behavioral Training</h1>
                <p>Welcome, {user.firstName}! Interact with all features naturally.</p>
                <div className="demo-timer">
                    Time remaining: <strong>{countdown}s</strong>
                </div>
            </div>

            {showInstructions && (
                <div className="demo-instructions">
                    <h2>📋 Instructions</h2>
                    <p>Click on any feature below and interact naturally. We're learning your:</p>
                    <ul>
                        <li>🖱️ Mouse movement patterns</li>
                        <li>⌨️ Typing speed and rhythm</li>
                        <li>🎯 First feature preference</li>
                        <li>💬 Navigation behavior</li>
                    </ul>
                    <p><strong>All transactions are simulated and won't affect real money!</strong></p>
                </div>
            )}

            {!activeView && (
                <div className="demo-features">
                    <div className="feature-card" onClick={() => handleFeatureClick('balance')}>
                        <div className="feature-icon">💰</div>
                        <h3>Check Balance</h3>
                        <p>View and manage demo balance</p>
                        {firstFeatureUsed === 'balance' && <span className="first-badge">First Used ⭐</span>}
                    </div>

                    <div className="feature-card" onClick={() => handleFeatureClick('transaction')}>
                        <div className="feature-icon">💸</div>
                        <h3>Make Transaction</h3>
                        <p>Try demo transfers & withdrawals</p>
                        {firstFeatureUsed === 'transaction' && <span className="first-badge">First Used ⭐</span>}
                    </div>

                    <div className="feature-card" onClick={() => handleFeatureClick('history')}>
                        <div className="feature-icon">📜</div>
                        <h3>Transaction History</h3>
                        <p>View demo transaction records</p>
                        {firstFeatureUsed === 'history' && <span className="first-badge">First Used ⭐</span>}
                    </div>

                    <div className="feature-card" onClick={() => handleFeatureClick('profile')}>
                        <div className="feature-icon">👤</div>
                        <h3>Profile</h3>
                        <p>View demo account details</p>
                        {firstFeatureUsed === 'profile' && <span className="first-badge">First Used ⭐</span>}
                    </div>
                </div>
            )}

            {activeView && (
                <div style={{ marginBottom: '2rem' }}>
                    <button
                        className="btn btn-outline"
                        onClick={() => setActiveView(null)}
                        style={{ marginBottom: '1rem' }}
                    >
                        ← Back to All Features
                    </button>

                    {activeView === 'balance' && renderBalanceView()}
                    {activeView === 'transaction' && renderTransactionView()}
                    {activeView === 'history' && renderHistoryView()}
                    {activeView === 'profile' && renderProfileView()}
                </div>
            )}

            {firstFeatureUsed && countdown === 0 && (
                <div className="demo-complete">
                    <h3>✅ Training Complete!</h3>
                    <p>We've captured your behavioral patterns. Your account is now more secure!</p>
                    <button className="btn btn-primary btn-large" onClick={handleCompleteDemoMode}>
                        Continue to Your Real Account
                    </button>
                </div>
            )}

            {firstFeatureUsed && countdown > 0 && !activeView && (
                <div className="demo-progress">
                    <p>Great! Keep exploring features. The more you interact, the better we can protect you!</p>
                    <p className="progress-hint">Try all four features for the best security profile.</p>
                </div>
            )}
        </div>
    );
};

export default DemoMode;