"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Upload, Plus } from "lucide-react"
import { VisitsTable } from "@/components/visits-table"
import { useVisits } from "@/lib/api"

type VisitFilter = "all" | "medical" | "dental"

export default function VisitsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [filter, setFilter] = useState<VisitFilter>("all")
  const { data: visits, error, isLoading: visitsLoading } = useVisits()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Check if user has required role (MD, DMD, or NURSE)
  const hasAccess = ["MD", "DMD", "NURSE"].includes(user.role)

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You do not have permission to view visits.</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  // Filter visits based on selected filter
  const filteredVisits = visits?.filter((visit) => {
    if (filter === "all") return true
    return visit.visitType.toLowerCase() === filter
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Visits</h1>
          <p className="text-muted-foreground">View and manage patient visits</p>
        </div>

        {/* Visits Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Patient Visits</CardTitle>
                <CardDescription>All medical and dental visits</CardDescription>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                  Add Medical Visit
                </Button>
                <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                  Add Dental Visit
                </Button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mt-4 border-b border-border">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  filter === "all" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
                {filter === "all" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
              <button
                onClick={() => setFilter("medical")}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  filter === "medical" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Medical
                {filter === "medical" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
              <button
                onClick={() => setFilter("dental")}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  filter === "dental" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Dental
                {filter === "dental" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {visitsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-sm text-destructive">
                Failed to load visits
              </div>
            ) : !filteredVisits || filteredVisits.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                No visits found
              </div>
            ) : (
              <VisitsTable visits={filteredVisits} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}