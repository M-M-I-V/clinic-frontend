"use client"

import { useEffect, useState } from "react"
import { getAuditLogs, type AuditLog } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History } from "lucide-react"

interface AuditTrailProps {
  entityName: string
  recordId: number
}

export function AuditTrail({ entityName, recordId }: AuditTrailProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getAuditLogs(entityName, recordId)
        setLogs(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load audit logs")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()
  }, [entityName, recordId])

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case "CREATE":
        return "default"
      case "UPDATE":
        return "secondary"
      case "DELETE":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
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
            <History className="h-5 w-5" />
            Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Audit Trail
          </CardTitle>
          <CardDescription>No audit logs available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Audit Trail
        </CardTitle>
        <CardDescription>{logs.length} record(s) found</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                  <span className="text-sm font-medium text-foreground">{log.username}</span>
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(log.timestamp)}</p>
                {log.details && <p className="text-sm text-muted-foreground mt-2">{log.details}</p>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}