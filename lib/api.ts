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