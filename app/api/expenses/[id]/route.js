import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { expenseSchema } from '@/lib/validations'

export async function GET(request, { params }) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id } = await params

        const expense = await prisma.expense.findFirst({
            where: {
                id,
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

        if (!expense) {
            return NextResponse.json(
                { success: false, error: 'Expense not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: { expense }
        })
    } catch (error) {
        console.error('Get expense error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(request, { params }) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id } = await params
        const body = await request.json()

        const validation = expenseSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error.errors[0].message },
                { status: 400 }
            )
        }

        const existingExpense = await prisma.expense.findFirst({
            where: {
                id,
                userId: session.userId
            }
        })

        if (!existingExpense) {
            return NextResponse.json(
                { success: false, error: 'Expense not found' },
                { status: 404 }
            )
        }

        const { amount, categoryId, date, note } = validation.data

        const expense = await prisma.expense.update({
            where: { id },
            data: {
                amount,
                categoryId,
                date: new Date(date),
                note: note || null
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
            message: 'Expense updated successfully'
        })
    } catch (error) {
        console.error('Update expense error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id } = await params

        const expense = await prisma.expense.findFirst({
            where: {
                id,
                userId: session.userId
            }
        })

        if (!expense) {
            return NextResponse.json(
                { success: false, error: 'Expense not found' },
                { status: 404 }
            )
        }

        await prisma.expense.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'Expense deleted successfully'
        })
    } catch (error) {
        console.error('Delete expense error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
