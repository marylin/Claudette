import { GitBranch } from 'lucide-react'
import { EmptyState } from '../shared/EmptyState'
import { useAppStore } from '../../store/app.store'

export function GitPanel() {
  const activeProject = useAppStore((s) => s.activeProject)

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          icon={<GitBranch className="w-10 h-10" />}
          title="No project selected"
          description="Select a project to see git status"
        />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full">
      <EmptyState
        icon={<GitBranch className="w-10 h-10" />}
        title="Git Panel"
        description="Coming in v0.2 — view diffs, stage files, and commit directly"
      />
    </div>
  )
}
