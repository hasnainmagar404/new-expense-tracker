"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { User, Mail, Calendar, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfilePage() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch("/api/auth/me")
            const data = await res.json()
            if (data.success) setUser(data.data.user)
            setLoading(false)
        }
        fetchUser()
    }, [])

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" })
        window.location.href = "/login"
    }

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-indigo-600">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{user?.name}</h3>
                            <p className="text-gray-500">{user?.email}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <User className="h-5 w-5 text-gray-400" />
                            <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{user?.name}</p></div>
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{user?.email}</p></div>
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div><p className="text-sm text-gray-500">Member Since</p><p className="font-medium">{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</p></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-red-200">
                <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" onClick={handleLogout}>Logout from Account</Button>
                </CardContent>
            </Card>
        </div>
    )
}
