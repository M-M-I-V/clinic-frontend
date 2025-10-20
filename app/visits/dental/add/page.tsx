"use client"

import { Header } from "@/components/header"
import { DentalVisitForm } from "@/components/dental-visit-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AddDentalVisitPage() {
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

  // Check if user has DMD role
  if (user.role !== "DMD") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>Only dentists (DMD) can create dental visits.</CardDescription>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Add Dental Visit</h1>
          <p className="text-muted-foreground">Create a new dental visit record</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dental Visit Details</CardTitle>
            <CardDescription>Fill in the patient information and dental examination findings</CardDescription>
          </CardHeader>
          <CardContent>
            <DentalVisitForm />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}