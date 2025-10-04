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
  name: string
  studentId?: string
  gender: string
  program: string
  knownDiseases: string
}

export interface Patient {
  id: number
  name: string
  studentId?: string
  gender: string
  program: string
  knownDiseases: string
  dateOfBirth?: string
  contactNumber?: string
  email?: string
  address?: string
  emergencyContact?: string
  emergencyContactNumber?: string
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
  const response = await fetchWithAuth(`${API_BASE_URL}/api/add-patient`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patientData),
  })

  if (!response.ok) {
    throw new Error("Failed to create patient")
  }

  return response.json()
}

export async function updatePatient(id: number, patientData: Partial<Patient>) {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/update-patient/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patientData),
  })

  if (!response.ok) {
    throw new Error("Failed to update patient")
  }

  return response.json()
}

export async function deletePatient(id: number) {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/delete-patient/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete patient")
  }

  return response.json()
}
