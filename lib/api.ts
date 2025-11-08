const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://errand-management-system.onrender.com/api/v1"

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface UserInfo {
  id: number
  email: string
  first_name: string
  last_name: string
}

export interface Task {
  task_type: string
  details: string
  description: string
}

export interface ServiceRequest {
  details: string
  tasks: Task[]
}

export interface SubmitRequestsPayload {
  requests: ServiceRequest[]
}

function extractToken(response: AuthResponse): string {
  const token = response.access_token
  if (!token) {
    throw new Error("No access token in response")
  }
  return token
}

// Auth APIs
export const authAPI = {
  login: async (data: LoginRequest): Promise<{ token: string; user: UserInfo }> => {
    const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Login failed")
    }

    const authResponse: AuthResponse = await response.json()
    const token = extractToken(authResponse)

    const userInfo = await authAPI.getCurrentUser(token)

    return { token, user: userInfo }
  },

  register: async (data: RegisterRequest): Promise<{ token: string; user: UserInfo }> => {
    const response = await fetch(`${API_BASE_URL}/accounts/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Registration failed")
    }

    const authResponse: AuthResponse = await response.json()
    const token = extractToken(authResponse)

    const userInfo = await authAPI.getCurrentUser(token)

    return { token, user: userInfo }
  },

  getCurrentUser: async (token: string): Promise<UserInfo> => {
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to fetch user info")
    }

    return await response.json()
  },
}

export const requestAPI = {
  submitRequests: async (token: string | null, customerId: number, payload: SubmitRequestsPayload): Promise<any> => {
    const cleanToken = token && typeof token === "string" ? token.trim() : null

    if (!cleanToken || cleanToken === "undefined" || cleanToken.length === 0) {
      throw new Error("Authentication token is missing or invalid")
    }

    const results = []

    for (const request of payload.requests) {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cleanToken}`,
      }

      const response = await fetch(`${API_BASE_URL}/customers/${customerId}/customer-requests/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          details: request.details,
          tasks: request.tasks,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.detail || `Request submission failed: ${response.statusText}`)
      }

      results.push(await response.json())
    }

    return results
  },
}
