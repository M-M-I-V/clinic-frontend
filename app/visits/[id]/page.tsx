"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { getMedicalVisit, getDentalVisit, deleteMedicalVisit, deleteDentalVisit, type Visit } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pencil, Trash2, Calendar, User, Stethoscope, AlertCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AuditTrail } from "@/components/audit-trail"

export default function VisitProfilePage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const visitId = Number.parseInt(params.id as string)
  const visitType = searchParams.get("type") || "MEDICAL"

  const [visit, setVisit] = useState<Visit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const canEditDelete = () => {
    if (!user) return false
    if (visitType === "MEDICAL") {
      return user.role === "MD"
    } else if (visitType === "DENTAL") {
      return user.role === "DMD"
    }
    return false
  }

  const getPermissionMessage = () => {
    if (visitType === "MEDICAL") {
      return "Only users with MD role can edit or delete medical visits."
    } else if (visitType === "DENTAL") {
      return "Only users with DMD role can edit or delete dental visits."
    }
    return "You do not have permission to edit or delete this visit."
  }

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        setIsLoading(true)
        setError(null)

        let visitData
        if (visitType === "DENTAL") {
          visitData = await getDentalVisit(visitId)
        } else {
          visitData = await getMedicalVisit(visitId)
        }

        setVisit(visitData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load visit")
      } finally {
        setIsLoading(false)
      }
    }

    if (visitId && !authLoading) {
      fetchVisit()
    }
  }, [visitId, visitType, authLoading])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      if (visitType === "DENTAL") {
        await deleteDentalVisit(visitId)
      } else {
        await deleteMedicalVisit(visitId)
      }

      router.push("/visits")
    } catch (error) {
      console.error("Error deleting visit:", error)
      setIsDeleting(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const hasAccess = ["MD", "DMD", "NURSE"].includes(user.role)

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You do not have permission to view visit details.</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => router.push("/visits")} className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Visits
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Error Loading Visit
              </CardTitle>
              <CardDescription>{error}</CardDescription>
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

  if (!visit) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Not Found</CardTitle>
              <CardDescription>Visit not found.</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Back Button and Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/visits")} className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Visits
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{visit.fullName}</h1>
              <p className="text-muted-foreground mt-1">Visit on {formatDate(visit.visitDate)}</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  onClick={() => router.push(`/visits/${visit.id}/edit?type=${visitType}`)}
                  disabled={!canEditDelete()}
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Visit
                </Button>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="destructive"
                  disabled={!canEditDelete()}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Visit
                </Button>
              </div>
              {!canEditDelete() && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800">{getPermissionMessage()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <AuditTrail entityName={visitType === "DENTAL" ? "DentalVisits" : "MedicalVisits"} recordId={visitId} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Visit Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Visit Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Visit Date</p>
                <p className="text-base">{formatDate(visit.visitDate)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Visit Type</p>
                <Badge variant={visit.visitType === "MEDICAL" ? "default" : "secondary"} className="mt-1">
                  {visit.visitType}
                </Badge>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Chief Complaint</p>
                <p className="text-base mt-2">{visit.chiefComplaint || "—"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-base">{visit.fullName}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Birth Date</p>
                <p className="text-base">{formatDate(visit.birthDate)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Age</p>
                <p className="text-base">
                  {new Date().getFullYear() - new Date(visit.birthDate).getFullYear()} years old
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Vital Signs */}
          {(visit.temperature || visit.bloodPressure || visit.pulseRate || visit.respiratoryRate || visit.spo2) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vital Signs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {visit.temperature && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Temperature</p>
                      <p className="text-base">{visit.temperature}°C</p>
                    </div>
                    <Separator />
                  </>
                )}
                {visit.bloodPressure && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Blood Pressure</p>
                      <p className="text-base">{visit.bloodPressure}</p>
                    </div>
                    <Separator />
                  </>
                )}
                {visit.pulseRate && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pulse Rate</p>
                      <p className="text-base">{visit.pulseRate} bpm</p>
                    </div>
                    <Separator />
                  </>
                )}
                {visit.respiratoryRate && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Respiratory Rate</p>
                      <p className="text-base">{visit.respiratoryRate} breaths/min</p>
                    </div>
                    <Separator />
                  </>
                )}
                {visit.spo2 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">SpO2</p>
                    <p className="text-base">{visit.spo2}%</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Clinical History */}
          {(visit.history || visit.physicalExamFindings || visit.diagnosticTestResult || visit.diagnosticTestImage) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Clinical History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {visit.history && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Medical History</p>
                      <p className="text-base mt-2">{visit.history}</p>
                    </div>
                    <Separator />
                  </>
                )}
                {visit.physicalExamFindings && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Physical Exam Findings</p>
                      <p className="text-base mt-2">{visit.physicalExamFindings}</p>
                    </div>
                    <Separator />
                  </>
                )}
                {visit.diagnosticTestResult && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Diagnostic Test Result</p>
                      <p className="text-base mt-2">{visit.diagnosticTestResult}</p>
                    </div>
                    <Separator />
                  </>
                )}
                {visit.diagnosticTestImage && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Diagnostic Test Image</p>
                    <Image
                      src={visit.diagnosticTestImage || "/placeholder.svg"}
                      alt="Diagnostic Test"
                      width={600}
                      height={400}
                      className="mt-2 max-w-full h-auto rounded-md border border-border"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Assessment & Plan */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Assessment & Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Diagnosis</p>
                <p className="text-base mt-2">{visit.diagnosis || "—"}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plan</p>
                <p className="text-base mt-2">{visit.plan || "—"}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Treatment</p>
                <p className="text-base mt-2">{visit.treatment || "—"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Medical Visit Specific Fields */}
          {visitType === "MEDICAL" &&
            (visit.hama || visit.referralForm || visit.medicalChartImage || visit.nursesNotes) && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Medical Visit Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {visit.hama && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">HAMA</p>
                        <p className="text-base mt-2">{visit.hama}</p>
                      </div>
                      <Separator />
                    </>
                  )}
                  {visit.referralForm && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Referral Form</p>
                        <p className="text-base mt-2">{visit.referralForm}</p>
                      </div>
                      <Separator />
                    </>
                  )}
                  {visit.nursesNotes && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Nurse Notes</p>
                        <p className="text-base mt-2 whitespace-pre-wrap">{visit.nursesNotes}</p>
                      </div>
                      <Separator />
                    </>
                  )}
                  {visit.medicalChartImage && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Medical Chart Image</p>
                      <Image
                        src={visit.medicalChartImage || "/placeholder.svg"}
                        alt="Medical Chart"
                        width={600}
                        height={400}
                        className="mt-2 max-w-full h-auto rounded-md border border-border"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          {/* Dental Visit Specific Fields */}
          {visitType === "DENTAL" && (visit.dentalChartImage || visit.toothStatus) && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Dental Visit Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {visit.toothStatus && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tooth Status</p>
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <div className="text-xs space-y-1">
                          {Object.entries(JSON.parse(visit.toothStatus)).map(([tooth, status]) => (
                            <div key={tooth} className="flex items-center gap-2">
                              <span className="font-medium w-8">{tooth}:</span>
                              <span
                                className={`px-2 py-1 rounded text-white text-xs font-medium ${
                                  status === "C"
                                    ? "bg-red-500"
                                    : status === "X"
                                      ? "bg-gray-700"
                                      : status === "V"
                                        ? "bg-green-500"
                                        : "bg-gray-300"
                                }`}
                              >
                                {status === "C"
                                  ? "Caries"
                                  : status === "X"
                                    ? "Extraction"
                                    : status === "V"
                                      ? "No Caries"
                                      : "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}
                {visit.dentalChartImage && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Dental Chart Image</p>
                    <Image
                      src={visit.dentalChartImage || "/placeholder.svg"}
                      alt="Dental Chart"
                      width={600}
                      height={400}
                      className="mt-2 max-w-full h-auto rounded-md border border-border"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Visit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this visit record for {visit.fullName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}