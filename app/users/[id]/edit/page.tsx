"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { getUser, updateUser } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"

const ROLES = ["MD", "DMD", "NURSE", "ADMIN"]

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = Number(params.id)
  const { user, isLoading: authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "",
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser(userId)
        setFormData({
          username: userData.username || "",
          password: "", // Don't pre-populate password for security
          role: userData.role || "",
        })
      } catch (err) {
        setError("Failed to load user information")
        console.error("Failed to fetch user:", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchUser()
    }
  }, [userId])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updateData: { username: string; role: string; password?: string } = {
        username: formData.username,
        role: formData.role,
      }

      // Only include password if it's been changed (not empty)
      if (formData.password) {
        updateData.password = formData.password
      }

      await updateUser(userId, updateData)
      router.push("/users")
    } catch (err) {
      console.error("Failed to update user:", err)
      alert(`Failed to update user: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const hasAccess = user.role === "ADMIN"

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You do not have permission to edit users.</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => router.push("/users")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit User</CardTitle>
            <CardDescription>Update the user&apos;s information below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  required
                />
              </div>

                <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Leave empty to keep current password"
                  minLength={6}
                  title="Password must be at least 6 characters"
                />
                <p className="text-xs text-muted-foreground">Leave empty to keep the current password</p>
                {formData.password && formData.password.length > 0 && formData.password.length < 6 && (
                  <p className="text-xs text-destructive">Password must be at least 6 characters long.</p>
                )}
                </div>

              <div className="space-y-2">
                <Label htmlFor="role">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleChange("role", value)} required>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => router.push("/users")} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}