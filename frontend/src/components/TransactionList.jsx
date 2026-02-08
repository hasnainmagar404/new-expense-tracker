export default function TransactionList({ transactions, onEdit, onDelete }) {
    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount));

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (transactions.length === 0) {
        return (
            <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                No transactions yet. Add your first one!
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y">
                {transactions.map((t) => (
                    <div key={t._id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-1 h-12 rounded ${t.amount > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div>
                                <p className="font-medium text-gray-900">{t.text}</p>
                                <p className="text-sm text-gray-500">
                                    {t.category} • {formatDate(t.date)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`font-semibold ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {t.amount > 0 ? '+' : '-'}{formatCurrency(t.amount)}
                            </span>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => onEdit(t)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => onDelete(t._id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
