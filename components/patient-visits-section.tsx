"use client"

import { useState } from "react"
import { usePatientVisits } from "@/lib/api"
import { VisitsTable } from "./visits-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"

interface PatientVisitsSectionProps {
  patientId: number
  patientName: string
}

const ITEMS_PER_PAGE = 10

export function PatientVisitsSection({ patientId, patientName }: PatientVisitsSectionProps) {
  const { data: visits, error, isLoading } = usePatientVisits(patientId)
  const [currentPage, setCurrentPage] = useState(1)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medical & Dental Visits</CardTitle>
          <CardDescription>Loading visits for {patientName}...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Medical & Dental Visits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load visits. Please try again later.</p>
        </CardContent>
      </Card>
    )
  }

  if (!visits || visits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medical & Dental Visits</CardTitle>
          <CardDescription>No visits recorded for {patientName}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">This patient has no visit records yet.</p>
        </CardContent>
      </Card>
    )
  }

  const totalPages = Math.ceil(visits.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedVisits = visits.slice(startIndex, endIndex)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical & Dental Visits</CardTitle>
        <CardDescription>
          {visits.length} visit(s) recorded for {patientName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VisitsTable visits={paginatedVisits} />

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, visits.length)} of {visits.length} visits
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="h-8 w-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}