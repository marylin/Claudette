import { BarChart3 } from 'lucide-react'
import { EmptyState } from '../shared/EmptyState'

export function UsagePanel() {
  return (
    <div className="flex items-center justify-center h-full">
      <EmptyState
        icon={<BarChart3 className="w-10 h-10" />}
        title="Usage Dashboard"
        description="Coming in v0.3 — track token usage, costs, and session analytics"
      />
    </div>
  )
}
