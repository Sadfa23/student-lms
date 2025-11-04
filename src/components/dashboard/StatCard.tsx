import { title } from "process";
import { ReactNode } from "react";

interface StatCardProps {
    title: string
    value: string | number
    icon: ReactNode
    description?: string
    trend?: {
        value: number
        isPositive: boolean
    }
    color?: "blue" | "green" |"purple" | "orange"
}

export default function StatCard({
    title,
    value,
    icon,
    description,
    trend,
    color = "blue"
}: StatCardProps) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
      }
    
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
              {description && (
                <p className="mt-2 text-sm text-gray-500">{description}</p>
              )}
              {trend && (
                <div className="mt-2 flex items-center gap-1">
                  <svg
                    className={`w-4 h-4 ${
                      trend.isPositive ? "text-green-600" : "text-red-600"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {trend.isPositive ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    )}
                  </svg>
                  <span
                    className={`text-sm font-medium ${
                      trend.isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {Math.abs(trend.value)}%
                  </span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
          </div>
        </div>
      )
}