"use client"

import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Visit {
  id: number
  fullName: string
  birthDate: string
  visitDate: string
  visitType: string
  symptoms?: string
  physicalExamFindings?: string
  diagnosis?: string
  treatment?: string
}

interface VisitsTableProps {
  visits: Visit[]
}

export function VisitsTable({ visits }: VisitsTableProps) {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleRowClick = (visitId: number, visitType: string) => {
    router.push(`/visits/${visitId}?type=${visitType}`)
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Patient</TableHead>
            <TableHead className="font-semibold">Symptoms</TableHead>
            <TableHead className="font-semibold">Physical Exam</TableHead>
            <TableHead className="font-semibold">Diagnosis</TableHead>
            <TableHead className="font-semibold">Treatment</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visits.map((visit) => (
            <TableRow
              key={visit.id}
              className="hover:bg-muted/30 cursor-pointer"
              onClick={() => handleRowClick(visit.id, visit.visitType)}
            >
              <TableCell className="font-medium">{formatDate(visit.visitDate)}</TableCell>
              <TableCell className="text-primary hover:underline">{visit.fullName}</TableCell>
              <TableCell className="text-sm">{visit.symptoms || "—"}</TableCell>
              <TableCell className="text-sm">{visit.physicalExamFindings || "—"}</TableCell>
              <TableCell className="text-sm">{visit.diagnosis || "—"}</TableCell>
              <TableCell className="text-sm">{visit.treatment || "—"}</TableCell>
              <TableCell>
                <Badge
                  variant={visit.visitType === "MEDICAL" ? "default" : "secondary"}
                  className={
                    visit.visitType === "MEDICAL"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }
                >
                  {visit.visitType}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}