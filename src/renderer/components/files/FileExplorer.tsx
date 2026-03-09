import { useState, useEffect } from 'react'
import { FolderTree, Search } from 'lucide-react'
import { EmptyState } from '../shared/EmptyState'
import { useAppStore } from '../../store/app.store'
import { FileTree } from './FileTree'
import { CodeViewer } from './CodeViewer'
import type { FileNode } from '@shared/types'

export function FileExplorer() {
  const activeProject = useAppStore((s) => s.activeProject)
  const [files, setFiles] = useState<FileNode[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    if (!activeProject) return
    setLoading(true)
    window.electronAPI.readDir(activeProject.path).then((nodes: FileNode[]) => {
      setFiles(nodes)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [activeProject])

  const handleSelectFile = async (filePath: string) => {
    setSelectedFile(filePath)
    try {
      const content = await window.electronAPI.readFile(filePath)
      setFileContent(content)
    } catch {
      setFileContent('Failed to read file')
    }
  }

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
    <div className="flex h-full">
      {/* File tree sidebar */}
      <div className="w-64 border-r border-border flex flex-col shrink-0">
        {/* Search */}
        <div className="px-2 py-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter files..."
              className="w-full h-7 pl-7 pr-2 text-xs bg-bg-base border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
            />
          </div>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto py-1">
          {loading ? (
            <div className="px-3 py-2 space-y-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-6 bg-bg-elevated rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <FileTree
              nodes={files}
              selectedFile={selectedFile}
              onSelectFile={handleSelectFile}
              filter={filter}
            />
          )}
        </div>
      </div>

      {/* Code viewer */}
      <div className="flex-1 min-w-0">
        {selectedFile ? (
          <CodeViewer filePath={selectedFile} content={fileContent} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={<FolderTree className="w-8 h-8" />}
              title="Select a file"
              description="Click a file in the tree to view its contents"
            />
          </div>
        )}
      </div>
    </div>
  )
}
