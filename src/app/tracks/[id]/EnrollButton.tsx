"use client"
import { useRouter } from "next/router"
import { useState } from "react"

interface EnrollButtonProps {
    trackId: string
    trackName: string
    initialIsEnrolled: boolean
}

export default function EnrollButton({
    trackId,
    trackName,
    initialIsEnrolled
}: EnrollButtonProps) {
    const router = useRouter()
    const [isEnrolled, setIsEnrolled] = useState(initialIsEnrolled)
    const [isLoading, setIsLoading] = useState(false)

    const handleEnrollmentToggle = async () => {
        try {
            const method = isEnrolled ? "DELETE" : "POST"
            const response = await fetch(`/api/tracks/${trackId}/enroll`, {
                method
            })

            const data = await response.json()
            if (response.ok) {
                setIsEnrolled(!isEnrolled)
                //router.refresh() // Refresh server data
              } else {
                alert(data.error || `Failed to ${isEnrolled ? "unenroll" : "enroll"}`)
              }
        } catch (error) {
            console.error("Enrollment error:", error)
            alert(`Failed to ${isEnrolled ? "unenroll from" : "enroll in"} ${trackName}`)
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <button
          onClick={handleEnrollmentToggle}
          disabled={isLoading}
          className={`px-8 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
            isEnrolled
              ? "bg-gray-600 text-white hover:bg-gray-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isLoading
            ? isEnrolled
              ? "Unenrolling..."
              : "Enrolling..."
            : isEnrolled
            ? "Enrolled ✓"
            : "Enroll Now"}
        </button>
      )
}