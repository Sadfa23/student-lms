import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url)
      const trackId = searchParams.get("trackId")
      const upcoming = searchParams.get("upcoming") === "true"
      const limit = searchParams.get("limit")
  
      // Build where clause
      const whereClause: Record<string, unknown> = {}
  
      // Filter by track
      if (trackId) {
        whereClause.trackId = trackId
      }
  
      // Filter by date (upcoming or past)
      if (upcoming) {
        whereClause.eventDate = { gte: new Date() }
      }
  
      // Fetch events
      const events = await prisma.event.findMany({
        where: whereClause,
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
          eventDate: upcoming ? "asc" : "desc",
        },
        take: limit ? parseInt(limit) : undefined,
      })
  
      return NextResponse.json({
        success: true,
        data: events,
        count: events.length,
      })
    } catch (error) {
      console.error("GET /api/events error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch events",
        },
        { status: 500 }
      )
    }
  }