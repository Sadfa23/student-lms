import Link from "next/link"

export default function TrackNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Track Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The track you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/tracks"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Browse All Tracks
        </Link>
      </div>
    </div>
  )
}