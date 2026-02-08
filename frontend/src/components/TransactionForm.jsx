import { useState, useEffect } from 'react';

const categories = ['Food', 'Transport', 'Salary', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Other'];

export default function TransactionForm({ onSubmit, initialData, onCancel }) {
    const [text, setText] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [isIncome, setIsIncome] = useState(false);

    useEffect(() => {
        if (initialData) {
            setText(initialData.text);
            setAmount(Math.abs(initialData.amount).toString());
            setCategory(initialData.category);
            setIsIncome(initialData.amount > 0);
        } else {
            setText('');
            setAmount('');
            setCategory('Food');
            setIsIncome(false);
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text || !amount) return;

        const finalAmount = isIncome ? Math.abs(parseFloat(amount)) : -Math.abs(parseFloat(amount));

        onSubmit({
            text,
            amount: finalAmount,
            category: isIncome ? 'Salary' : category
        });

        if (!initialData) {
            setText('');
            setAmount('');
            setCategory('Food');
            setIsIncome(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow space-y-4">
            {/* Income/Expense Toggle */}
            <div className="flex rounded-lg overflow-hidden border">
                <button
                    type="button"
                    onClick={() => setIsIncome(false)}
                    className={`flex-1 py-2 text-sm font-medium ${!isIncome ? 'bg-red-500 text-white' : 'bg-gray-50 text-gray-600'
                        }`}
                >
                    Expense
                </button>
                <button
                    type="button"
                    onClick={() => setIsIncome(true)}
                    className={`flex-1 py-2 text-sm font-medium ${isIncome ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-600'
                        }`}
                >
                    Income
                </button>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g., Lunch, Salary..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                />
            </div>

            {!isIncome && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {categories.filter(c => c !== 'Salary').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="flex gap-2">
                <button
                    type="submit"
                    className={`flex-1 py-2 rounded-lg text-white font-medium ${isIncome ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {initialData ? 'Update' : 'Add'} {isIncome ? 'Income' : 'Expense'}
                </button>
                {initialData && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
