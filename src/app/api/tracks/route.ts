import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createTrackSchema } from "@/lib/validations/track.validation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { success, z }from "zod";
import { count, error } from "console";


export async function GET(req: NextRequest) {
    try {
        // Get search parameters from url
        const {searchParams} = new URL(req.url)
        const search = searchParams.get("search") // optional search query

        // Build where clause for search
        const whereClause = search
  ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }
  : {}
    // Fetch tracks from database
    const tracks = await prisma.track.findMany({
        where: whereClause,
        include: {
            _count: {
                select: {
                    students: true,
                    events: true
                },
            },
            leadership: {
                include: {
                    lead: {
                        select: {
                            id:true,
                            name: true,
                            email:true,
                            image: true
                        }
                    },
                    coLead: {
                        select: {
                            id:true,
                            name: true,
                            email:true,
                            image: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    })
    return NextResponse.json({
        success: true,
        data: tracks,
        count: tracks.length
    })
    } catch (error) {
        console.error("GET /api/tracks error:", error)
        return NextResponse.json(
            {
                success:false,
                error:"Failed to fetch tracks"
            },
            {status: 500}
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json(
                {success: false, error: "Unathorized - Please sign in"},
                { status: 401 }
            )
        }
        // Check if user is admin
        if (session.user.role !== "admin") {
            return NextResponse.json({
                success: false,
                error: "Forbidden: Only admins can create tracks"
            },
            {status: 403}
        )}
        const body = await req.json()
        const validatedData = createTrackSchema.parse(body)
        // Checking if track already exists
        const existingTrack = await prisma.track.findUnique({
            where: {name: validatedData.name}
        })
        if (existingTrack) {
            return NextResponse.json({
                success: false, 
                error: "A track with this name already exists" 
            },
            {status: 400}
        )}
        // Create the track
        const track = await prisma.track.create({
            data: {
                name: validatedData.name,
                description : validatedData.description
            },
            include : {
                _count : {
                    select: {
                        students: true,
                        events: true
                    }
                }
            }
        })
        return NextResponse.json(
            {
              success: true,
              data: track,
              message: "Track created successfully",
            },
            { status: 201 })
    } catch (error) {
        // Handling validation errors
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Validation error",
                    details: error,
                },
                {status: 400}
            )
        }
        console.error("POST /api/tracks error:", error)
        return NextResponse.json(
            {
                success: false,
                error: "Failed to create track",
            },
            { status: 500 }
        )
    }
}

