"use client"

import { useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { MedicalVisitEditForm } from "@/components/medical-visit-edit-form"
import { DentalVisitEditForm } from "@/components/dental-visit-edit-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function EditVisitPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const visitId = Number.parseInt(params.id as string)
  const visitType = searchParams.get("type") || "MEDICAL"

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const hasAccess = ["MD", "DMD"].includes(user.role)

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">You do not have permission to edit visits.</p>
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
        <Button
          variant="ghost"
          onClick={() => router.push(`/visits/${visitId}?type=${visitType}`)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Visit
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Edit {visitType === "DENTAL" ? "Dental" : "Medical"} Visit
          </h1>
          <p className="text-muted-foreground mt-2">Update the visit details below</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {visitType === "DENTAL" ? (
              <DentalVisitEditForm visitId={visitId} />
            ) : (
              <MedicalVisitEditForm visitId={visitId} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}