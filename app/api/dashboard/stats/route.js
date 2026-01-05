import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        const startOfMonth = new Date(currentYear, currentMonth, 1)
        const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)

        const lastMonthStart = new Date(currentYear, currentMonth - 1, 1)
        const lastMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59)

        // Current month expenses
        const currentMonthExpenses = await prisma.expense.findMany({
            where: {
                userId: session.userId,
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                        icon: true
                    }
                }
            }
        })

        // Last month expenses for comparison
        const lastMonthExpenses = await prisma.expense.findMany({
            where: {
                userId: session.userId,
                date: {
                    gte: lastMonthStart,
                    lte: lastMonthEnd
                }
            }
        })

        // Current month budgets
        const budgets = await prisma.budget.findMany({
            where: {
                userId: session.userId,
                month: currentMonth + 1,
                year: currentYear
            }
        })

        // Calculate totals
        const totalMonthlySpend = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0)
        const lastMonthSpend = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0)
        const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
        const remainingBudget = totalBudget - totalMonthlySpend

        // Calculate percentage change
        let percentageChange = 0
        if (lastMonthSpend > 0) {
            percentageChange = ((totalMonthlySpend - lastMonthSpend) / lastMonthSpend) * 100
        }

        // Category breakdown for pie chart
        const categoryBreakdown = {}
        currentMonthExpenses.forEach(expense => {
            const catId = expense.category.id
            if (!categoryBreakdown[catId]) {
                categoryBreakdown[catId] = {
                    id: expense.category.id,
                    name: expense.category.name,
                    color: expense.category.color,
                    icon: expense.category.icon,
                    amount: 0
                }
            }
            categoryBreakdown[catId].amount += expense.amount
        })

        // Find most spent category
        const categoryList = Object.values(categoryBreakdown)
        const mostSpentCategory = categoryList.length > 0
            ? categoryList.reduce((max, cat) => cat.amount > max.amount ? cat : max, categoryList[0])
            : null

        // Monthly trends for bar chart (last 6 months)
        const monthlyTrends = []
        for (let i = 5; i >= 0; i--) {
            const month = new Date(currentYear, currentMonth - i, 1)
            const monthEnd = new Date(currentYear, currentMonth - i + 1, 0, 23, 59, 59)

            const monthExpenses = await prisma.expense.findMany({
                where: {
                    userId: session.userId,
                    date: {
                        gte: month,
                        lte: monthEnd
                    }
                }
            })

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

            monthlyTrends.push({
                month: monthNames[month.getMonth()],
                year: month.getFullYear(),
                amount: monthExpenses.reduce((sum, e) => sum + e.amount, 0)
            })
        }

        // Recent transactions (last 10)
        const recentTransactions = currentMonthExpenses
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10)

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalMonthlySpend,
                    remainingBudget,
                    totalBudget,
                    transactionCount: currentMonthExpenses.length,
                    percentageChange: Math.round(percentageChange * 10) / 10,
                    mostSpentCategory
                },
                categoryBreakdown: categoryList,
                monthlyTrends,
                recentTransactions
            }
        })
    } catch (error) {
        console.error('Get dashboard stats error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
