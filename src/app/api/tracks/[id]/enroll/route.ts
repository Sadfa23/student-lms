import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { trackIdSchema } from "@/lib/validations/track.validation";

export async function POST(req: NextRequest, {params}: {params: Promise<{id:string}>}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
              { success: false, error: "Unauthorized - Please sign in" },
              { status: 401 }
            )
          }
        if (session.user.role !== "student") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Only students can enroll in tracks",
                },
                { status: 403 }
            )
        }

        const {id: trackId} = await params
        if (!trackId || !isValidUUID(trackId)) {
            return NextResponse.json(
              {
                success: false,
                error: "Invalid track ID format",
              },
              { status: 400 }
            )
          }

        const track = await prisma.track.findUnique({
            where: { id: trackId },
            select: {
              id: true,
              name: true,
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
        // Check if already enrolled
    const existingEnrollment = await prisma.studentTrack.findUnique({
        where: {
          studentId_trackId: {
            studentId: session.user.id,
            trackId: trackId,
          },
        },
      })
  
      if (existingEnrollment) {
        return NextResponse.json(
          {
            success: false,
            error: "You are already enrolled in this track",
          },
          { status: 400 }
        )
      }
  
      // Create enrollment
      const enrollment = await prisma.studentTrack.create({
        data: {
          studentId: session.user.id,
          trackId: trackId,
        },
        include: {
          track: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      })
  
      return NextResponse.json(
        {
          success: true,
          message: `Successfully enrolled in ${track.name}`,
          data: enrollment,
        },
        { status: 201 }
      )
    } catch (error) {
        // Handle unique constraint violation (shouldn't happen due to check above)
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2002") {
          return NextResponse.json(
            {
              success: false,
              error: "You are already enrolled in this track",
            },
            { status: 400 }
          )
    }
    return NextResponse.json(
        {
          success: false,
          error: "Failed to enroll in track",
        },
        { status: 500 }
      )
  }
}
// This is for unenrolling
export async function DELETE(req: NextRequest, {params}:{params: Promise<{id: string}>}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({
                success: false, error: "Unauthorized - Please sign in"
            },
            {status: 401}
        )
        }

        if (session.user.role !== "student") {
            return NextResponse.json({
                success: false,
                error: "Only students can unenroll from tracks",
            },
            {status: 403}
        )
        }
        const {id: trackId} = await params
        if(!trackId || isValidUUID(trackId)) {
            return NextResponse.json({
                success: false,
                error: "Invalid track ID format"
            })
        }
        // Check enrollment
        const enrollment = await prisma.studentTrack.findUnique({
            where: {
                studentId_trackId: {
                    studentId: session.user.id,
                    trackId: trackId,
                }
            },
            include: {
                track: {
                    select: {
                        name: true
                    }
                }
            }
        })
        if (!enrollment) {
            return NextResponse.json({
                success: false,
                error: "You are not enrolled in this track",
            }, {status: 400})
        }
        // Delete enrollment
        await prisma.studentTrack.delete({
            where: {
                studentId_trackId: {
                    studentId: session.user.id,
                    trackId: trackId
                }
            }
        })
        return NextResponse.json({
            success: true,
            message: `Successfully unenrolled from ${enrollment.track.name}`,
        })
    } catch (error) {
        console.error("DELETE /api/tracks/[id]/enroll error:", error)
        return NextResponse.json(
        {
            success: false,
            error: "Failed to unenroll from track",
        },
        { status: 500 }
    )
    }
}

export async function GET(req:NextRequest, {params}: {params: Promise<{id: string}>}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({
                success: false, error: "Unauthorized - Please sign in"
            },
            {status: 401}
        )
        }

        const {id: trackId} = await params;
        if (!trackId || !isValidUUID(trackId)) {
            return NextResponse.json(
              {
                success: false,
                error: "Invalid track ID format",
              },
              { status: 400 }
            )
          }
        // Check enrollment
    const enrollment = await prisma.studentTrack.findUnique({
        where: {
          studentId_trackId: {
            studentId: session.user.id,
            trackId: trackId,
          },
        },
        select: {
          id: true,
          joinedAt: true,
        },
      })
  
      return NextResponse.json({
        success: true,
        data: {
          isEnrolled: !!enrollment,
          enrollment: enrollment,
        },
      })
    } catch (error) {
        console.error("GET /api/tracks/[id]/enroll error:", error)
        return NextResponse.json(
        {
            success: false,
            error: "Failed to check enrollment status",
        },
        { status: 500 }
        )
    }
}
function isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
}