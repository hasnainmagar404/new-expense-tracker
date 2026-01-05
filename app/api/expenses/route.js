import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { expenseSchema } from '@/lib/validations'

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
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const categoryId = searchParams.get('categoryId')
        const search = searchParams.get('search')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        const where = {
            userId: session.userId
        }

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        }

        if (categoryId) {
            where.categoryId = categoryId
        }

        if (search) {
            where.note = {
                contains: search
            }
        }

        const [expenses, total] = await Promise.all([
            prisma.expense.findMany({
                where,
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            color: true,
                            icon: true
                        }
                    }
                },
                orderBy: { date: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.expense.count({ where })
        ])

        return NextResponse.json({
            success: true,
            data: {
                expenses,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        })
    } catch (error) {
        console.error('Get expenses error:', error)
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

        const validation = expenseSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error.errors[0].message },
                { status: 400 }
            )
        }

        const { amount, categoryId, date, note } = validation.data

        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                userId: session.userId
            }
        })

        if (!category) {
            return NextResponse.json(
                { success: false, error: 'Category not found' },
                { status: 404 }
            )
        }

        const expense = await prisma.expense.create({
            data: {
                amount,
                categoryId,
                date: new Date(date),
                note: note || null,
                userId: session.userId
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

        return NextResponse.json({
            success: true,
            data: { expense },
            message: 'Expense created successfully'
        })
    } catch (error) {
        console.error('Create expense error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
