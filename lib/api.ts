import useSWR from "swr"
import { fetchWithAuth } from "./auth"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// API response types based on DashboardController.java
export interface KPIs {
  todaysVisits: number
  visitsThisMonth: number
}

export interface DiagnosisStats {
  diagnosis: string
  count: number
}

export interface VisitTrend {
  date: string
  count: number
}

export interface PatientList {
  id: number
  firstName: string
  lastName: string
  studentNumber?: string
  gender: string
  status: string
}

export interface Patient {
  id: number
  studentNumber?: string
  lastName: string
  firstName: string
  middleInitial?: string
  status?: string
  gender: string
  birthDate?: string
  heightCm?: number
  weightKg?: number
  bmi?: number
  category?: string // Student, Staff, Faculty
  medicalDone?: string // Yes or No
  dentalDone?: string // Yes or No
  contactNumber?: string
  healthExamForm?: string // Yes or No
  medicalDentalInfoSheet?: string // Yes or No
  dentalChart?: string // Yes or No
  specialMedicalCondition?: string
  communicableDisease?: string
  emergencyContactName?: string
  emergencyContactRelationship?: string
  emergencyContactNumber?: string
  remarks?: string
}

// SWR fetcher function
const fetcher = async (url: string) => {
  const response = await fetchWithAuth(url)
  if (!response.ok) {
    throw new Error("Failed to fetch data")
  }
  return response.json()
}

// Custom hooks for dashboard data
export function useKPIs() {
  return useSWR<KPIs>(`${API_BASE_URL}/api/dashboard/kpis`, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })
}

export function useTopDiagnoses() {
  return useSWR<DiagnosisStats[]>(`${API_BASE_URL}/api/dashboard/top-diagnoses`, fetcher, {
    refreshInterval: 60000, // Refresh every minute
  })
}

export function useVisitsTrend() {
  return useSWR<VisitTrend[]>(`${API_BASE_URL}/api/dashboard/visits-trend`, fetcher, {
    refreshInterval: 60000, // Refresh every minute
  })
}

export function usePatientsList() {
  return useSWR<PatientList[]>(`${API_BASE_URL}/api/patients-list`, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })
}

export function usePatients() {
  return useSWR<Patient[]>(`${API_BASE_URL}/api/patients`, fetcher)
}

export function usePatient(id: number | null) {
  return useSWR<Patient>(id ? `${API_BASE_URL}/api/patients/${id}` : null, fetcher)
}

export async function createPatient(patientData: Omit<Patient, "id">) {
  console.log("[v0] Creating patient with data:", patientData)

  const response = await fetchWithAuth(`${API_BASE_URL}/api/add-patient`, {
    method: "POST",
    body: JSON.stringify(patientData),
  })

  console.log("[v0] Response status:", response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[v0] Error response:", errorText)
    throw new Error(`Failed to create patient: ${response.status} - ${errorText}`)
  }

  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    return response.json()
  } else {
    // Return text or empty object if no JSON content
    const text = await response.text()
    return text || { success: true }
  }
}

export async function updatePatient(id: number, patientData: Partial<Patient>) {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/update-patient/${id}`, {
    method: "PUT",
    body: JSON.stringify(patientData),
  })

  if (!response.ok) {
    throw new Error("Failed to update patient")
  }

  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    return response.json()
  } else {
    const text = await response.text()
    return text || { success: true }
  }
}

export async function deletePatient(id: number) {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/delete-patient/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete patient")
  }

  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    return response.json()
  } else {
    const text = await response.text()
    return text || { success: true }
  }
}

export async function importPatients(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetchWithAuth(`${API_BASE_URL}/api/patients/import`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Failed to import patients")
  }

  return response.text()
}

export async function exportPatients() {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/patients/export`)

  if (!response.ok) {
    throw new Error("Failed to export patients")
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "patients.csv"
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}