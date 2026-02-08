import { useState, useEffect } from 'react';
import api from '../utils/api';
import Balance from '../components/Balance';
import IncomeExpenses from '../components/IncomeExpenses';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';

export default function Home() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [filter, setFilter] = useState({ category: '', search: '' });

    const fetchTransactions = async () => {
        try {
            const params = new URLSearchParams();
            if (filter.category) params.append('category', filter.category);

            const res = await api.get(`/transactions?${params}`);
            let data = res.data.data.transactions;

            // Client-side search
            if (filter.search) {
                data = data.filter(t =>
                    t.text.toLowerCase().includes(filter.search.toLowerCase())
                );
            }

            setTransactions(data);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [filter.category]);

    const handleAddTransaction = async (data) => {
        try {
            await api.post('/transactions', data);
            fetchTransactions();
        } catch (err) {
            console.error('Failed to add transaction:', err);
        }
    };

    const handleUpdateTransaction = async (id, data) => {
        try {
            await api.put(`/transactions/${id}`, data);
            setEditingTransaction(null);
            fetchTransactions();
        } catch (err) {
            console.error('Failed to update transaction:', err);
        }
    };

    const handleDeleteTransaction = async (id) => {
        if (!window.confirm('Delete this transaction?')) return;
        try {
            await api.delete(`/transactions/${id}`);
            fetchTransactions();
        } catch (err) {
            console.error('Failed to delete transaction:', err);
        }
    };

    // Calculate totals
    const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const balance = income - expenses;

    const categories = ['Food', 'Transport', 'Salary', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Other'];

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

            <Balance balance={balance} />
            <IncomeExpenses income={income} expenses={expenses} />

            <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                    <h2 className="text-lg font-semibold mb-4">
                        {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                    </h2>
                    <TransactionForm
                        onSubmit={editingTransaction
                            ? (data) => handleUpdateTransaction(editingTransaction._id, data)
                            : handleAddTransaction
                        }
                        initialData={editingTransaction}
                        onCancel={() => setEditingTransaction(null)}
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Transactions</h2>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={filter.search}
                            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                        <select
                            value={filter.category}
                            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                            className="px-3 py-2 border rounded-lg text-sm"
                        >
                            <option value="">All</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <TransactionList
                            transactions={transactions.filter(t =>
                                !filter.search || t.text.toLowerCase().includes(filter.search.toLowerCase())
                            )}
                            onEdit={setEditingTransaction}
                            onDelete={handleDeleteTransaction}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
