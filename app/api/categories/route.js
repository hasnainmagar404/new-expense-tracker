import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { categorySchema } from '@/lib/validations'

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
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

        const categories = await prisma.category.findMany({
            where: { userId: session.userId },
            include: {
                expenses: {
                    where: {
                        date: {
                            gte: startOfMonth,
                            lte: endOfMonth
                        }
                    },
                    select: {
                        amount: true
                    }
                },
                budgets: {
                    where: {
                        month: now.getMonth() + 1,
                        year: now.getFullYear()
                    },
                    select: {
                        amount: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        })

        const categoriesWithStats = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            color: cat.color,
            icon: cat.icon,
            totalSpent: cat.expenses.reduce((sum, e) => sum + e.amount, 0),
            budget: cat.budgets[0]?.amount || 0
        }))

        return NextResponse.json({
            success: true,
            data: { categories: categoriesWithStats }
        })
    } catch (error) {
        console.error('Get categories error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()

        const validation = categorySchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error.errors[0].message },
                { status: 400 }
            )
        }

        const { name, color, icon } = validation.data

        const existingCategory = await prisma.category.findFirst({
            where: {
                userId: session.userId,
                name
            }
        })

        if (existingCategory) {
            return NextResponse.json(
                { success: false, error: 'Category with this name already exists' },
                { status: 400 }
            )
        }

        const category = await prisma.category.create({
            data: {
                name,
                color,
                icon: icon || null,
                userId: session.userId
            }
        })

        return NextResponse.json({
            success: true,
            data: { category },
            message: 'Category created successfully'
        })
    } catch (error) {
        console.error('Create category error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
