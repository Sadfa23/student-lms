import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import StatCard from "@/components/dashboard/StatCard"
import QuickActions from "@/components/dashboard/QuickActions"
import RecentActivity from "@/components/dashboard/RecentActivity"
import Link from "next/link"
import Image from "next/image"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  console.log("This is the session in dashboard", session)

  if (!session) {
    redirect("/auth/signin")
  }

  const userRole = session.user.role

  // Render different dashboard based on role
  if (userRole === "student") {
    return <StudentDashboard userId={session.user.id} userName={session.user.name} />
  } else if (userRole === "lead" || userRole === "co-lead") {
    return <LeadDashboard userId={session.user.id} userName={session.user.name} role={userRole} />
  } else if (userRole === "admin") {
    return <AdminDashboard userId={session.user.id} userName={session.user.name} />
  }

  return <div>Invalid role</div>
}

async function StudentDashboard({ userId, userName }: { userId: string; userName: string }) {
  // Fetch student's enrolled tracks
  const enrolledTracks = await prisma.studentTrack.findMany({
    where: { studentId: userId },
    include: {
      track: {
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
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      joinedAt: "desc",
    },
    take: 6,
  })

  // Fetch upcoming events from enrolled tracks
  const trackIds = enrolledTracks.map((et: { track: { id: string } }) => et.track.id)
  const upcomingEvents = await prisma.event.findMany({
    where: {
      trackId: { in: trackIds },
      eventDate: { gte: new Date() },
    },
    include: {
      track: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      eventDate: "asc",
    },
    take: 5,
  })

  // Quick actions for students
  const quickActions = [
    {
      title: "Browse Tracks",
      description: "Discover new learning tracks",
      href: "/tracks",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      color: "blue" as const,
    },
    {
      title: "View Events",
      description: "See upcoming events",
      href: "/events",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "green" as const,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userName}!
          </h1>
          <p className="text-gray-600 mt-2">Here&apos;s what&apos;s happening with your learning</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Enrolled Tracks"
            value={enrolledTracks.length}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            description="Active learning paths"
            color="blue"
          />
          <StatCard
            title="Upcoming Events"
            value={upcomingEvents.length}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            description="In your tracks"
            color="green"
          />
          <StatCard
            title="Total Students"
            value={enrolledTracks.reduce((sum: number, et: typeof enrolledTracks[number]) => sum + et.track._count.students, 0)}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            description="Learning with you"
            color="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - My Tracks */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">My Tracks</h2>
                <Link href="/tracks" className="text-sm text-blue-600 hover:text-blue-700">
                  Browse all →
                </Link>
              </div>
              {enrolledTracks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enrolledTracks.map((enrollment) => (
                    <Link
                      key={enrollment.id}
                      href={`/tracks/${enrollment.track.id}`}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition"
                    >
                      <h3 className="font-medium text-gray-900 mb-2">
                        {enrollment.track.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {enrollment.track.description || "No description"}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{enrollment.track._count.students} students</span>
                        <span>{enrollment.track._count.events} events</span>
                      </div>
                      {enrollment.track.leadership[0] && (
                        <div className="flex items-center gap-2 mt-3">
                          {enrollment.track.leadership[0].lead.image ? (
                            <Image
                              src={enrollment.track.leadership[0].lead.image}
                              alt={enrollment.track.leadership[0].lead.name}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-800">
                                {enrollment.track.leadership[0].lead.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span className="text-xs text-gray-600">
                            {enrollment.track.leadership[0].lead.name}
                          </span>
                        </div>
                      )}
                    </Link>
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tracks yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by enrolling in a track</p>
                  <Link
                    href="/tracks"
                    className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Browse Tracks
                  </Link>
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Upcoming Events
                </h2>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="border-l-4 border-green-500 pl-4 py-2">
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{event.track.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(event.eventDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <QuickActions actions={quickActions} />
          </div>
        </div>
      </div>
    </div>
  )
}

async function LeadDashboard({ userId, userName, role }: { userId: string; userName: string; role: string }) {
  // Fetch tracks where user is lead or co-lead
  const managedTracks = await prisma.trackLeadership.findMany({
    where: {
      OR: [
        { leadId: userId },
        { coLeadId: userId },
      ],
    },
    include: {
      track: {
        include: {
          _count: {
            select: {
              students: true,
              events: true,
              announcements: true,
              courseMaterials: true,
            },
          },
          students: {
            take: 5,
            orderBy: {
              joinedAt: "desc",
            },
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
      lead: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      coLead: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  // Calculate total stats across all managed tracks
  const totalStats = managedTracks.reduce(
    (acc, leadership) => ({
      students: acc.students + leadership.track._count.students,
      events: acc.events + leadership.track._count.events,
      announcements: acc.announcements + leadership.track._count.announcements,
      materials: acc.materials + leadership.track._count.courseMaterials,
    }),
    { students: 0, events: 0, announcements: 0, materials: 0 }
  )

  // Fetch recent announcements from managed tracks
  const trackIds = managedTracks.map((m) => m.track.id)
  const recentAnnouncements = await prisma.announcement.findMany({
    where: {
      trackId: { in: trackIds },
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
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  })

  // Fetch upcoming events
  const upcomingEvents = await prisma.event.findMany({
    where: {
      trackId: { in: trackIds },
      eventDate: { gte: new Date() },
    },
    include: {
      track: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      eventDate: "asc",
    },
    take: 5,
  })

  // Quick actions for leads
  const quickActions = [
    {
      title: "Post Announcement",
      description: "Share updates with students",
      href: "/announcements/create",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      color: "blue" as const,
    },
    {
      title: "Create Event",
      description: "Schedule a new event",
      href: "/events/create",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "green" as const,
    },
    {
      title: "Upload Material",
      description: "Add course resources",
      href: "/materials/upload",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      color: "purple" as const,
    },
    {
      title: "View All Tracks",
      description: "Browse learning tracks",
      href: "/tracks",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: "orange" as const,
    },
  ]

  // Convert announcements to activity items
  const activities = recentAnnouncements.map((announcement) => ({
    id: announcement.id,
    type: "announcement" as const,
    title: announcement.title,
    description: `Posted in ${announcement.track.name}`,
    timestamp: announcement.createdAt,
    user: announcement.poster,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {userName}!
          </h1>
          <p className="text-gray-600 mt-2">
            {role === "lead" ? "Track Lead" : "Co-Lead"} Dashboard
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Managed Tracks"
            value={managedTracks.length}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            description="Learning tracks"
            color="blue"
          />
          <StatCard
            title="Total Students"
            value={totalStats.students}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            description="Across all tracks"
            color="green"
          />
          <StatCard
            title="Events Created"
            value={totalStats.events}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            description="Total events"
            color="purple"
          />
          <StatCard
            title="Materials"
            value={totalStats.materials}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            description="Course materials"
            color="orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - My Tracks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Managed Tracks */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                My Tracks
              </h2>
              {managedTracks.length > 0 ? (
                <div className="space-y-4">
                  {managedTracks.map((leadership) => (
                    <div
                      key={leadership.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <Link
                            href={`/tracks/${leadership.track.id}`}
                            className="text-lg font-medium text-gray-900 hover:text-blue-600"
                          >
                            {leadership.track.name}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            {leadership.leadId === userId ? "Lead" : "Co-Lead"}
                          </p>
                        </div>
                      </div>

                      {/* Track Stats */}
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-semibold text-gray-900">
                            {leadership.track._count.students}
                          </p>
                          <p className="text-xs text-gray-500">Students</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-semibold text-gray-900">
                            {leadership.track._count.events}
                          </p>
                          <p className="text-xs text-gray-500">Events</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-semibold text-gray-900">
                            {leadership.track._count.announcements}
                          </p>
                          <p className="text-xs text-gray-500">Posts</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-semibold text-gray-900">
                            {leadership.track._count.courseMaterials}
                          </p>
                          <p className="text-xs text-gray-500">Materials</p>
                        </div>
                      </div>

                      {/* Recent Students */}
                      {leadership.track.students.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Recent enrollments:</p>
                          <div className="flex items-center gap-2">
                            {leadership.track.students.slice(0, 5).map((enrollment) => (
                              <div key={enrollment.id} className="relative group">
                                {enrollment.student.image ? (
                                  <Image
                                    src={enrollment.student.image}
                                    alt={enrollment.student.name}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-xs font-medium text-blue-800">
                                      {enrollment.student.name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                                  {enrollment.student.name}
                                </div>
                              </div>
                            ))}
                            {leadership.track._count.students > 5 && (
                              <span className="text-xs text-gray-500">
                                +{leadership.track._count.students - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tracks assigned</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Contact an admin to be assigned as a track lead
                  </p>
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Upcoming Events
                </h2>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="border-l-4 border-green-500 pl-4 py-2">
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{event.track.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(event.eventDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Quick Actions & Activity */}
          <div className="space-y-6">
            <QuickActions actions={quickActions} />
            {activities.length > 0 && <RecentActivity activities={activities} />}
          </div>
        </div>
      </div>
    </div>
  )
}

async function AdminDashboard({ userId, userName }: { userId: string; userName: string }) {
  // Fetch platform-wide statistics
  const [totalUsers, totalTracks, totalEvents, totalAnnouncements] = await Promise.all([
    prisma.user.count(),
    prisma.track.count(),
    prisma.event.count(),
    prisma.announcement.count(),
  ])

  // Fetch user breakdown by role
  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: true,
  })

  const roleStats = {
    student: usersByRole.find((r) => r.role === "student")?._count || 0,
    lead: usersByRole.find((r) => r.role === "lead")?._count || 0,
    "co-lead": usersByRole.find((r) => r.role === "co-lead")?._count || 0,
    admin: usersByRole.find((r) => r.role === "admin")?._count || 0,
  }

  // Fetch recent users (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const recentUsers = await prisma.user.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
    },
  })

  // Fetch tracks with leadership info
  const tracks = await prisma.track.findMany({
    include: {
      _count: {
        select: {
          students: true,
        },
      },
      leadership: {
        include: {
          lead: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  })

  // Fetch recent enrollments
  const recentEnrollments = await prisma.studentTrack.findMany({
    take: 10,
    orderBy: {
      joinedAt: "desc",
    },
    include: {
      student: {
        select: {
          name: true,
          image: true,
        },
      },
      track: {
        select: {
          name: true,
        },
      },
    },
  })

  // Quick actions for admins
  const quickActions = [
    {
      title: "Create Track",
      description: "Add a new learning track",
      href: "/admin/tracks/create",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: "blue" as const,
    },
    {
      title: "Manage Users",
      description: "View and edit users",
      href: "/admin/users",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: "green" as const,
    },
    {
      title: "Assign Leadership",
      description: "Set track leads",
      href: "/admin/leadership",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: "purple" as const,
    },
    {
      title: "View Analytics",
      description: "Platform insights",
      href: "/admin/analytics",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "orange" as const,
    },
  ]

  // Convert enrollments to activity items
  const activities = recentEnrollments.map((enrollment) => ({
    id: enrollment.id,
    type: "enrollment" as const,
    title: `${enrollment.student.name} enrolled`,
    description: `in ${enrollment.track.name}`,
    timestamp: enrollment.joinedAt,
    user: enrollment.student,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Platform overview and management</p>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            description={`${recentUsers.length} new this week`}
            color="blue"
          />
          <StatCard
            title="Learning Tracks"
            value={totalTracks}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            description="Active programs"
            color="green"
          />
          <StatCard
            title="Total Events"
            value={totalEvents}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            description="Scheduled activities"
            color="purple"
          />
          <StatCard
            title="Announcements"
            value={totalAnnouncements}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            }
            description="Total posts"
            color="orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tracks & Users */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                User Distribution
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{roleStats.student}</p>
                  <p className="text-sm text-gray-600 mt-1">Students</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{roleStats.lead}</p>
                  <p className="text-sm text-gray-600 mt-1">Leads</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">{roleStats["co-lead"]}</p>
                  <p className="text-sm text-gray-600 mt-1">Co-Leads</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-3xl font-bold text-orange-600">{roleStats.admin}</p>
                  <p className="text-sm text-gray-600 mt-1">Admins</p>
                </div>
              </div>
            </div>

            {/* Recent Tracks */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Tracks</h2>
                <Link href="/tracks" className="text-sm text-blue-600 hover:text-blue-700">
                  View all →
                </Link>
              </div>
              <div className="space-y-3">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition"
                  >
                    <div className="flex-1">
                      <Link
                        href={`/tracks/${track.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {track.name}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        {track._count.students} students
                        {track.leadership[0] && ` • Led by ${track.leadership[0].lead.name}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Registrations
              </h2>
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : user.role === "lead"
                          ? "bg-green-100 text-green-800"
                          : user.role === "co-lead"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {user.role}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Activity */}
          <div className="space-y-6">
            <QuickActions actions={quickActions} />
            <RecentActivity activities={activities} emptyMessage="No recent enrollments" />
          </div>
        </div>
      </div>
    </div>
  )
}