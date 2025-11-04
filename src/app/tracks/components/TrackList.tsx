"use client"

import { useState } from "react"
import TrackCard from "./TrackCard"
import { Track } from "@prisma/client"

type TrackWithDetails = Track & {
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
  
interface TrackListProps {
    initialTracks: TrackWithDetails[]
}

export default function TrackList({initialTracks}: TrackListProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState<"name" | "students">("name")

    const filteredTracks = initialTracks.filter((track) => {
        const searchLower = searchQuery.toLowerCase()
        return (
            track.name.toLowerCase().includes(searchLower) || 
            track.description?.toLocaleLowerCase().includes(searchLower)
        )
    })
    const sortedTracks = [...filteredTracks].sort((a, b)=> {
        if (sortBy === "name") {
            return a.name.localeCompare(b.name) // compares/ sorts alphabetically
        } else {
            return b._count.students - a._count.students
        }
    })
    return (
        <div className="space-y-6">
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <label htmlFor="search" className="sr-only">
                  Search tracks
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search tracks..."
                  />
                </div>
              </div>
    
              {/* Sort Dropdown */}
              <div className="w-full md:w-48">
                <label htmlFor="sort" className="sr-only">
                  Sort by
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "name" | "students")}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="name">Sort by Name</option>
                  <option value="students">Sort by Popularity</option>
                </select>
              </div>
            </div>
    
            {/* Results count */}
            <div className="mt-3 text-sm text-gray-600">
              Showing {sortedTracks.length} of {initialTracks.length} tracks
            </div>
          </div>
    
          {/* Track Grid */}
          {sortedTracks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTracks.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
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
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tracks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search query
              </p>
            </div>
          )}
        </div>
      )
}