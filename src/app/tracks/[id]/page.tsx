import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import EnrollButton from "./EnrollButton";

export default async function TrackDetailPage({params}:{params: {id: string}}) {
    const session = await getServerSession(authOptions)
    const track = await prisma.track.findUnique({
        where: {id: params.id},
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
                take: 12, // Show first
                select: {
                    id: true,
                    joinedAt:true,
                    student: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        }
                    },
                },
                orderBy: {
                    joinedAt: "desc"
                }
            },
            events: {
                take: 5,
                where: {
                    eventDate: {
                        gte: new Date(),
                    }
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    eventDate: true,
                    location: true,
                    poster: {
                        select: {
                            name: true,
                            image: true,
                        }
                    }
                },
                orderBy: {
                    eventDate: "asc"
                }
            },
            announcements:  {
                take: 3,
                select: {
                    id: true,
                    title: true,
                    content: true,
                    createdAt: true,
                    poster: {
                        select: {
                            name: true,
                            image: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
            _count: {
                select: {
                    students: true,
                    events: true,
                    announcements: true,
                    courseMaterials: true,
                }
            }
        }
    })

    if (!track) {
        notFound()
    }

    let isEnrolled = false
    if (session && session.user.role === "student") {
        const enrollemt = await prisma.studentTrack.findUnique({
            where: {
                studentId_trackId: {
                  studentId: session.user.id,
                  trackId: params.id,
                },
              },
        })
        isEnrolled = !!enrollemt
    }
    const leadInfo = track.leadership[0]

    return (
        <div className="min-h-screen bg-gray-50">
          {/* Hero Section */}
          <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Breadcrumb */}
              <nav className="flex mb-4" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm">
                  <li>
                    <Link href="/tracks" className="text-gray-500 hover:text-gray-700">
                      Tracks
                    </Link>
                  </li>
                  <li>
                    <span className="text-gray-400 mx-2">/</span>
                  </li>
                  <li className="text-gray-900 font-medium">{track.name}</li>
                </ol>
              </nav>
    
              <div className="md:flex md:items-start md:justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    {track.name}
                  </h1>
                  <p className="text-lg text-gray-600 mb-6">
                    {track.description || "No description available"}
                  </p>
    
                  {/* Stats */}
                  <div className="flex flex-wrap gap-6 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span className="font-medium">{track._count.students}</span>
                      <span>students</span>
                    </div>
    
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        className="w-5 h-5"
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
                      <span className="font-medium">{track._count.events}</span>
                      <span>events</span>
                    </div>
    
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      <span className="font-medium">{track._count.announcements}</span>
                      <span>announcements</span>
                    </div>
    
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="font-medium">{track._count.courseMaterials}</span>
                      <span>materials</span>
                    </div>
                  </div>
                </div>
    
                {/* Enrollment Button */}
                {session?.user.role === "student" && (
                  <div className="mt-4 md:mt-0 md:ml-6">
                    <EnrollButton
                      trackId={track.id}
                      trackName={track.name}
                      initialIsEnrolled={isEnrolled}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
    
          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Leadership Section */}
                {leadInfo && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Track Leadership
                    </h2>
                    <div className="space-y-4">
                      {/* Lead */}
                      <div className="flex items-center gap-4">
                        {leadInfo.lead.image ? (
                          <Image
                            src={leadInfo.lead.image}
                            alt={leadInfo.lead.name}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-lg font-medium text-blue-800">
                              {leadInfo.lead.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {leadInfo.lead.name}
                          </p>
                          <p className="text-sm text-gray-500">Track Lead</p>
                        </div>
                      </div>
    
                      {/* Co-Lead */}
                      {leadInfo.coLead && (
                        <div className="flex items-center gap-4">
                          {leadInfo.coLead.image ? (
                            <Image
                              src={leadInfo.coLead.image}
                              alt={leadInfo.coLead.name}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-lg font-medium text-green-800">
                                {leadInfo.coLead.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {leadInfo.coLead.name}
                            </p>
                            <p className="text-sm text-gray-500">Co-Lead</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
    
                {/* Upcoming Events */}
                {track.events.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Upcoming Events
                    </h2>
                    <div className="space-y-4">
                      {track.events.map((event) => (
                        <div
                          key={event.id}
                          className="border-l-4 border-blue-500 pl-4 py-2"
                        >
                          <h3 className="font-medium text-gray-900">{event.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {event.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>
                              {new Date(event.eventDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {event.location && <span>• {event.location}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
    
                {/* Recent Announcements */}
                {track.announcements.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Recent Announcements
                    </h2>
                    <div className="space-y-4">
                      {track.announcements.map((announcement) => (
                        <div key={announcement.id} className="pb-4 border-b last:border-b-0">
                          <div className="flex items-start gap-3">
                            {announcement.poster.image ? (
                              <Image
                                src={announcement.poster.image}
                                alt={announcement.poster.name}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-gray-600">
                                  {announcement.poster.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">
                                {announcement.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {announcement.content}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(announcement.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
    
              {/* Right Column - Sidebar */}
              <div className="space-y-8">
                {/* Enrolled Students */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Enrolled Students
                  </h2>
                  {track.students.length > 0 ? (
                    <>
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        {track.students.map((enrollment) => (
                          <div key={enrollment.id} className="text-center">
                            {enrollment.student.image ? (
                              <Image
                                src={enrollment.student.image}
                                alt={enrollment.student.name}
                                width={48}
                                height={48}
                                className="rounded-full mx-auto"
                                title={enrollment.student.name}
                              />
                            ) : (
                              <div
                                className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto"
                                title={enrollment.student.name}
                              >
                                <span className="text-sm font-medium text-gray-600">
                                  {enrollment.student.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {track._count.students > 12 && (
                        <p className="text-sm text-gray-500 text-center">
                          + {track._count.students - 12} more students
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No students enrolled yet
                    </p>
                  )}
                </div>
    
                {/* Quick Info */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Track Info
                  </h2>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-gray-500">Created</dt>
                      <dd className="text-gray-900 font-medium">
                        {new Date(track.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Last Updated</dt>
                      <dd className="text-gray-900 font-medium">
                        {new Date(track.updatedAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
}

export async function generateMetadata({ params }: { params: { id: string } }) {
    const track = await prisma.track.findUnique({
      where: { id: params.id },
      select: { name: true, description: true },
    })
  
    if (!track) {
      return {
        title: "Track Not Found",
      }
    }
  
    return {
      title: `${track.name} | Student LMS`,
      description: track.description || `Learn about ${track.name}`,
    }
  }