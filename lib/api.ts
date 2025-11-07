const API_BASE_URL = "http://209.38.226.88:8008/api/v1"

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
  token: string
  user?: {
    id: number
    email: string
    first_name: string
    last_name: string
  }
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

// Auth APIs
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Login failed")
    }

    return response.json()
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/accounts/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Registration failed")
    }

    return response.json()
  },
}

// Service Request APIs
export const requestAPI = {
  submitRequests: async (token: string, customerId: number, payload: SubmitRequestsPayload): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/customers/${customerId}/customer-requests/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Request submission failed")
    }

    return response.json()
  },
}
