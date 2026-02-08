export default function Balance({ balance }) {
    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    return (
        <div className="bg-white p-6 rounded-lg shadow text-center">
            <h2 className="text-lg text-gray-500 uppercase tracking-wide">Your Balance</h2>
            <p className={`text-4xl font-bold mt-2 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
            </p>
        </div>
    );
}
