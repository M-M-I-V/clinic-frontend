"use client"

import { usePatientVisits } from "@/lib/api"
import { VisitsTable } from "./visits-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface PatientVisitsSectionProps {
  patientId: number
  patientName: string
}

export function PatientVisitsSection({ patientId, patientName }: PatientVisitsSectionProps) {
  const { data: visits, error, isLoading } = usePatientVisits(patientId)

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical & Dental Visits</CardTitle>
        <CardDescription>
          {visits.length} visit(s) recorded for {patientName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VisitsTable visits={visits} />
      </CardContent>
    </Card>
  )
}