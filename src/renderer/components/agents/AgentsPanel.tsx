import { Bot } from 'lucide-react'
import { EmptyState } from '../shared/EmptyState'

export function AgentsPanel() {
  return (
    <div className="flex items-center justify-center h-full">
      <EmptyState
        icon={<Bot className="w-10 h-10" />}
        title="Agents Manager"
        description="Coming in v0.2 — create and manage custom Claude agents with system prompts"
      />
    </div>
  )
}
