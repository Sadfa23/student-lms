import Link from "next/link";
import {ReactNode} from "react"

interface QuickAction {
    title: string
    description: string
    href: string
    icon: ReactNode
    color?: "blue" | "green" | "purple" | "orange"
}

interface QuickActionsProps {
    actions: QuickAction[]
  }

  export default function QuickActions({ actions }: QuickActionsProps) {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
      green: "bg-green-50 text-green-600 hover:bg-green-100",
      purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
      orange: "bg-orange-50 text-orange-600 hover:bg-orange-100",
    }
  
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className={`p-4 rounded-lg transition ${
                colorClasses[action.color || "blue"]
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0">{action.icon}</div>
                <div>
                  <h3 className="font-medium text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }