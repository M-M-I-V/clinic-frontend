"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { createPatient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"

const PROGRAMS = ["BSIS", "ABComm", "BSMath", "BPA", "BPEd", "BSN"]

export default function AddPatientPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    studentId: "",
    fullName: "",
    birthDate: "",
    sex: "",
    age: "",
    program: "",
    contactNumber: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    emergencyContactRelationship: "",
    knownDiseases: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Prepare data, converting empty strings to undefined for optional fields
      const patientData = {
        studentId: formData.studentId || undefined,
        fullName: formData.fullName,
        birthDate: formData.birthDate || undefined,
        sex: formData.sex,
        age: formData.age ? Number.parseInt(formData.age) : undefined,
        program: formData.program,
        contactNumber: formData.contactNumber || undefined,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactNumber: formData.emergencyContactNumber || undefined,
        emergencyContactRelationship: formData.emergencyContactRelationship || undefined,
        knownDiseases: formData.knownDiseases || undefined,
      }

      await createPatient(patientData)
      router.push("/patients")
    } catch (error) {
      console.error("Failed to create patient:", error)
      alert("Failed to create patient. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    router.push("/")
    return null
  }

  // Check if user has required role
  const hasAccess = ["MD", "DMD", "NURSE"].includes(user.role)

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You do not have permission to add patients.</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => router.push("/patients")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Patients
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Add New Patient</CardTitle>
            <CardDescription>Enter the patient&apos;s information below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      value={formData.studentId}
                      onChange={(e) => handleChange("studentId", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Birth Date</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleChange("birthDate", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="0"
                      value={formData.age}
                      onChange={(e) => handleChange("age", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sex">
                      Sex <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.sex} onValueChange={(value) => handleChange("sex", value)} required>
                      <SelectTrigger id="sex">
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      type="tel"
                      value={formData.contactNumber}
                      onChange={(e) => handleChange("contactNumber", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Academic Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="program">
                    Program <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.program} onValueChange={(value) => handleChange("program", value)} required>
                    <SelectTrigger id="program">
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROGRAMS.map((program) => (
                        <SelectItem key={program} value={program}>
                          {program}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Emergency Contact</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactNumber">Contact Number</Label>
                    <Input
                      id="emergencyContactNumber"
                      type="tel"
                      value={formData.emergencyContactNumber}
                      onChange={(e) => handleChange("emergencyContactNumber", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                    <Input
                      id="emergencyContactRelationship"
                      value={formData.emergencyContactRelationship}
                      onChange={(e) => handleChange("emergencyContactRelationship", e.target.value)}
                      placeholder="e.g., Parent, Sibling, Spouse"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Medical Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="knownDiseases">Known Diseases</Label>
                  <Textarea
                    id="knownDiseases"
                    value={formData.knownDiseases}
                    onChange={(e) => handleChange("knownDiseases", e.target.value)}
                    placeholder="List any known diseases or medical conditions"
                    rows={4}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/patients")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Patient"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
