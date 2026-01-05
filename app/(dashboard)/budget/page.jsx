"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { formatCurrency, getMonthName } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function BudgetPage() {
    const [budgetData, setBudgetData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [budgets, setBudgets] = useState({})
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(new Date().getFullYear())

    const fetchBudget = async () => {
        setLoading(true)
        const res = await fetch(`/api/budget?month=${month}&year=${year}`)
        const data = await res.json()
        if (data.success) {
            setBudgetData(data.data)
            const initial = {}
            data.data.budgets.forEach(b => { initial[b.categoryId] = b.allocated })
            setBudgets(initial)
        }
        setLoading(false)
    }

    useEffect(() => { fetchBudget() }, [month, year])

    const handleSave = async () => {
        setSaving(true)
        const budgetArray = Object.entries(budgets).map(([categoryId, amount]) => ({
            categoryId, amount: parseFloat(amount) || 0
        }))
        const res = await fetch("/api/budget", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ budgets: budgetArray, month, year })
        })
        if ((await res.json()).success) {
            toast.success("Budgets saved!")
            fetchBudget()
        } else {
            toast.error("Failed to save")
        }
        setSaving(false)
    }

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold">Budget Settings</h2>
                    <p className="text-sm text-gray-500">Set monthly budgets for each category</p>
                </div>
                <div className="flex gap-2">
                    <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                <SelectItem key={m} value={String(m)}>{getMonthName(m - 1)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
                        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {[2024, 2025, 2026, 2027].map(y => (
                                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Total Budget</p><p className="text-2xl font-bold">{formatCurrency(budgetData?.summary?.totalAllocated || 0)}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Total Spent</p><p className="text-2xl font-bold">{formatCurrency(budgetData?.summary?.totalSpent || 0)}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Remaining</p><p className={`text-2xl font-bold ${(budgetData?.summary?.remaining || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(budgetData?.summary?.remaining || 0)}</p></CardContent></Card>
            </div>

            {/* Budget List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Category Budgets</CardTitle>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save All
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {budgetData?.budgets.map((b) => {
                            const percent = b.allocated > 0 ? Math.min((b.spent / b.allocated) * 100, 100) : 0
                            const over = b.spent > b.allocated && b.allocated > 0
                            return (
                                <div key={b.categoryId} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{b.categoryIcon}</span>
                                            <span className="font-medium">{b.categoryName}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-gray-500">Spent: {formatCurrency(b.spent)}</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm">$</span>
                                                <Input type="number" className="w-24" value={budgets[b.categoryId] || ''} onChange={(e) => setBudgets({ ...budgets, [b.categoryId]: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                    <Progress value={percent} className={`h-2 ${over ? '[&>div]:bg-red-500' : ''}`} />
                                    {over && <p className="text-xs text-red-500 mt-1">Over budget by {formatCurrency(b.spent - b.allocated)}</p>}
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
