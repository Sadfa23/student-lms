import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { createEventSchema } from "@/lib/validations/event.validation"
import { z } from "zod"

/**
 * GET /api/tracks/[id]/events
 * Get all events for a specific track
 * Public endpoint
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: trackId } = await params

    const events = await prisma.event.findMany({
      where: { trackId },
      include: {
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
        eventDate: "asc",
      },
    })

    return NextResponse.json({
      success: true,
      data: events,
      count: events.length,
    })
  } catch (error) {
    console.error("GET /api/tracks/[id]/events error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tracks/[id]/events
 * Create a new event for a track
 * Requires authentication and lead/co-lead/admin role
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please sign in" },
        { status: 401 }
      )
    }

    const { id: trackId } = await params

    // Check if track exists
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: {
        leadership: {
          select: {
            leadId: true,
            coLeadId: true,
          },
        },
      },
    })

    if (!track) {
      return NextResponse.json(
        { success: false, error: "Track not found" },
        { status: 404 }
      )
    }

    // Check authorization (must be lead, co-lead, or admin)
    const isLead = track.leadership.some((l: { leadId: string; coLeadId: string | null }) => l.leadId === session.user.id)
    const isCoLead = track.leadership.some((l: { leadId: string; coLeadId: string | null }) => l.coLeadId === session.user.id)
    const isAdmin = session.user.role === "admin"

    if (!isLead && !isCoLead && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden - Only track leads can create events",
        },
        { status: 403 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validatedData = createEventSchema.parse(body)

    // Ensure trackId matches URL param
    if (validatedData.trackId !== trackId) {
      return NextResponse.json(
        { success: false, error: "Track ID mismatch" },
        { status: 400 }
      )
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        trackId: validatedData.trackId,
        title: validatedData.title,
        description: validatedData.description,
        eventDate: new Date(validatedData.eventDate),
        location: validatedData.location,
        postedBy: session.user.id,
      },
      include: {
        track: {
          select: {
            name: true,
          },
        },
        poster: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: event,
        message: "Event created successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error },
        { status: 400 }
      )
    }

    console.error("POST /api/tracks/[id]/events error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    )
  }
}