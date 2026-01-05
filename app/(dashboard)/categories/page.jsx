"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { categorySchema } from "@/lib/validations"
import { formatCurrency } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#6366f1", "#a855f7"]
const ICONS = ["🍔", "🚗", "🏠", "🎬", "🛍️", "💊", "📚", "✈️", "📱", "🎁"]

export default function CategoriesPage() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [color, setColor] = useState(COLORS[0])
    const [icon, setIcon] = useState(ICONS[0])

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(categorySchema)
    })

    const fetchData = async () => {
        const res = await fetch("/api/categories")
        const data = await res.json()
        if (data.success) setCategories(data.data.categories)
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [])

    const openAdd = () => { setEditing(null); setColor(COLORS[0]); setIcon(ICONS[0]); reset({ name: "" }); setIsOpen(true) }
    const openEdit = (c) => { setEditing(c); setColor(c.color); setIcon(c.icon); reset({ name: c.name }); setIsOpen(true) }

    const onSubmit = async (data) => {
        setSubmitting(true)
        const url = editing ? `/api/categories/${editing.id}` : "/api/categories"
        const res = await fetch(url, {
            method: editing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: data.name, color, icon })
        })
        const result = await res.json()
        if (result.success) { toast.success(editing ? "Updated!" : "Created!"); setIsOpen(false); fetchData() }
        else toast.error(result.error)
        setSubmitting(false)
    }

    const handleDelete = async (id) => {
        if (!confirm("Delete this category?")) return
        const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
        if ((await res.json()).success) { toast.success("Deleted!"); fetchData() }
    }

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <h2 className="text-lg font-semibold">Categories</h2>
                <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add</Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((c) => (
                    <Card key={c.id}>
                        <CardContent className="p-4">
                            <div className="flex justify-between">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: c.color + '20' }}>{c.icon}</div>
                                    <div>
                                        <h3 className="font-medium">{c.name}</h3>
                                        <p className="text-sm text-gray-500">{formatCurrency(c.totalSpent)} spent</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                </div>
                            </div>
                            {c.budget > 0 && <Progress value={Math.min((c.totalSpent / c.budget) * 100, 100)} className="mt-3 h-2" />}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Category</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div><Label>Name</Label><Input {...register("name")} />{errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}</div>
                        <div><Label>Color</Label><div className="flex gap-2 mt-1">{COLORS.map((c) => (<button key={c} type="button" className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-gray-900' : ''}`} style={{ backgroundColor: c }} onClick={() => setColor(c)} />))}</div></div>
                        <div><Label>Icon</Label><div className="flex gap-2 mt-1 flex-wrap">{ICONS.map((i) => (<button key={i} type="button" className={`w-10 h-10 rounded-lg text-xl border-2 ${icon === i ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`} onClick={() => setIcon(i)}>{i}</button>))}</div></div>
                        <DialogFooter><Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button type="submit" disabled={submitting}>{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editing ? "Update" : "Create"}</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
