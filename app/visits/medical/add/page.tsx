"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MedicalVisitForm } from "@/components/medical-visit-form"

export default function AddMedicalVisitPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

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

  // Check if user has required role (MD or NURSE)
  const hasAccess = ["MD", "NURSE"].includes(user.role)

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You do not have permission to add medical visits.</CardDescription>
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Add Medical Visit</h1>
          <p className="text-muted-foreground">Record a new medical visit for a patient</p>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Visit Details</CardTitle>
            <CardDescription>Fill in the patient&apos;s medical visit information</CardDescription>
          </CardHeader>
          <CardContent>
            <MedicalVisitForm />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}