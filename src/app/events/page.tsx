import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import EventList from "./components/EventList"

export default async function EventsPage() {
  // Get authenticated user
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/auth/signin")
  }

  // Fetch all events with related data
  const events = await prisma.event.findMany({
    include: {
      track: {
        select: {
          id: true,
          name: true,
        },
      },
      poster: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          media: true,
        },
      },
    },
    orderBy: {
      eventDate: 'desc',
    },
  })

  // Fetch user's enrolled tracks for filtering
  const userTracks = await prisma.studentTrack.findMany({
    where: {
      studentId: session.user.id,
    },
    select: {
      trackId: true,
    },
  })

  const enrolledTrackIds = userTracks.map(t => t.trackId)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="mt-2 text-gray-600">
            Discover upcoming events and view past activities from your tracks
          </p>
        </div>

        {/* Pass data to Client Component */}
        <EventList 
          events={events.map(event => ({
            ...event,
            postedBy: event.poster  // Transform poster to postedBy
          }))} 
          enrolledTrackIds={enrolledTrackIds}
          userRole={session.user.role}
        />
      </div>
    </div>
  )
}