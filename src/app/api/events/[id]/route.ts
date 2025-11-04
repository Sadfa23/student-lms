import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { updateEventSchema } from "@/lib/validations/event.validation"
import { z } from "zod"

/**
 * GET /api/events/[id]
 * Get a single event by ID
 * Public endpoint
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid event ID format" },
        { status: 400 }
      )
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        track: {
          select: {
            id: true,
            name: true,
            description: true,
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
          select: {
            id: true,
            mediaType: true,
            cloudinaryUrl: true,
            name: true,
            uploadedAt: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: event,
    })
  } catch (error) {
    console.error("GET /api/events/[id] error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch event" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/events/[id]
 * Update an event
 * Requires authentication and ownership (poster or admin)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please sign in" },
        { status: 401 }
      )
    }

    const { id } = params

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid event ID format" },
        { status: 400 }
      )
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        postedBy: true,
        trackId: true,
      },
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      )
    }

    // Check authorization (must be poster or admin)
    if (session.user.role !== "admin" && event.postedBy !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden - You can only edit your own events" },
        { status: 403 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validatedData = updateEventSchema.parse(body)

    // Convert eventDate string to Date if provided
    const updateData: any = { ...validatedData }
    if (validatedData.eventDate) {
      updateData.eventDate = new Date(validatedData.eventDate)
    }

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        track: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: "Event updated successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error },
        { status: 400 }
      )
    }

    console.error("PUT /api/events/[id] error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update event" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/events/[id]
 * Delete an event
 * Requires authentication and ownership (poster or admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please sign in" },
        { status: 401 }
      )
    }

    const { id } = params

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid event ID format" },
        { status: 400 }
      )
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        postedBy: true,
        title: true,
        track: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      )
    }

    // Check authorization
    if (session.user.role !== "admin" && event.postedBy !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden - You can only delete your own events" },
        { status: 403 }
      )
    }

    // Delete event (will cascade delete media)
    await prisma.event.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: `Event "${event.title}" deleted successfully`,
    })
  } catch (error) {
    console.error("DELETE /api/events/[id] error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete event" },
      { status: 500 }
    )
  }
}

/**
 * Helper function to validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}