"use client"

import { Separator } from "@/components/ui/separator"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createDentalVisit } from "@/lib/api"
import { usePatientsList } from "@/lib/api"
import DentalChart from "@/components/dental-chart"

export function DentalVisitForm() {
  const router = useRouter()
  const { data: patients } = usePatientsList()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    patientId: "",
    visitDate: "",
    chiefComplaint: "",
    temperature: "",
    bloodPressure: "",
    pulseRate: "",
    respiratoryRate: "",
    spo2: "",
    history: "",
    physicalExamFindings: "",
    diagnosis: "",
    plan: "",
    treatment: "",
    diagnosticTestResult: "",
    toothStatus: "",
    dentalChartImage: null as File | null,
    diagnosticTestImage: null as File | null,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (!formData.patientId) {
        throw new Error("Please select a patient")
      }

      if (!formData.visitDate) {
        throw new Error("Please enter a visit date")
      }

      if (!formData.chiefComplaint) {
        throw new Error("Please enter the chief complaint")
      }

      await createDentalVisit({
        ...formData,
        toothStatus: formData.toothStatus,
      })
      setSuccess(true)

      // Redirect to visits page after 2 seconds
      setTimeout(() => {
        router.push("/visits")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create dental visit")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground">Dental visit created successfully!</h3>
        <p className="text-sm text-muted-foreground">Redirecting to visits page...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Patient Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Patient *</label>
        <select
          name="patientId"
          value={formData.patientId}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option value="">Select a patient</option>
          {patients?.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.firstName} {patient.lastName} {patient.studentNumber ? `(${patient.studentNumber})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Visit Date */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Visit Date *</label>
        <Input type="date" name="visitDate" value={formData.visitDate} onChange={handleInputChange} required />
      </div>

      {/* Chief Complaint */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Chief Complaint *</label>
        <Textarea
          name="chiefComplaint"
          value={formData.chiefComplaint}
          onChange={handleInputChange}
          placeholder="Reason for dental visit"
          required
        />
      </div>

      {/* Vital Signs Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vital Signs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Temperature (°C)*</label>
              <Input
                type="number"
                step="0.1"
                name="temperature"
                value={formData.temperature}
                onChange={handleInputChange}
                placeholder="e.g., 37.5"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Blood Pressure*</label>
              <Input
                type="text"
                name="bloodPressure"
                value={formData.bloodPressure}
                onChange={handleInputChange}
                placeholder="e.g., 120/80"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Pulse Rate (bpm)*</label>
              <Input
                type="number"
                name="pulseRate"
                value={formData.pulseRate}
                onChange={handleInputChange}
                placeholder="e.g., 72"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Respiratory Rate (breaths/min)*</label>
              <Input
                type="number"
                name="respiratoryRate"
                value={formData.respiratoryRate}
                onChange={handleInputChange}
                placeholder="e.g., 16"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">SpO2 (%)*</label>
              <Input
                type="number"
                step="0.1"
                name="spo2"
                value={formData.spo2}
                onChange={handleInputChange}
                placeholder="e.g., 98.5"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical History Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clinical History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Medical History</label>
            <Textarea
              name="history"
              value={formData.history}
              onChange={handleInputChange}
              placeholder="Relevant medical history"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Physical Exam Findings</label>
            <Textarea
              name="physicalExamFindings"
              value={formData.physicalExamFindings}
              onChange={handleInputChange}
              placeholder="Physical examination findings"
            />
          </div>
        </CardContent>
      </Card>

      {/* Assessment & Plan Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assessment & Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Diagnosis</label>
            <Textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleInputChange}
              placeholder="Dental diagnosis"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Plan</label>
            <Textarea name="plan" value={formData.plan} onChange={handleInputChange} placeholder="Treatment plan" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Treatment</label>
            <Textarea
              name="treatment"
              value={formData.treatment}
              onChange={handleInputChange}
              placeholder="Treatment provided"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dental Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dental Chart & Imaging</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Tooth Status</label>
            <DentalChart
              value={formData.toothStatus ? JSON.parse(formData.toothStatus) : {}}
              onChange={(data) => setFormData((prev) => ({ ...prev, toothStatus: JSON.stringify(data) }))}
            />
          </div>

          <Separator />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Diagnostic Test Result</label>
            <Textarea
              name="diagnosticTestResult"
              value={formData.diagnosticTestResult}
              onChange={handleInputChange}
              placeholder="Results of diagnostic tests"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Dental Chart Image</label>
            <Input
              type="file"
              name="dentalChartImage"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {formData.dentalChartImage && (
              <p className="text-sm text-muted-foreground mt-2">Selected: {formData.dentalChartImage.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Diagnostic Test Image</label>
            <Input
              type="file"
              name="diagnosticTestImage"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {formData.diagnosticTestImage && (
              <p className="text-sm text-muted-foreground mt-2">Selected: {formData.diagnosticTestImage.name}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={() => router.push("/visits")} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSubmitting ? "Creating..." : "Create Dental Visit"}
        </Button>
      </div>
    </form>
  )
}