import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { categorySchema } from '@/lib/validations'

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

        const validation = categorySchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error.errors[0].message },
                { status: 400 }
            )
        }

        const existingCategory = await prisma.category.findFirst({
            where: {
                id,
                userId: session.userId
            }
        })

        if (!existingCategory) {
            return NextResponse.json(
                { success: false, error: 'Category not found' },
                { status: 404 }
            )
        }

        const { name, color, icon } = validation.data

        const duplicateName = await prisma.category.findFirst({
            where: {
                userId: session.userId,
                name,
                NOT: { id }
            }
        })

        if (duplicateName) {
            return NextResponse.json(
                { success: false, error: 'Category with this name already exists' },
                { status: 400 }
            )
        }

        const category = await prisma.category.update({
            where: { id },
            data: {
                name,
                color,
                icon: icon || null
            }
        })

        return NextResponse.json({
            success: true,
            data: { category },
            message: 'Category updated successfully'
        })
    } catch (error) {
        console.error('Update category error:', error)
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

        const category = await prisma.category.findFirst({
            where: {
                id,
                userId: session.userId
            }
        })

        if (!category) {
            return NextResponse.json(
                { success: false, error: 'Category not found' },
                { status: 404 }
            )
        }

        await prisma.category.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'Category deleted successfully'
        })
    } catch (error) {
        console.error('Delete category error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
