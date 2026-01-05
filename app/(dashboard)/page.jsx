"use client"

import { useState, useEffect } from "react"
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Receipt,
    PiggyBank,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react"
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/format"

export default function DashboardPage() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/dashboard/stats")
                const data = await res.json()
                if (data.success) {
                    setStats(data.data)
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Failed to load dashboard data</p>
            </div>
        )
    }

    const { summary, categoryBreakdown, monthlyTrends, recentTransactions } = stats

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Total Spent
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(summary.totalMonthlySpend)}
                        </div>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                            {summary.percentageChange >= 0 ? (
                                <>
                                    <ArrowUpRight className="h-3 w-3 text-red-500 mr-1" />
                                    <span className="text-red-500">+{summary.percentageChange}%</span>
                                </>
                            ) : (
                                <>
                                    <ArrowDownRight className="h-3 w-3 text-green-500 mr-1" />
                                    <span className="text-green-500">{summary.percentageChange}%</span>
                                </>
                            )}
                            <span className="ml-1">from last month</span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Remaining Budget
                        </CardTitle>
                        <PiggyBank className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${summary.remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(summary.remainingBudget)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            of {formatCurrency(summary.totalBudget)} budget
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Transactions
                        </CardTitle>
                        <Receipt className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.transactionCount}</div>
                        <p className="text-xs text-gray-500 mt-1">this month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Top Category
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary.mostSpentCategory?.icon} {summary.mostSpentCategory?.name || "N/A"}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {summary.mostSpentCategory ? formatCurrency(summary.mostSpentCategory.amount) : "No expenses yet"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Spending by Category</CardTitle>
                        <CardDescription>This month&apos;s expense breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {categoryBreakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="amount"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    >
                                        {categoryBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                No expense data yet
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Trends</CardTitle>
                        <CardDescription>Last 6 months spending</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyTrends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    labelStyle={{ color: '#374151' }}
                                />
                                <Bar
                                    dataKey="amount"
                                    fill="#6366f1"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your latest expenses</CardDescription>
                </CardHeader>
                <CardContent>
                    {recentTransactions.length > 0 ? (
                        <div className="space-y-4">
                            {recentTransactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                                            style={{ backgroundColor: transaction.category.color + '20' }}
                                        >
                                            {transaction.category.icon}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {transaction.category.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {transaction.note || "No note"} • {formatDate(transaction.date)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-gray-900">
                                        -{formatCurrency(transaction.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No transactions yet. Add your first expense!
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
