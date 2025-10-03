"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Patients", href: "/patients" },
  { name: "Visits", href: "/visits" },
  { name: "Help", href: "/help" },
]

export function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
            <Image
              src="/college-clinic-medical-logo.jpg"
              alt="College Clinic Logo"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <span className="font-semibold text-lg hidden sm:inline-block">Patient Records</span>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            // Only show Users link if user has ADMIN role
            if (item.name === "Users" && user?.role !== "ADMIN") {
              return null
            }

            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted",
                )}
              >
                {item.name}
              </Link>
            )
          })}
          {/* Users link - only visible for ADMIN */}
          {user?.role === "ADMIN" && (
            <Link
              href="/users"
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === "/users"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted",
              )}
            >
              Users
            </Link>
          )}
        </nav>

        {/* Right side: Theme toggle and Logout */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}