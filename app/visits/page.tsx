"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Upload, Plus, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { VisitsTable } from "@/components/visits-table"
import { useVisits } from "@/lib/api"
import { useRef } from "react"

type VisitFilter = "all" | "medical" | "dental"

export default function VisitsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [filter, setFilter] = useState<VisitFilter>("all")
  const { data: visits, error, isLoading: visitsLoading, mutate } = useVisits()
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [importMessage, setImportMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportMessage(null)

    try {
      const { importVisits } = await import("@/lib/api")
      await importVisits(file)
      setImportMessage({ type: "success", text: "Visits imported successfully!" })
      // Refresh the visits list
      mutate()
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to import visits"
      setImportMessage({ type: "error", text: errorMessage })
    } finally {
      setIsImporting(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const { exportVisits } = await import("@/lib/api")
      await exportVisits()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to export visits"
      setImportMessage({ type: "error", text: errorMessage })
    } finally {
      setIsExporting(false)
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

  const totalPages = Math.ceil((filteredVisits?.length || 0) / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedVisits = filteredVisits?.slice(startIndex, endIndex) || []

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Error Loading Visits
              </CardTitle>
              <CardDescription>
                Unable to load visits. Please check your connection and try again. If the problem persists, contact
                support.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Visits</h1>
          <p className="text-muted-foreground">View and manage patient visits</p>
        </div>

        {/* Import/Export Message */}
        {importMessage && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              importMessage.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {importMessage.text}
          </div>
        )}

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
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                >
                  <Upload className="h-4 w-4" />
                  {isImporting ? "Importing..." : "Import"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4" />
                  {isExporting ? "Exporting..." : "Export"}
                </Button>
                <Button
                  size="sm"
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => router.push("/visits/medical/add")}
                >
                  <Plus className="h-4 w-4" />
                  Add Medical Visit
                </Button>
                <Button
                  size="sm"
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => router.push("/visits/dental/add")}
                >
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
            ) : !filteredVisits || filteredVisits.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                No visits found
              </div>
            ) : (
              <>
                <VisitsTable visits={paginatedVisits} />

                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages} • Showing {startIndex + 1}-
                    {Math.min(endIndex, filteredVisits.length)} of {filteredVisits.length}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}