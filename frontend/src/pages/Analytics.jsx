import { useState, useEffect } from 'react';
import api from '../utils/api';
import CategoryChart from '../components/CategoryChart';
import TrendChart from '../components/TrendChart';

export default function Analytics() {
    const [summary, setSummary] = useState(null);
    const [categories, setCategories] = useState([]);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, categoryRes, trendsRes] = await Promise.all([
                    api.get('/analytics/summary'),
                    api.get('/analytics/by-category'),
                    api.get('/analytics/trends')
                ]);

                setSummary(summaryRes.data.data);
                setCategories(categoryRes.data.data.categories);
                setTrends(trendsRes.data.data.trends);
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500">Total Income</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(summary?.income || 0)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(summary?.expenses || 0)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500">Balance</p>
                    <p className={`text-2xl font-bold ${summary?.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(summary?.balance || 0)}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500">Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">{summary?.transactionCount || 0}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
                    <CategoryChart data={categories} />
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Monthly Trends</h2>
                    <TrendChart data={trends} />
                </div>
            </div>

            {/* Top Categories */}
            <div className="bg-white p-4 rounded-lg shadow mt-6">
                <h2 className="text-lg font-semibold mb-4">Top Spending Categories</h2>
                <div className="space-y-3">
                    {categories.slice(0, 5).map((cat, idx) => (
                        <div key={cat.category} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-sm font-medium">
                                    {idx + 1}
                                </span>
                                <span className="font-medium">{cat.category}</span>
                            </div>
                            <div className="text-right">
                                <span className="font-semibold">{formatCurrency(cat.amount)}</span>
                                <span className="text-gray-500 text-sm ml-2">({cat.percentage}%)</span>
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No expense data yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}
