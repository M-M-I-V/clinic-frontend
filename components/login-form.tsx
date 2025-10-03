"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react"
import Image from "next/image"
import { setAuthToken } from "@/lib/auth"
import { useAuth } from "@/lib/auth-context"
import { API_BASE_URL } from "@/lib/api"

export default function LoginForm() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Input sanitization function to prevent XSS
  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .slice(0, 100) // Limit length
  }

  const validateForm = (): boolean => {
    if (!username || !password) {
      setError("Please enter both username and password")
      return false
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters")
      return false
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Sanitize inputs before sending
      const sanitizedUsername = sanitizeInput(username)
      const sanitizedPassword = sanitizeInput(password)

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: sanitizedUsername,
          password: sanitizedPassword,
        }),
      })

      if (!response.ok) {
        throw new Error("Invalid credentials")
      }

      const token = await response.text()

      // Store JWT token securely
      setAuthToken(token)

      // Decode token to get user info
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))

        let role = payload.role || payload.authorities?.[0] || "USER"
        if (typeof role === "string" && role.startsWith("ROLE_")) {
          role = role.substring(5) // Remove "ROLE_" prefix
        }

        setUser({
          username: payload.sub || payload.username,
          role: role,
        })
      } catch (decodeError) {
        console.error("Failed to decode token:", decodeError)
      }

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-border">
      <CardHeader className="space-y-4 text-center">
        <div className="flex justify-center mb-2">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white shadow-md">
            <Image
              src="/college-clinic-medical-logo.jpg"
              alt="College Clinic Logo"
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold text-balance text-foreground">
            Patient Record Management System
          </CardTitle>
          <CardDescription className="text-muted-foreground">Sign in to access your account</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                disabled={isLoading}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Secure access to patient records</p>
        </div>
      </CardContent>
    </Card>
  )
}