"use client"

import { useAuth } from "@/lib/auth-context"
import { AuthForm } from "@/components/auth-form"
import { RequestForm } from "@/components/request-form"

export default function Home() {
  const { user, isLoading, logout } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return user ? <RequestForm onLogout={logout} /> : <AuthForm />
}
