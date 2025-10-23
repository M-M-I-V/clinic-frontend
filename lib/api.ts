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

export interface Visit {
  id: number
  fullName: string
  birthDate: string
  visitDate: string
  visitType: string
  chiefComplaint: string
  temperature?: number
  bloodPressure?: string
  pulseRate?: number
  respiratoryRate?: number
  spo2?: number
  history?: string
  symptoms?: string
  physicalExamFindings?: string
  diagnosis?: string
  plan?: string
  treatment?: string
  // Medical visit specific fields
  hama?: string
  referralForm?: string
  medicalChartImage?: string
  // Dental visit specific fields
  dentalChartImage?: string
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

export interface UserList {
  id: number
  username: string
  role: string
}

export interface User {
  id: number
  username: string
  password?: string
  role: string
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

export function useVisits() {
  return useSWR<Visit[]>(`${API_BASE_URL}/api/visits-list`, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })
}

export function usePatientVisits(patientId: number | null) {
  return useSWR<Visit[]>(patientId ? `${API_BASE_URL}/api/visits-list/patient/${patientId}` : null, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
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

export async function getVisit(id: number) {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/visits/${id}`)

  if (!response.ok) {
    throw new Error("Failed to fetch visit")
  }

  return response.json()
}

export async function updateVisit(id: number, visitData: Partial<Visit>) {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/visits/${id}`, {
    method: "PUT",
    body: JSON.stringify(visitData),
  })

  if (!response.ok) {
    throw new Error("Failed to update visit")
  }

  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    return response.json()
  } else {
    const text = await response.text()
    return text || { success: true }
  }
}

export async function deleteVisit(id: number) {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/visits/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete visit")
  }

  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    return response.json()
  } else {
    const text = await response.text()
    return text || { success: true }
  }
}

export async function createMedicalVisit(data: {
  patientId: string
  visitDate: string
  chiefComplaint: string
  temperature?: string
  bloodPressure?: string
  pulseRate?: string
  respiratoryRate?: string
  spo2?: string
  history?: string
  symptoms?: string
  physicalExamFindings?: string
  diagnosis?: string
  plan?: string
  treatment?: string
  hama?: string
  referralForm?: string
  medicalChartImage?: File | null
}) {
  const formData = new FormData()
  formData.append("patientId", data.patientId)
  formData.append("visitDate", data.visitDate)
  formData.append("visitType", "MEDICAL")
  formData.append("chiefComplaint", data.chiefComplaint)
  formData.append("temperature", data.temperature || "")
  formData.append("bloodPressure", data.bloodPressure || "")
  formData.append("pulseRate", data.pulseRate || "")
  formData.append("respiratoryRate", data.respiratoryRate || "")
  formData.append("spo2", data.spo2 || "")
  formData.append("history", data.history || "")
  formData.append("symptoms", data.symptoms || "")
  formData.append("physicalExamFindings", data.physicalExamFindings || "")
  formData.append("diagnosis", data.diagnosis || "")
  formData.append("plan", data.plan || "")
  formData.append("treatment", data.treatment || "")
  formData.append("hama", data.hama || "")
  formData.append("referralForm", data.referralForm || "")

  if (data.medicalChartImage) {
    formData.append("multipartFile", data.medicalChartImage)
  }

  const response = await fetchWithAuth(`${API_BASE_URL}/api/visits/medical/add`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Failed to create medical visit")
  }

  return response.text()
}

export async function getMedicalVisit(id: number) {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/visits/medical/${id}`)

  if (!response.ok) {
    throw new Error("Failed to fetch medical visit")
  }

  return response.json()
}

export async function getDentalVisit(id: number) {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/visits/dental/${id}`)

  if (!response.ok) {
    throw new Error("Failed to fetch dental visit")
  }

  return response.json()
}

export async function deleteMedicalVisit(id: number) {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/visits/medical/delete/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete medical visit")
  }

  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    return response.json()
  } else {
    const text = await response.text()
    return text || { success: true }
  }
}

export async function deleteDentalVisit(id: number) {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/visits/dental/delete/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete dental visit")
  }

  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    return response.json()
  } else {
    const text = await response.text()
    return text || { success: true }
  }
}

export async function createDentalVisit(data: {
  patientId: string
  visitDate: string
  chiefComplaint: string
  temperature?: string
  bloodPressure?: string
  pulseRate?: string
  respiratoryRate?: string
  spo2?: string
  history?: string
  symptoms?: string
  physicalExamFindings?: string
  diagnosis?: string
  plan?: string
  treatment?: string
  dentalChartImage?: File | null
}) {
  const formData = new FormData()
  formData.append("patientId", data.patientId)
  formData.append("visitDate", data.visitDate)
  formData.append("visitType", "DENTAL")
  formData.append("chiefComplaint", data.chiefComplaint)
  formData.append("temperature", data.temperature || "")
  formData.append("bloodPressure", data.bloodPressure || "")
  formData.append("pulseRate", data.pulseRate || "")
  formData.append("respiratoryRate", data.respiratoryRate || "")
  formData.append("spo2", data.spo2 || "")
  formData.append("history", data.history || "")
  formData.append("symptoms", data.symptoms || "")
  formData.append("physicalExamFindings", data.physicalExamFindings || "")
  formData.append("diagnosis", data.diagnosis || "")
  formData.append("plan", data.plan || "")
  formData.append("treatment", data.treatment || "")

  if (data.dentalChartImage) {
    formData.append("multipartFile", data.dentalChartImage)
  }

  const response = await fetchWithAuth(`${API_BASE_URL}/api/visits/dental/add`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Failed to create dental visit")
  }

  return response.text()
}

export async function updateMedicalVisit(
  id: number,
  data: {
    patientId: string
    visitDate: string
    chiefComplaint: string
    temperature?: string
    bloodPressure?: string
    pulseRate?: string
    respiratoryRate?: string
    spo2?: string
    history?: string
    symptoms?: string
    physicalExamFindings?: string
    diagnosis?: string
    plan?: string
    treatment?: string
    hama?: string
    referralForm?: string
    medicalChartImage?: File | null
  },
) {
  const formData = new FormData()
  formData.append("patientId", data.patientId)
  formData.append("visitDate", data.visitDate)
  formData.append("visitType", "MEDICAL")
  formData.append("chiefComplaint", data.chiefComplaint)
  formData.append("temperature", data.temperature || "")
  formData.append("bloodPressure", data.bloodPressure || "")
  formData.append("pulseRate", data.pulseRate || "")
  formData.append("respiratoryRate", data.respiratoryRate || "")
  formData.append("spo2", data.spo2 || "")
  formData.append("history", data.history || "")
  formData.append("symptoms", data.symptoms || "")
  formData.append("physicalExamFindings", data.physicalExamFindings || "")
  formData.append("diagnosis", data.diagnosis || "")
  formData.append("plan", data.plan || "")
  formData.append("treatment", data.treatment || "")
  formData.append("hama", data.hama || "")
  formData.append("referralForm", data.referralForm || "")

  if (data.medicalChartImage) {
    formData.append("multipartFile", data.medicalChartImage)
  } else {
    formData.append("multipartFile", new File([], ""))
  }

  const response = await fetchWithAuth(`${API_BASE_URL}/api/visits/medical/update/${id}`, {
    method: "PUT",
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Failed to update medical visit")
  }

  return response.text()
}

export async function updateDentalVisit(
  id: number,
  data: {
    patientId: string
    visitDate: string
    chiefComplaint: string
    temperature?: string
    bloodPressure?: string
    pulseRate?: string
    respiratoryRate?: string
    spo2?: string
    history?: string
    symptoms?: string
    physicalExamFindings?: string
    diagnosis?: string
    plan?: string
    treatment?: string
    dentalChartImage?: File | null
  },
) {
  const formData = new FormData()
  formData.append("patientId", data.patientId)
  formData.append("visitDate", data.visitDate)
  formData.append("visitType", "DENTAL")
  formData.append("chiefComplaint", data.chiefComplaint)
  formData.append("temperature", data.temperature || "")
  formData.append("bloodPressure", data.bloodPressure || "")
  formData.append("pulseRate", data.pulseRate || "")
  formData.append("respiratoryRate", data.respiratoryRate || "")
  formData.append("spo2", data.spo2 || "")
  formData.append("history", data.history || "")
  formData.append("symptoms", data.symptoms || "")
  formData.append("physicalExamFindings", data.physicalExamFindings || "")
  formData.append("diagnosis", data.diagnosis || "")
  formData.append("plan", data.plan || "")
  formData.append("treatment", data.treatment || "")

  if (data.dentalChartImage) {
    formData.append("multipartFile", data.dentalChartImage)
  } else {
    formData.append("multipartFile", new File([], ""))
  }

  const response = await fetchWithAuth(`${API_BASE_URL}/api/visits/dental/update/${id}`, {
    method: "PUT",
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Failed to update dental visit")
  }

  return response.text()
}

export async function importVisits(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetchWithAuth(`${API_BASE_URL}/api/visits/import`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Failed to import visits")
  }

  return response.text()
}

export async function exportVisits() {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/visits/export`)

  if (!response.ok) {
    throw new Error("Failed to export visits")
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "visits.csv"
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

export function useUsersList() {
  return useSWR<UserList[]>(`${API_BASE_URL}/api/admin/users/list`, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })
}

export async function getUser(id: number) {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/users/${id}`)

  if (!response.ok) {
    throw new Error("Failed to fetch user")
  }

  return response.json()
}

export async function createUser(userData: Omit<User, "id">) {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/users/add`, {
    method: "POST",
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Failed to create user")
  }

  return response.text()
}

export async function updateUser(id: number, userData: Partial<User>) {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/users/update/${id}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Failed to update user")
  }

  return response.text()
}

export async function deleteUser(id: number) {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/users/delete/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete user")
  }

  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    return response.json()
  } else {
    const text = await response.text()
    return text || { success: true }
  }
}