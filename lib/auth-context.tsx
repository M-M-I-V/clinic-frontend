"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getAuthToken, removeAuthToken } from "./auth"

type UserRole = "ADMIN" | "DMD" | "MD" | "NURSE"

interface User {
  username: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  logout: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = getAuthToken()
    if (token) {
      // Decode JWT to get user info (in production, validate with backend)
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))

        console.log("[v0] Full JWT Payload:", payload)
        console.log("[v0] Available fields:", Object.keys(payload))

        let role = null

        // Check for 'role' field (single role as string)
        if (payload.role) {
          role = payload.role
          console.log("[v0] Found role in 'role' field:", role)
        }
        // Check for 'roles' field (array of roles)
        else if (payload.roles && Array.isArray(payload.roles) && payload.roles.length > 0) {
          role = payload.roles[0]
          console.log("[v0] Found role in 'roles' array:", role)
        }
        // Check for 'authorities' field (Spring Security default)
        else if (payload.authorities && Array.isArray(payload.authorities) && payload.authorities.length > 0) {
          role = payload.authorities[0]
          console.log("[v0] Found role in 'authorities' array:", role)
        }
        // Check for 'auth' field
        else if (payload.auth) {
          role = payload.auth
          console.log("[v0] Found role in 'auth' field:", role)
        } else {
          role = "USER"
          console.log("[v0] No role field found, defaulting to USER")
        }

        // If role starts with "ROLE_", remove the prefix
        if (typeof role === "string" && role.startsWith("ROLE_")) {
          const originalRole = role
          role = role.substring(5) // Remove "ROLE_" prefix
          console.log("[v0] Stripped ROLE_ prefix:", originalRole, "->", role)
        }

        console.log("[v0] Final extracted role:", role)

        setUser({
          username: payload.sub || payload.username,
          role: role as UserRole,
        })
      } catch (error) {
        console.error("Failed to decode token:", error)
        removeAuthToken()
      }
    }
    setIsLoading(false)
  }, [])

  const logout = () => {
    removeAuthToken()
    setUser(null)
    window.location.href = "/"
  }

  return <AuthContext.Provider value={{ user, isLoading, logout, setUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
