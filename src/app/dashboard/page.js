"use client"

import { useSession, signOut } from "next-auth/react"
import ProtectedRoute from "../api/auth/protectedRoute"
import Image from "next/image"

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Student LMS Dashboard
            </h1>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Welcome back, {session?.user?.name}!
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Info Card */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Your Profile
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 text-gray-900">{session?.user?.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Role:</span>
                    <span className="ml-2 text-gray-900 capitalize">{session?.user?.role}</span>
                  </div>
                  {session?.user?.image && (
                    <div>
                      <span className="text-gray-600">Profile Picture:</span>
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        className="ml-2 w-12 h-12 rounded-full inline-block"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {session?.user?.role === "student" && (
                    <>
                      <button className="w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition">
                        Browse Tracks
                      </button>
                      <button className="w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition">
                        My Courses
                      </button>
                    </>
                  )}
                  {(session?.user?.role === "lead" || session?.user?.role === "co-lead") && (
                    <>
                      <button className="w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition">
                        Manage Events
                      </button>
                      <button className="w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition">
                        Post Announcement
                      </button>
                      <button className="w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition">
                        Upload Materials
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Debug Info (Remove in production) */}
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Session Data (Debug):
              </h3>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}