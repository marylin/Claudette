import { FolderTree } from 'lucide-react'
import { EmptyState } from '../shared/EmptyState'
import { useAppStore } from '../../store/app.store'

export function FileExplorer() {
  const activeProject = useAppStore((s) => s.activeProject)

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          icon={<FolderTree className="w-10 h-10" />}
          title="No project selected"
          description="Select a project from the sidebar to browse files"
        />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full">
      <EmptyState
        icon={<FolderTree className="w-10 h-10" />}
        title="File Explorer"
        description="Coming in v0.2 — browse your project files with syntax highlighting"
      />
    </div>
  )
}
