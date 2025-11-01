"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (!session) {
      // Not authenticated, redirect to sign in
      router.push("/auth/signin")
      return
    }

    // Check if user has required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
      // User doesn't have permission, redirect to dashboard
      router.push("/dashboard")
    }
  }, [session, status, router, allowedRoles])

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing if not authenticated (will redirect)
  if (!session) {
    return null
  }

  // Check role authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
    return null
  }

  // User is authenticated and authorized
  return <>{children}</>
}