import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBehavior } from '../../context/BehaviorContext';
import { bankService } from '../../services/bankService';
import AlertModal from '../common/AlertModal';

const Balance = () => {
    const { user } = useAuth();
    const { trackFirstFeature, currentAlert, clearAlert } = useBehavior();
    const [balance, setBalance] = useState(0);
    const [depositAmount, setDepositAmount] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            trackFirstFeature('balance');
            setBalance(bankService.getBalance(user.id));
        }
    }, [user, trackFirstFeature]);

    const handleDeposit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const amount = parseFloat(depositAmount);

        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        try {
            const newBalance = bankService.deposit(user.id, amount, 'Cash Deposit');
            setBalance(newBalance);
            setSuccess(`Successfully deposited $${amount.toFixed(2)}`);
            setDepositAmount('');

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>💰 Account Balance</h1>
                <p>View and manage your account balance</p>
            </div>

            <div className="balance-display-card">
                <div className="balance-icon">💵</div>
                <div className="balance-info">
                    <p className="balance-label">Current Balance</p>
                    <h2 className="balance-amount">${balance.toFixed(2)}</h2>
                    <p className="account-number">Account: {user.accountNumber}</p>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3>Quick Deposit</h3>
                </div>
                <div className="card-body">
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleDeposit} className="deposit-form">
                        <div className="form-group">
                            <label>Deposit Amount</label>
                            <div className="input-with-icon">
                                <span className="input-icon">$</span>
                                <input
                                    type="number"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0.01"
                                />
                            </div>
                        </div>

                        <div className="quick-amounts">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => setDepositAmount('100')}
                            >
                                $100
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => setDepositAmount('500')}
                            >
                                $500
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => setDepositAmount('1000')}
                            >
                                $1000
                            </button>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block">
                            Deposit Funds
                        </button>
                    </form>
                </div>
            </div>

            <div className="info-card">
                <h4>ℹ️ Information</h4>
                <ul>
                    <li>Your balance is updated in real-time</li>
                    <li>All deposits are instantly reflected in your account</li>
                    <li>Use the transaction page for transfers and withdrawals</li>
                </ul>
            </div>

            <AlertModal alert={currentAlert} onClose={clearAlert} />
        </div>
    );
};

export default Balance;