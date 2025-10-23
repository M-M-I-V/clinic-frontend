"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateMedicalVisit, getMedicalVisit, usePatientsList } from "@/lib/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Image from 'next/image'

interface MedicalVisitEditFormProps {
  visitId: number
}

interface MedicalVisitFormData {
  patientId: string
  visitDate: string
  chiefComplaint: string
  temperature: string
  bloodPressure: string
  pulseRate: string
  respiratoryRate: string
  spo2: string
  history: string
  symptoms: string
  physicalExamFindings: string
  diagnosis: string
  plan: string
  treatment: string
  hama: string
  referralForm: string
  medicalChartImage: File | null
}

export function MedicalVisitEditForm({ visitId }: MedicalVisitEditFormProps) {
  const router = useRouter()
  const { data: patients } = usePatientsList()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<MedicalVisitFormData | null>(null)

  const [formData, setFormData] = useState<MedicalVisitFormData>({
    patientId: "",
    visitDate: "",
    chiefComplaint: "",
    temperature: "",
    bloodPressure: "",
    pulseRate: "",
    respiratoryRate: "",
    spo2: "",
    history: "",
    symptoms: "",
    physicalExamFindings: "",
    diagnosis: "",
    plan: "",
    treatment: "",
    hama: "",
    referralForm: "",
    medicalChartImage: null,
  })

  const [patientName, setPatientName] = useState<string>("")
  const [existingChartImage, setExistingChartImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        setIsLoading(true)
        const visit = await getMedicalVisit(visitId)

        const matchingPatient = patients?.find(
          (p) => `${p.firstName} ${p.lastName}`.toLowerCase() === visit.fullName?.toLowerCase(),
        )

        setPatientName(visit.fullName || "")
        setExistingChartImage(visit.medicalChartImage || null)

        setFormData({
          patientId: matchingPatient?.id.toString() || "",
          visitDate: visit.visitDate || "",
          chiefComplaint: visit.chiefComplaint || "",
          temperature: visit.temperature?.toString() || "",
          bloodPressure: visit.bloodPressure || "",
          pulseRate: visit.pulseRate?.toString() || "",
          respiratoryRate: visit.respiratoryRate?.toString() || "",
          spo2: visit.spo2?.toString() || "",
          history: visit.history || "",
          symptoms: visit.symptoms || "",
          physicalExamFindings: visit.physicalExamFindings || "",
          diagnosis: visit.diagnosis || "",
          plan: visit.plan || "",
          treatment: visit.treatment || "",
          hama: visit.hama || "",
          referralForm: visit.referralForm || "",
          medicalChartImage: null,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load visit")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVisit()
  }, [visitId, patients])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        medicalChartImage: file,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPendingFormData(formData)
    setShowConfirmDialog(true)
  }

  const handleConfirmUpdate = async () => {
    setShowConfirmDialog(false)
    setError(null)
    setIsSubmitting(true)

    try {
      if (!pendingFormData) {
        throw new Error("No form data to update")
      }

      if (!pendingFormData.patientId) {
        throw new Error("Please select a patient")
      }

      if (!pendingFormData.visitDate) {
        throw new Error("Please enter a visit date")
      }

      if (!pendingFormData.chiefComplaint) {
        throw new Error("Please enter the chief complaint")
      }

      await updateMedicalVisit(visitId, pendingFormData)
      setSuccess(true)

      setTimeout(() => {
        router.push(`/visits/${visitId}?type=MEDICAL`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update medical visit")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading visit details...</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground">Medical visit updated successfully!</h3>
        <p className="text-sm text-muted-foreground">Redirecting to visit details...</p>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Patient Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Patient *</label>
          <div className="w-full px-3 py-2 border border-input rounded-md bg-muted text-foreground">
            {patientName || "Loading..."}
          </div>
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
            placeholder="Reason for visit"
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
                <label className="block text-sm font-medium text-foreground mb-2">Temperature (°C)</label>
                <Input
                  type="number"
                  step="0.1"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  placeholder="e.g., 37.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Blood Pressure</label>
                <Input
                  type="text"
                  name="bloodPressure"
                  value={formData.bloodPressure}
                  onChange={handleInputChange}
                  placeholder="e.g., 120/80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Pulse Rate (bpm)</label>
                <Input
                  type="number"
                  name="pulseRate"
                  value={formData.pulseRate}
                  onChange={handleInputChange}
                  placeholder="e.g., 72"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Respiratory Rate (breaths/min)</label>
                <Input
                  type="number"
                  name="respiratoryRate"
                  value={formData.respiratoryRate}
                  onChange={handleInputChange}
                  placeholder="e.g., 16"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">SpO2 (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  name="spo2"
                  value={formData.spo2}
                  onChange={handleInputChange}
                  placeholder="e.g., 98.5"
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
              <label className="block text-sm font-medium text-foreground mb-2">Symptoms</label>
              <Textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                placeholder="Current symptoms"
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
                placeholder="Clinical diagnosis"
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

        {/* Additional Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">HAMA</label>
              <Input
                type="text"
                name="hama"
                value={formData.hama}
                onChange={handleInputChange}
                placeholder="HAMA information"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Referral Form</label>
              <Input
                type="text"
                name="referralForm"
                value={formData.referralForm}
                onChange={handleInputChange}
                placeholder="Referral form information"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Medical Chart Image</label>
              {existingChartImage && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Current Image:</p>
                  <Image
                    src={existingChartImage || "/placeholder.svg"}
                    alt="Medical Chart"
                    width={500}
                    height={300}
                    className="max-w-xs h-auto rounded-md border border-input"
                  />
                </div>
              )}
              <Input type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer" />
              {formData.medicalChartImage && (
                <p className="text-sm text-muted-foreground mt-2">Selected: {formData.medicalChartImage.name}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/visits/${visitId}?type=MEDICAL`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? "Updating..." : "Update Medical Visit"}
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update this medical visit? Please review your changes before confirming.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUpdate}
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? "Updating..." : "Confirm Update"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}