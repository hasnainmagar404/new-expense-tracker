import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createToken, setAuthCookie } from '@/lib/auth'
import { signupSchema } from '@/lib/validations'

const DEFAULT_CATEGORIES = [
    { name: 'Food & Dining', color: '#f97316', icon: '🍔' },
    { name: 'Transportation', color: '#3b82f6', icon: '🚗' },
    { name: 'Bills & Utilities', color: '#ef4444', icon: '🏠' },
    { name: 'Entertainment', color: '#a855f7', icon: '🎬' },
    { name: 'Shopping', color: '#ec4899', icon: '🛍️' },
    { name: 'Healthcare', color: '#10b981', icon: '💊' },
    { name: 'Education', color: '#6366f1', icon: '📚' },
    { name: 'Travel', color: '#06b6d4', icon: '✈️' },
    { name: 'Subscriptions', color: '#eab308', icon: '📱' },
    { name: 'Others', color: '#6b7280', icon: '🎁' }
]

export async function POST(request) {
    try {
        const body = await request.json()

        const validation = signupSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error.errors[0].message },
                { status: 400 }
            )
        }

        const { name, email, password } = validation.data

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'Email already registered' },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        // Create default categories for new user
        for (const cat of DEFAULT_CATEGORIES) {
            await prisma.category.create({
                data: {
                    name: cat.name,
                    color: cat.color,
                    icon: cat.icon,
                    userId: user.id
                }
            })
        }

        const token = await createToken({
            userId: user.id,
            email: user.email,
            name: user.name
        })

        await setAuthCookie(token)

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            },
            message: 'Account created successfully'
        })
    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
