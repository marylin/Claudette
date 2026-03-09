import { useState, useMemo } from 'react'
import {
  ChevronRight, ChevronDown, File, Folder, FolderOpen,
  FileCode, FileJson, FileText, Image, FileType,
} from 'lucide-react'
import { clsx } from 'clsx'
import type { FileNode } from '@shared/types'

interface FileTreeProps {
  nodes: FileNode[]
  selectedFile: string | null
  onSelectFile: (path: string) => void
  filter: string
  depth?: number
}

const extIconMap: Record<string, React.ReactNode> = {
  ts: <FileCode className="w-3.5 h-3.5 text-blue-400" />,
  tsx: <FileCode className="w-3.5 h-3.5 text-blue-400" />,
  js: <FileCode className="w-3.5 h-3.5 text-yellow-400" />,
  jsx: <FileCode className="w-3.5 h-3.5 text-yellow-400" />,
  json: <FileJson className="w-3.5 h-3.5 text-yellow-300" />,
  md: <FileText className="w-3.5 h-3.5 text-text-secondary" />,
  css: <FileCode className="w-3.5 h-3.5 text-purple-400" />,
  html: <FileCode className="w-3.5 h-3.5 text-orange-400" />,
  svg: <Image className="w-3.5 h-3.5 text-green-400" />,
  png: <Image className="w-3.5 h-3.5 text-green-400" />,
  jpg: <Image className="w-3.5 h-3.5 text-green-400" />,
  py: <FileCode className="w-3.5 h-3.5 text-yellow-300" />,
  rs: <FileCode className="w-3.5 h-3.5 text-orange-400" />,
  go: <FileCode className="w-3.5 h-3.5 text-cyan-400" />,
}

function getFileIcon(node: FileNode) {
  if (node.extension && extIconMap[node.extension]) {
    return extIconMap[node.extension]
  }
  return <File className="w-3.5 h-3.5 text-text-muted" />
}

function matchesFilter(node: FileNode, filter: string): boolean {
  if (!filter) return true
  const lower = filter.toLowerCase()
  if (node.name.toLowerCase().includes(lower)) return true
  if (node.type === 'directory' && node.children) {
    return node.children.some((child) => matchesFilter(child, filter))
  }
  return false
}

export function FileTree({ nodes, selectedFile, onSelectFile, filter, depth = 0 }: FileTreeProps) {
  const filtered = useMemo(
    () => nodes.filter((n) => matchesFilter(n, filter)),
    [nodes, filter]
  )

  return (
    <div>
      {filtered.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          depth={depth}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
          filter={filter}
          defaultOpen={!!filter}
        />
      ))}
    </div>
  )
}

function TreeNode({
  node,
  depth,
  selectedFile,
  onSelectFile,
  filter,
  defaultOpen,
}: {
  node: FileNode
  depth: number
  selectedFile: string | null
  onSelectFile: (path: string) => void
  filter: string
  defaultOpen: boolean
}) {
  const [expanded, setExpanded] = useState(depth < 1 || defaultOpen)
  const isSelected = selectedFile === node.path

  if (node.type === 'directory') {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={clsx(
            'w-full flex items-center gap-1 px-2 py-0.5 text-xs hover:bg-bg-elevated transition-colors',
            'text-text-secondary hover:text-text-primary'
          )}
          style={{ paddingLeft: 8 + depth * 12 }}
        >
          {expanded ? (
            <ChevronDown className="w-3 h-3 shrink-0 text-text-muted" />
          ) : (
            <ChevronRight className="w-3 h-3 shrink-0 text-text-muted" />
          )}
          {expanded ? (
            <FolderOpen className="w-3.5 h-3.5 shrink-0 text-accent" />
          ) : (
            <Folder className="w-3.5 h-3.5 shrink-0 text-accent" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {expanded && node.children && (
          <FileTree
            nodes={node.children}
            selectedFile={selectedFile}
            onSelectFile={onSelectFile}
            filter={filter}
            depth={depth + 1}
          />
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => onSelectFile(node.path)}
      className={clsx(
        'w-full flex items-center gap-1.5 px-2 py-0.5 text-xs transition-colors',
        isSelected
          ? 'bg-accent/15 text-text-primary'
          : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
      )}
      style={{ paddingLeft: 20 + depth * 12 }}
    >
      {getFileIcon(node)}
      <span className="truncate">{node.name}</span>
    </button>
  )
}
