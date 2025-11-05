"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type TrackWithDetails = {
  id: string
  name: string
  description: string | null
  _count: {
    students: number
    events: number
  }
  leadership: Array<{
    lead: {
      id: string
      name: string
      email: string
      image: string | null
    }
    coLead: {
      id: string
      name: string
      email: string
      image: string | null
    } | null
  }>
}

interface TrackCardProps {
  track: TrackWithDetails
}


export default function TrackCard({ track }: TrackCardProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const [isEnrolled, setIsEnrolled] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(true)
  
    const leadInfo = track.leadership[0]
  
    // Check enrollment status on mount
    useEffect(() => {
      const checkEnrollment = async () => {
        if (!session || session.user.role !== "student") {
          setIsCheckingEnrollment(false)
          return
        }
  
        try {
          const response = await fetch(`/api/tracks/${track.id}/enroll`)
          if (response.ok) {
            const data = await response.json()
            setIsEnrolled(data.data.isEnrolled)
          }
        } catch (error) {
          console.error("Failed to check enrollment:", error)
        } finally {
          setIsCheckingEnrollment(false)
        }
      }
  
      checkEnrollment()
    }, [session, track.id])
  
    const handleEnrollmentToggle = async () => {
      if (!session) {
        router.push(`/auth/signin?callbackUrl=/tracks`)
        return
      }
  
      setIsLoading(true)
  
      try {
        const method = isEnrolled ? "DELETE" : "POST"
        const response = await fetch(`/api/tracks/${track.id}/enroll`, {
          method,
        })
  
        const data = await response.json()
  
        if (response.ok) {
          setIsEnrolled(!isEnrolled)
          router.refresh() // Refresh to update student count
        } else {
          alert(data.error || `Failed to ${isEnrolled ? "unenroll" : "enroll"}`)
        }
      } catch (error) {
        console.error("Enrollment error:", error)
        alert(`Failed to ${isEnrolled ? "unenroll from" : "enroll in"} track`)
      } finally {
        setIsLoading(false)
      }
    }
  
    return (
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {track.name}
          </h3>
  
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {track.description || "No description available"}
          </p>
  
          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>{track._count.students} students</span>
            </div>
  
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{track._count.events} events</span>
            </div>
          </div>
  
          {/* Track Lead */}
          {leadInfo && (
            <div className="flex items-center gap-2 mb-4">
              {leadInfo.lead.image ? (
                <Image
                  src={leadInfo.lead.image}
                  alt={leadInfo.lead.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-800">
                    {leadInfo.lead.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-600">
                Led by {leadInfo.lead.name}
              </span>
            </div>
          )}
        </div>
  
        {/* Card Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex gap-3">
          <Link
            href={`/tracks/${track.id}`}
            className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            View Details
          </Link>
  
          {session?.user.role === "student" && (
            <button
              onClick={handleEnrollmentToggle}
              disabled={isLoading || isCheckingEnrollment}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                isEnrolled
                  ? "bg-gray-600 text-white hover:bg-gray-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isCheckingEnrollment
                ? "..."
                : isLoading
                ? isEnrolled
                  ? "Unenrolling..."
                  : "Enrolling..."
                : isEnrolled
                ? "Enrolled ✓"
                : "Enroll"}
            </button>
          )}
        </div>
      </div>
    )
  }