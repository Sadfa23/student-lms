"use client"

import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow, format, isPast } from "date-fns"

interface EventCardProps {
  event: {
    id: string
    title: string
    description: string | null
    eventDate: Date
    location: string | null
    track: {
      id: string
      name: string
    }
    postedBy: {
      id: string
      name: string
      image: string | null
    }
    _count: {
      media: number
    }
  }
}

export default function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.eventDate)
  const isEventPast = isPast(eventDate)

  // Format date for display
  const formattedDate = format(eventDate, "MMM d, yyyy")
  const formattedTime = format(eventDate, "h:mm a")
  const relativeTime = formatDistanceToNow(eventDate, { addSuffix: true })

  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden h-full flex flex-col">
        {/* Event Status Badge */}
        <div className="px-4 pt-4">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isEventPast
                ? "bg-gray-100 text-gray-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {isEventPast ? "Past Event" : "Upcoming"}
          </span>
        </div>

        {/* Event Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {event.title}
          </h3>

          {/* Track Badge */}
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {event.track.name}
            </span>
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {event.description}
            </p>
          )}

          {/* Event Details */}
          <div className="mt-auto space-y-2">
            {/* Date and Time */}
            <div className="flex items-center text-sm text-gray-500">
              <svg
                className="h-4 w-4 mr-2 text-gray-400"
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
              <span>{formattedDate} at {formattedTime}</span>
            </div>

            {/* Relative Time */}
            <div className="text-xs text-gray-500">
              {relativeTime}
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-center text-sm text-gray-500">
                <svg
                  className="h-4 w-4 mr-2 text-gray-400"
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
                <span className="truncate">{event.location}</span>
              </div>
            )}

            {/* Media Count */}
            {event._count.media > 0 && (
              <div className="flex items-center text-sm text-gray-500">
                <svg
                  className="h-4 w-4 mr-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{event._count.media} {event._count.media === 1 ? 'photo' : 'photos'}</span>
              </div>
            )}
          </div>

          {/* Posted By */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center">
              {event.postedBy.image ? (
                <Image
                  src={event.postedBy.image}
                  alt={event.postedBy.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {event.postedBy.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="ml-2 text-sm text-gray-600">
                Posted by {event.postedBy.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}