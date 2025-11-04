import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { Track } from "@prisma/client";
import TrackList from "./components/TrackList";

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

export default async function TracksPage() {
    const tracks = await prisma.track.findMany({
        include: {
          _count: {
            select: {
              students: true,
              events: true,
            },
          },
          leadership: {
            include: {
              lead: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
              coLead: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }) as TrackWithDetails[]
    return (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Learning Tracks
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Browse and enroll in available learning tracks
                  </p>
                </div>
              </div>
            </div>
          </header>
    
          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Suspense allows the page to render while TrackList loads */}
            <Suspense fallback={<LoadingState />}>
              <TrackList initialTracks={tracks} />
            </Suspense>
          </main>
        </div>
      )
}

function LoadingState() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow p-6 animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    )
  }