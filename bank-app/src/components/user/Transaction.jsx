import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBehavior } from '../../context/BehaviorContext';
import { bankService } from '../../services/bankService';
import AlertModal from '../common/AlertModal';

const Transaction = () => {
    const { user } = useAuth();
    const { trackFirstFeature, currentAlert, clearAlert } = useBehavior();
    const [transactionType, setTransactionType] = useState('transfer');
    const [formData, setFormData] = useState({
        amount: '',
        accountNumber: '',
        description: ''
    });
    const [balance, setBalance] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            trackFirstFeature('transaction');
            setBalance(bankService.getBalance(user.id));
        }
    }, [user, trackFirstFeature]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const amount = parseFloat(formData.amount);

        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        try {
            let newBalance;

            if (transactionType === 'transfer') {
                if (!formData.accountNumber) {
                    setError('Please enter recipient account number');
                    return;
                }
                newBalance = bankService.transfer(
                    user.id,
                    formData.accountNumber,
                    amount,
                    formData.description || 'Transfer'
                );
                setSuccess(`Successfully transferred $${amount.toFixed(2)} to ${formData.accountNumber}`);
            } else if (transactionType === 'withdraw') {
                newBalance = bankService.withdraw(
                    user.id,
                    amount,
                    formData.description || 'Withdrawal'
                );
                setSuccess(`Successfully withdrew $${amount.toFixed(2)}`);
            }

            setBalance(newBalance);
            setFormData({ amount: '', accountNumber: '', description: '' });

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>💸 Make Transaction</h1>
                <p>Transfer money or withdraw funds</p>
            </div>

            <div className="balance-info-bar">
                <span>Available Balance:</span>
                <strong>${balance.toFixed(2)}</strong>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="transaction-type-selector">
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
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit} className="transaction-form">
                        {transactionType === 'transfer' && (
                            <div className="form-group">
                                <label>Recipient Account Number *</label>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    placeholder="Enter account number"
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
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0.01"
                                    max={balance}
                                    required
                                />
                            </div>
                            <small className="form-help">Maximum: ${balance.toFixed(2)}</small>
                        </div>

                        <div className="form-group">
                            <label>Description (Optional)</label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter description"
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block">
                            {transactionType === 'transfer' ? 'Transfer Money' : 'Withdraw'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="info-card">
                <h4>ℹ️ Transaction Guidelines</h4>
                <ul>
                    <li>
                        <strong>Transfers:</strong> Ensure you enter the correct recipient account number
                    </li>
                    <li>
                        <strong>Withdrawals:</strong> Funds will be deducted from your account immediately
                    </li>
                    <li>
                        <strong>Security:</strong> All transactions are monitored for unusual behavior
                    </li>
                    <li>
                        <strong>Limits:</strong> You cannot transfer more than your available balance
                    </li>
                </ul>
            </div>

            <AlertModal alert={currentAlert} onClose={clearAlert} />
        </div>
    );
};

export default Transaction;