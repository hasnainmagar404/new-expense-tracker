export default function IncomeExpenses({ income, expenses }) {
    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    return (
        <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                <h3 className="text-gray-500 text-sm uppercase">Income</h3>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(income)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
                <h3 className="text-gray-500 text-sm uppercase">Expenses</h3>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(expenses)}</p>
            </div>
        </div>
    );
}
