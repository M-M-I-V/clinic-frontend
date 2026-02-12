"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { API_BASE_URL, type Patient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Pencil,
  Calendar,
  Phone,
  User,
  GraduationCap,
  Heart,
  AlertCircle,
  Ruler,
  Weight,
  FileText,
  Activity,
} from "lucide-react"
import useSWR from "swr"
import { fetchWithAuth } from "@/lib/auth"
import { PatientVisitsSection } from "@/components/patient-visits-section"
import { AuditTrail } from "@/components/audit-trail"

const fetcher = async (url: string) => {
  const response = await fetchWithAuth(url)
  if (!response.ok) {
    throw new Error("Failed to fetch data")
  }
  return response.json()
}

export default function PatientProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading: authLoading } = useAuth()
  const patientId = params.id as string

  const {
    data: patient,
    error,
    isLoading,
  } = useSWR<Patient>(patientId ? `${API_BASE_URL}/api/patients/${patientId}` : null, fetcher)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

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
              <CardDescription>You do not have permission to view patient profiles.</CardDescription>
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
          <Button variant="ghost" onClick={() => router.push("/patients")} className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Error Loading Patient
              </CardTitle>
              <CardDescription>
                Unable to load patient information. Please check your connection and try again. If the problem persists,
                contact support.
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

  if (!patient) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Not Found</CardTitle>
              <CardDescription>Patient not found.</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Back Button and Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/patients")} className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {patient.firstName} {patient.middleInitial ? `${patient.middleInitial}. ` : ""}
                {patient.lastName}
              </h1>
              <p className="text-muted-foreground mt-1">
                {patient.studentNumber ? `Student Number: ${patient.studentNumber}` : "Patient Profile"}
              </p>
            </div>
            <Button onClick={() => router.push(`/patients/${patient.id}/edit`)} className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <AuditTrail entityName="Patients" recordId={patient.id} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">First Name</p>
                <p className="text-base">{patient.firstName}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                <p className="text-base">{patient.lastName}</p>
              </div>
              {patient.middleInitial && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Middle Initial</p>
                    <p className="text-base">{patient.middleInitial}</p>
                  </div>
                </>
              )}
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Student Number</p>
                <p className="text-base">{patient.studentNumber || "—"}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gender</p>
                  <p className="text-base">{patient.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant="secondary">{patient.status}</Badge>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Birth Date
                </p>
                <p className="text-base">{patient.birthDate || "—"}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Number
                </p>
                <p className="text-base">{patient.contactNumber || "—"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Physical Measurements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    Height
                  </p>
                  <p className="text-base">{patient.heightCm ? `${patient.heightCm} cm` : "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Weight className="h-4 w-4" />
                    Weight
                  </p>
                  <p className="text-base">{patient.weightKg ? `${patient.weightKg} kg` : "—"}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">BMI</p>
                <p className="text-base">{patient.bmi || "—"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Category & Medical Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <Badge variant="outline" className="mt-1">
                  {patient.category}
                </Badge>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Medical Done</p>
                  <Badge variant={patient.medicalDone === "Yes" ? "default" : "secondary"} className="mt-1">
                    {patient.medicalDone || "—"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dental Done</p>
                  <Badge variant={patient.dentalDone === "Yes" ? "default" : "secondary"} className="mt-1">
                    {patient.dentalDone || "—"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Forms Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Health Exam Form</p>
                <Badge variant={patient.healthExamForm === "Yes" ? "default" : "secondary"} className="mt-1">
                  {patient.healthExamForm || "—"}
                </Badge>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Medical/Dental Info Sheet</p>
                <Badge variant={patient.medicalDentalInfoSheet === "Yes" ? "default" : "secondary"} className="mt-1">
                  {patient.medicalDentalInfoSheet || "—"}
                </Badge>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dental Chart</p>
                <Badge variant={patient.dentalChart === "Yes" ? "default" : "secondary"} className="mt-1">
                  {patient.dentalChart || "—"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-base">{patient.emergencyContactName || "—"}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Relationship</p>
                <p className="text-base">{patient.emergencyContactRelationship || "—"}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Number
                </p>
                <p className="text-base">{patient.emergencyContactNumber || "—"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Special Medical Condition</p>
                <p className="text-base mt-2">{patient.specialMedicalCondition || "None reported"}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Communicable Disease</p>
                <p className="text-base mt-2">{patient.communicableDisease || "None reported"}</p>
              </div>
              {patient.remarks && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Remarks</p>
                    <p className="text-base mt-2">{patient.remarks}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <PatientVisitsSection patientId={patient.id} patientName={`${patient.firstName} ${patient.lastName}`} />
        </div>
      </main>
    </div>
  )
}