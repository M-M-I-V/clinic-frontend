"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { API_BASE_URL } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Pencil, Calendar, Phone, User, GraduationCap, Heart, AlertCircle } from "lucide-react"
import useSWR from "swr"
import { fetchWithAuth } from "@/lib/auth"

interface PatientDetail {
  id: number
  studentId?: string
  fullName: string
  birthDate?: string
  sex: string
  age?: number
  program: string
  contactNumber?: string
  emergencyContactName?: string
  emergencyContactNumber?: string
  emergencyContactRelationship?: string
  knownDiseases?: string
}

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
  } = useSWR<PatientDetail>(patientId ? `${API_BASE_URL}/api/patients/${patientId}` : null, fetcher)

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
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>Failed to load patient information.</CardDescription>
            </CardHeader>
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
              <h1 className="text-3xl font-bold text-foreground">{patient.fullName}</h1>
              <p className="text-muted-foreground mt-1">
                {patient.studentId ? `Student ID: ${patient.studentId}` : "Patient Profile"}
              </p>
            </div>
            <Button onClick={() => router.push(`/patients/${patient.id}/edit`)} className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
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
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-base">{patient.fullName}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Student ID</p>
                <p className="text-base">{patient.studentId || "—"}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sex</p>
                  <p className="text-base">{patient.sex}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Age</p>
                  <p className="text-base">{patient.age || "—"}</p>
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
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Program</p>
                <p className="text-base">{patient.program}</p>
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

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Known Diseases</p>
                <p className="text-base mt-2">{patient.knownDiseases || "None reported"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
