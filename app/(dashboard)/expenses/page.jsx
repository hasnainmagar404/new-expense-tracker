"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react"
import { expenseSchema } from "@/lib/validations"
import { formatCurrency, formatDate, formatDateForInput } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingExpense, setEditingExpense] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            amount: 0,
            categoryId: "",
            date: formatDateForInput(new Date()),
            note: ""
        }
    })

    const fetchExpenses = async () => {
        try {
            let url = "/api/expenses?limit=100"
            if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`
            if (selectedCategory !== "all") url += `&categoryId=${selectedCategory}`

            const res = await fetch(url)
            const data = await res.json()
            if (data.success) {
                setExpenses(data.data.expenses)
            }
        } catch (error) {
            console.error("Failed to fetch expenses:", error)
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories")
            const data = await res.json()
            if (data.success) {
                setCategories(data.data.categories)
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error)
        }
    }

    useEffect(() => {
        Promise.all([fetchExpenses(), fetchCategories()]).finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        fetchExpenses()
    }, [searchQuery, selectedCategory])

    const openAddDialog = () => {
        setEditingExpense(null)
        reset({
            amount: 0,
            categoryId: "",
            date: formatDateForInput(new Date()),
            note: ""
        })
        setIsDialogOpen(true)
    }

    const openEditDialog = (expense) => {
        setEditingExpense(expense)
        reset({
            amount: expense.amount,
            categoryId: expense.categoryId,
            date: formatDateForInput(expense.date),
            note: expense.note || ""
        })
        setIsDialogOpen(true)
    }

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        try {
            const url = editingExpense
                ? `/api/expenses/${editingExpense.id}`
                : "/api/expenses"
            const method = editingExpense ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    amount: parseFloat(data.amount)
                })
            })
            const result = await res.json()

            if (result.success) {
                toast.success(editingExpense ? "Expense updated!" : "Expense added!")
                setIsDialogOpen(false)
                fetchExpenses()
            } else {
                toast.error(result.error || "Failed to save expense")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this expense?")) return

        try {
            const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" })
            const result = await res.json()

            if (result.success) {
                toast.success("Expense deleted!")
                fetchExpenses()
            } else {
                toast.error(result.error || "Failed to delete expense")
            }
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">All Expenses</h2>
                    <p className="text-sm text-gray-500">Manage your expense records</p>
                </div>
                <Button onClick={openAddDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by note..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Expenses Table */}
            <Card>
                <CardContent className="p-0">
                    {expenses.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left p-4 font-medium text-gray-500">Date</th>
                                        <th className="text-left p-4 font-medium text-gray-500">Category</th>
                                        <th className="text-left p-4 font-medium text-gray-500">Note</th>
                                        <th className="text-right p-4 font-medium text-gray-500">Amount</th>
                                        <th className="text-right p-4 font-medium text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {expenses.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-gray-50">
                                            <td className="p-4 text-gray-900">{formatDate(expense.date)}</td>
                                            <td className="p-4">
                                                <span
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm"
                                                    style={{ backgroundColor: expense.category.color + '20', color: expense.category.color }}
                                                >
                                                    {expense.category.icon} {expense.category.name}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600">{expense.note || "-"}</td>
                                            <td className="p-4 text-right font-medium text-gray-900">
                                                {formatCurrency(expense.amount)}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(expense)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No expenses found. Add your first expense!
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
                        <DialogDescription>
                            {editingExpense ? "Update the expense details" : "Enter the details of your expense"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount ($)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                {...register("amount", { valueAsNumber: true })}
                            />
                            {errors.amount && (
                                <p className="text-sm text-red-500">{errors.amount.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="categoryId">Category</Label>
                            <Select
                                value={watch("categoryId")}
                                onValueChange={(value) => setValue("categoryId", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.categoryId && (
                                <p className="text-sm text-red-500">{errors.categoryId.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input id="date" type="date" {...register("date")} />
                            {errors.date && (
                                <p className="text-sm text-red-500">{errors.date.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="note">Note (optional)</Label>
                            <Input id="note" placeholder="e.g., Lunch with team" {...register("note")} />
                            {errors.note && (
                                <p className="text-sm text-red-500">{errors.note.message}</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingExpense ? "Update" : "Add"} Expense
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
