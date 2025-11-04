"use client"

import { useState, useMemo } from "react"
import EventCard from "./EventCard"

interface Event {
  id: string
  title: string
  description: string | null
  eventDate: Date
  location: string | null
  trackId: string
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

interface EventListProps {
  events: Event[]
  enrolledTrackIds: string[]
  userRole: string
}

export default function EventList({ events, enrolledTrackIds, userRole }: EventListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTrack, setSelectedTrack] = useState<string>("all")
  const [showUpcoming, setShowUpcoming] = useState(true)

  // Get unique tracks for filter dropdown
  const tracks = useMemo(() => {
    const trackMap = new Map()
    events.forEach(event => {
      if (!trackMap.has(event.trackId)) {
        trackMap.set(event.trackId, event.track)
      }
    })
    return Array.from(trackMap.values())
  }, [events])

  // Filter and search logic
  const filteredEvents = useMemo(() => {
    const now = new Date()
    
    return events.filter(event => {
      // Search filter
      const matchesSearch = 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.track.name.toLowerCase().includes(searchQuery.toLowerCase())

      // Track filter
      const matchesTrack = 
        selectedTrack === "all" ? true :
        selectedTrack === "my-tracks" ? enrolledTrackIds.includes(event.trackId) :
        event.trackId === selectedTrack

      // Date filter
      const eventDate = new Date(event.eventDate)
      const matchesDate = showUpcoming ? eventDate >= now : eventDate < now

      return matchesSearch && matchesTrack && matchesDate
    })
  }, [events, searchQuery, selectedTrack, showUpcoming, enrolledTrackIds])

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Events
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by title, description, or track..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Track Filter */}
          <div>
            <label htmlFor="track" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Track
            </label>
            <select
              id="track"
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tracks</option>
              {enrolledTrackIds.length > 0 && (
                <option value="my-tracks">My Tracks Only</option>
              )}
              {tracks.map(track => (
                <option key={track.id} value={track.id}>
                  {track.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time Filter */}
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
              Show Events
            </label>
            <select
              id="time"
              value={showUpcoming ? "upcoming" : "past"}
              onChange={(e) => setShowUpcoming(e.target.value === "upcoming")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="upcoming">Upcoming Events</option>
              <option value="past">Past Events</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Found {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
        </p>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or search query
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}