import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const month = parseInt(searchParams.get('month') || new Date().getMonth() + 1)
        const year = parseInt(searchParams.get('year') || new Date().getFullYear())

        const categories = await prisma.category.findMany({
            where: { userId: session.userId },
            include: {
                budgets: {
                    where: { month, year }
                },
                expenses: {
                    where: {
                        date: {
                            gte: new Date(year, month - 1, 1),
                            lte: new Date(year, month, 0, 23, 59, 59)
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        })

        const budgetData = categories.map(cat => ({
            categoryId: cat.id,
            categoryName: cat.name,
            categoryColor: cat.color,
            categoryIcon: cat.icon,
            allocated: cat.budgets[0]?.amount || 0,
            spent: cat.expenses.reduce((sum, e) => sum + e.amount, 0),
            budgetId: cat.budgets[0]?.id || null
        }))

        const totalAllocated = budgetData.reduce((sum, b) => sum + b.allocated, 0)
        const totalSpent = budgetData.reduce((sum, b) => sum + b.spent, 0)

        return NextResponse.json({
            success: true,
            data: {
                budgets: budgetData,
                month,
                year,
                summary: {
                    totalAllocated,
                    totalSpent,
                    remaining: totalAllocated - totalSpent
                }
            }
        })
    } catch (error) {
        console.error('Get budgets error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { budgets, month, year } = body

        if (!Array.isArray(budgets)) {
            return NextResponse.json(
                { success: false, error: 'Invalid budgets data' },
                { status: 400 }
            )
        }

        const results = []

        for (const budget of budgets) {
            const { categoryId, amount } = budget

            if (amount < 0) continue

            const category = await prisma.category.findFirst({
                where: {
                    id: categoryId,
                    userId: session.userId
                }
            })

            if (!category) continue

            const existingBudget = await prisma.budget.findFirst({
                where: {
                    userId: session.userId,
                    categoryId,
                    month,
                    year
                }
            })

            if (existingBudget) {
                const updated = await prisma.budget.update({
                    where: { id: existingBudget.id },
                    data: { amount }
                })
                results.push(updated)
            } else if (amount > 0) {
                const created = await prisma.budget.create({
                    data: {
                        amount,
                        categoryId,
                        month,
                        year,
                        userId: session.userId
                    }
                })
                results.push(created)
            }
        }

        return NextResponse.json({
            success: true,
            data: { budgets: results },
            message: 'Budgets saved successfully'
        })
    } catch (error) {
        console.error('Update budgets error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
