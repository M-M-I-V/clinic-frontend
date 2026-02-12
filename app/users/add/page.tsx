"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { createUser } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"

const ROLES = ["MD", "DMD", "NURSE", "ADMIN"]

export default function AddUserPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createUser({
        username: formData.username,
        password: formData.password,
        role: formData.role,
      })
      router.push("/users")
    } catch (error) {
      console.error("Failed to create user:", error)
      alert(`Failed to create user: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    router.push("/")
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
              <CardDescription>You do not have permission to add users.</CardDescription>
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
            <CardTitle>Add New User</CardTitle>
            <CardDescription>Create a new user account with the information below</CardDescription>
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
                  placeholder="Enter username"
                  required
                />
              </div>

                <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Enter password (min 6 characters)"
                  required
                  minLength={6}
                />
                <p className="text-sm text-muted-foreground">Passwords must be at least 6 characters long.</p>
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
                  {isSubmitting ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}