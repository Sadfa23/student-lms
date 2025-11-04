import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import z from "zod";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { updateTrackSchema } from "@/lib/validations/track.validation";
import { error } from "console";


function isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }


export async function GET(req: NextRequest, {params}:{params: Promise<{id: string}>}) {
    try {
        const {id} = await params;
        // validating the uuid format
        if (!id || !isValidUUID(id)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid track ID format",
                },
                { status: 400 }
            )
        }

        const track = await prisma.track.findUnique({
            where: {id},
            include: {
                leadership: {
                    include: {
                        lead: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                                role: true
                            }
                        },
                        coLead: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                                role: true
                            }
                        }
                    }
                },
                students: {
                    select: {
                        id: true,
                        joinedAt: true,
                        student: {
                            select:{
                                id: true,
                                name:true,
                                image: true
                            }
                        }
                    },
                    orderBy: {
                        joinedAt: "desc"
                    }
                },
                events: {
                    select: {
                      id: true,
                      title: true,
                      eventDate: true,
                      location: true,
                    },
                    orderBy: {
                      eventDate: "desc",
                    },
                    take: 5, // Only show 5 most recent events
                },
                announcements: {
                    select: {
                      id: true,
                      title: true,
                      createdAt: true,
                      poster: {
                        select: {
                          name: true,
                          image: true,
                        },
                      },
                    },
                    orderBy: {
                      createdAt: "desc",
                    },
                    take: 5,
                },
                _count: {
                    select: {
                        students: true,
                        events: true,
                        announcements: true,
                        courseMaterials: true
                    }
                }
            }
        })

        if (!track) {
            return NextResponse.json(
              {
                success: false,
                error: "Track not found",
              },
              { status: 404 }
            )
          }
        
        return NextResponse.json({
            success: true,
            data: track,
        })
    } catch (error) {
        console.error("GET /api/tracks/[id] error:", error)
        return NextResponse.json(
        {
            success: false,
            error: "Failed to fetch track",
        },
        { status: 500 }
    )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      // Check authentication
      const session = await getServerSession(authOptions)

      if (!session) {
        return NextResponse.json(
          { success: false, error: "Unauthorized - Please sign in" },
          { status: 401 }
        )
      }

      // Check if user is admin
      if (session.user.role !== "admin") {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden - Only admins can update tracks"
          },
          { status: 403 }
        )
      }

      const { id } = await params

      // Validate UUID format
      if (!id || !isValidUUID(id)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid track ID format",
          },
          { status: 400 }
        )
      }
  
      // Parse and validate request body
      const body = await request.json()
      const validatedData = updateTrackSchema.parse(body)
  
      // Check if track exists
      const existingTrack = await prisma.track.findUnique({
        where: { id },
      })
  
      if (!existingTrack) {
        return NextResponse.json(
          {
            success: false,
            error: "Track not found",
          },
          { status: 404 }
        )
      }
  
      // If updating name, check if new name is already taken by another track
      if (validatedData.name && validatedData.name !== existingTrack.name) {
        const nameConflict = await prisma.track.findUnique({
          where: { name: validatedData.name },
        })
  
        if (nameConflict) {
          return NextResponse.json(
            {
              success: false,
              error: "A track with this name already exists",
            },
            { status: 400 }
          )
        }
      }
  
      // Update the track
      const updatedTrack = await prisma.track.update({
        where: { id },
        data: validatedData,
        include: {
          _count: {
            select: {
              students: true,
              events: true,
            },
          },
        },
      })
  
      return NextResponse.json({
        success: true,
        data: updatedTrack,
        message: "Track updated successfully",
      })
    } catch (error) {
      // Handle validation errors
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation error",
            details: error,
          },
          { status: 400 }
        )
      }
  
      console.error("PUT /api/tracks/[id] error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update track",
        },
        { status: 500 }
      )
    }
  }
export async function DELETE(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
    try {
        const session =await  getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({
                success: false,
                error: "Unauthorized, please sign in"
        },
        {status: 401})
        }
        if (session.user.role !== "admin") {
            return NextResponse.json(
                {
                  success: false,
                  error: "Forbidden - Only admins can delete tracks" 
                },
                { status: 403 }
              )
        }
        const {id} = await params
        if (!id || !isValidUUID(id)) {
            return NextResponse.json(
              {
                success: false,
                error: "Invalid track ID format",
              },
              { status: 400 }
            )
          }
        
        // Check if track exists and get stats
    const track = await prisma.track.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              students: true,
              events: true,
              announcements: true,
              courseMaterials: true,
            },
          },
        },
      })
  
      if (!track) {
        return NextResponse.json(
          {
            success: false,
            error: "Track not found",
          },
          { status: 404 }
        )
      }
         // Optional: Warn if track has students enrolled
    // (You might want to prevent deletion in this case)
    if (track._count.students > 0) {
        // Uncomment to prevent deletion:
        // return NextResponse.json(
        //   {
        //     success: false,
        //     error: `Cannot delete track with ${track._count.students} enrolled students`,
        //   },
        //   { status: 400 }
        // )
      }
        await prisma.track.delete({
            where: { id },
          })
        return NextResponse.json({
            success: true,
            message: "Track deleted successfully",
            deletedTrack: {
              id: track.id,
              name: track.name,
              studentsAffected: track._count.students,
            },
          })
    } catch (error) {
        console.error("DELETE /api/tracks/[id] error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete track",
      },
      { status: 500 }
    )
    }
}