"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (user: User, token: string) => void
  logout: () => void
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUserState(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = (newUser: User, newToken: string) => {
    localStorage.setItem("authToken", newToken)
    localStorage.setItem("user", JSON.stringify(newUser))
    setUserState(newUser)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    setUserState(null)
    setToken(null)
  }

  const setUser = (newUser: User) => {
    localStorage.setItem("user", JSON.stringify(newUser))
    setUserState(newUser)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, setUser }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
