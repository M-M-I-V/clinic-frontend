// Utility functions for authentication

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

export const setAuthToken = (token: string): void => {
  if (typeof window === "undefined") return
  localStorage.setItem("authToken", token)
}

export const removeAuthToken = (): void => {
  if (typeof window === "undefined") return
  localStorage.removeItem("authToken")
}

export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
}

// Function to make authenticated API requests
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken()

  if (!token) {
    throw new Error("No authentication token found")
  }

  const headers: HeadersInit = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  }

  // Only set Content-Type to application/json if not already set and body is not FormData
  if (!(options.body instanceof FormData) && !options.headers?.hasOwnProperty("Content-Type")) {
    ;(headers as Record<string, string>)["Content-Type"] = "application/json"
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  return response
}