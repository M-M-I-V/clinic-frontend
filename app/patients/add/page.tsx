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

const CATEGORIES = ["Student", "Staff", "Faculty"]
const STATUS_OPTIONS = ["Active", "Inactive"]

export default function AddPatientPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    studentNumber: "",
    lastName: "",
    firstName: "",
    middleInitial: "",
    status: "",
    gender: "",
    birthDate: "",
    heightCm: "",
    weightKg: "",
    bmi: "",
    category: "",
    medicalDone: "",
    dentalDone: "",
    contactNumber: "",
    healthExamForm: "",
    medicalDentalInfoSheet: "",
    dentalChart: "",
    specialMedicalCondition: "",
    communicableDisease: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactNumber: "",
    remarks: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const patientData = {
        studentNumber: formData.studentNumber || undefined,
        lastName: formData.lastName,
        firstName: formData.firstName,
        middleInitial: formData.middleInitial || undefined,
        status: formData.status || undefined,
        gender: formData.gender,
        birthDate: formData.birthDate || undefined,
        heightCm: formData.heightCm ? Number.parseFloat(formData.heightCm) : undefined,
        weightKg: formData.weightKg ? Number.parseFloat(formData.weightKg) : undefined,
        bmi: formData.bmi ? Number.parseFloat(formData.bmi) : undefined,
        category: formData.category || undefined,
        medicalDone: formData.medicalDone || undefined,
        dentalDone: formData.dentalDone || undefined,
        contactNumber: formData.contactNumber || undefined,
        healthExamForm: formData.healthExamForm || undefined,
        medicalDentalInfoSheet: formData.medicalDentalInfoSheet || undefined,
        dentalChart: formData.dentalChart || undefined,
        specialMedicalCondition: formData.specialMedicalCondition || undefined,
        communicableDisease: formData.communicableDisease || undefined,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactRelationship: formData.emergencyContactRelationship || undefined,
        emergencyContactNumber: formData.emergencyContactNumber || undefined,
        remarks: formData.remarks || undefined,
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
                    <Label htmlFor="firstName">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="middleInitial">Middle Initial</Label>
                    <Input
                      id="middleInitial"
                      value={formData.middleInitial}
                      onChange={(e) => handleChange("middleInitial", e.target.value)}
                      maxLength={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentNumber">Student Number</Label>
                    <Input
                      id="studentNumber"
                      value={formData.studentNumber}
                      onChange={(e) => handleChange("studentNumber", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">
                      Gender <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)} required>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number *</Label>
                    <Input
                      id="contactNumber"
                      type="tel"
                      value={formData.contactNumber}
                      onChange={(e) => handleChange("contactNumber", e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              {/* Physical Measurements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Physical Measurements</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="heightCm">Height (cm)</Label>
                    <Input
                      id="heightCm"
                      type="number"
                      step="0.1"
                      value={formData.heightCm}
                      onChange={(e) => handleChange("heightCm", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weightKg">Weight (kg)</Label>
                    <Input
                      id="weightKg"
                      type="number"
                      step="0.1"
                      value={formData.weightKg}
                      onChange={(e) => handleChange("weightKg", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bmi">BMI</Label>
                    <Input
                      id="bmi"
                      type="number"
                      step="0.1"
                      value={formData.bmi}
                      onChange={(e) => handleChange("bmi", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Category</h3>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Medical and Dental Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Medical and Dental Status</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="medicalDone">Medical Done</Label>
                    <Select value={formData.medicalDone} onValueChange={(value) => handleChange("medicalDone", value)}>
                      <SelectTrigger id="medicalDone">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dentalDone">Dental Done</Label>
                    <Select value={formData.dentalDone} onValueChange={(value) => handleChange("dentalDone", value)}>
                      <SelectTrigger id="dentalDone">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Forms Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Forms Status</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="healthExamForm">Health Exam Form</Label>
                    <Select
                      value={formData.healthExamForm}
                      onValueChange={(value) => handleChange("healthExamForm", value)}
                    >
                      <SelectTrigger id="healthExamForm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicalDentalInfoSheet">Medical/Dental Info Sheet</Label>
                    <Select
                      value={formData.medicalDentalInfoSheet}
                      onValueChange={(value) => handleChange("medicalDentalInfoSheet", value)}
                    >
                      <SelectTrigger id="medicalDentalInfoSheet">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dentalChart">Dental Chart</Label>
                    <Select value={formData.dentalChart} onValueChange={(value) => handleChange("dentalChart", value)}>
                      <SelectTrigger id="dentalChart">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialMedicalCondition">Special Medical Condition</Label>
                    <Textarea
                      id="specialMedicalCondition"
                      value={formData.specialMedicalCondition}
                      onChange={(e) => handleChange("specialMedicalCondition", e.target.value)}
                      placeholder="List any special medical conditions"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="communicableDisease">Communicable Disease</Label>
                    <Textarea
                      id="communicableDisease"
                      value={formData.communicableDisease}
                      onChange={(e) => handleChange("communicableDisease", e.target.value)}
                      placeholder="List any communicable diseases"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) => handleChange("remarks", e.target.value)}
                      placeholder="Additional remarks or notes"
                      rows={3}
                    />
                  </div>
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