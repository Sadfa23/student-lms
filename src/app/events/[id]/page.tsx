import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import DeleteEventButton from "./deleteEventButton"
import MediaGallery from "../components/MediaGallery"

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/auth/signin")
  }

  const { id } = await params

  // Fetch event with all related data
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      track: {
        include: {
          leadership: {
            include: {
              lead: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              coLead: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
      poster: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      media: {
        orderBy: {
          uploadedAt: 'desc',
        },
      },
    },
  })

  if (!event) {
    notFound()
  }

  // Check if user can edit/delete (owner, track lead/co-lead, or admin)
  const trackLeadership = event.track.leadership[0]
  const canManage =
    session.user.id === event.postedBy ||
    (trackLeadership && session.user.id === trackLeadership.leadId) ||
    (trackLeadership && session.user.id === trackLeadership.coLeadId) ||
    session.user.role === 'admin'

  const eventDate = new Date(event.eventDate)
  const formattedDate = format(eventDate, "EEEE, MMMM d, yyyy")
  const formattedTime = format(eventDate, "h:mm a")

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/events"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Events
        </Link>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {event.title}
                </h1>
                
                {/* Track Badge */}
                <Link
                  href={`/tracks/${event.trackId}`}
                  className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  {event.track.name}
                </Link>
              </div>

              {/* Action Buttons */}
              {canManage && (
                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href={`/events/${event.id}/edit`}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Edit
                  </Link>
                  <DeleteEventButton eventId={event.id} />
                </div>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="p-6 space-y-6">
            {/* Date and Time */}
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-blue-600"
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
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Date & Time</p>
                <p className="text-base text-gray-900">{formattedDate}</p>
                <p className="text-base text-gray-900">{formattedTime}</p>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-base text-gray-900">{event.location}</p>
                </div>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  About this event
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {/* Track Leadership */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Track Leadership
              </h2>
              <div className="flex flex-wrap gap-4">
                {/* Lead */}
                {trackLeadership?.lead && (
                  <div className="flex items-center">
                    {trackLeadership.lead.image ? (
                      <Image
                        src={trackLeadership.lead.image}
                        alt={trackLeadership.lead.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {trackLeadership.lead.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {trackLeadership.lead.name}
                      </p>
                      <p className="text-xs text-gray-500">Track Lead</p>
                    </div>
                  </div>
                )}

                {/* Co-Lead */}
                {trackLeadership?.coLead && (
                  <div className="flex items-center">
                    {trackLeadership.coLead.image ? (
                      <Image
                        src={trackLeadership.coLead.image}
                        alt={trackLeadership.coLead.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {trackLeadership.coLead.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {trackLeadership.coLead.name}
                      </p>
                      <p className="text-xs text-gray-500">Co-Lead</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Media Gallery */}
            {event.media.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Event Photos ({event.media.length})
                </h2>
                <MediaGallery
                  media={event.media.map(m => ({
                    id: m.id,
                    url: m.cloudinaryUrl,
                    type: m.mediaType,
                    uploadedAt: m.uploadedAt
                  }))}
                />
              </div>
            )}

            {/* Posted By */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Posted by</p>
              <div className="flex items-center">
                {event.poster.image ? (
                  <Image
                    src={event.poster.image}
                    alt={event.poster.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-600">
                      {event.poster.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {event.poster.name}
                  </p>
                  <p className="text-sm text-gray-500">{event.poster.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}