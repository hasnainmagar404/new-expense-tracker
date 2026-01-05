import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
})

export const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
})

export const expenseSchema = z.object({
    amount: z.number().positive('Amount must be positive').max(1000000, 'Amount too large'),
    categoryId: z.string().min(1, 'Category is required'),
    date: z.string().min(1, 'Date is required'),
    note: z.string().max(200, 'Note too long').optional()
})

export const categorySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(30, 'Name too long'),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
    icon: z.string().optional()
})

export const budgetSchema = z.object({
    amount: z.number().min(0, 'Budget cannot be negative').max(1000000, 'Budget too large'),
    categoryId: z.string().min(1, 'Category is required'),
    month: z.number().min(1).max(12),
    year: z.number().min(2020).max(2100)
})
