"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Visit {
  id: number
  visitDate: string
  chiefComplaint: string
  visitType: string
  diagnosis?: string
  patient?: {
    firstName: string
    lastName: string
  }
}

interface VisitsTableProps {
  visits: Visit[]
}

export function VisitsTable({ visits }: VisitsTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Reason</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Diagnosis</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visits.map((visit) => (
            <TableRow key={visit.id} className="hover:bg-muted/30 cursor-pointer">
              <TableCell className="font-medium">{formatDate(visit.visitDate)}</TableCell>
              <TableCell>{visit.chiefComplaint}</TableCell>
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
              <TableCell className="text-muted-foreground">{visit.diagnosis || "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}