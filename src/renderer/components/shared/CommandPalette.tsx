import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  Search, MessageSquare, FolderOpen, Settings, GitBranch,
  Bot, BarChart3, FileText, Terminal, Plus, ArrowRight,
} from 'lucide-react'
import { useAppStore, type TabId } from '../../store/app.store'
import { useProjectStore } from '../../store/project.store'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  action: () => void
  category: 'action' | 'project' | 'navigation'
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  if (t.includes(q)) return true

  // Simple fuzzy: all query chars appear in order
  let qi = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++
  }
  return qi === q.length
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const setActiveTab = useAppStore((s) => s.setActiveTab)
  const setActiveProject = useAppStore((s) => s.setActiveProject)
  const toggleTerminal = useAppStore((s) => s.toggleTerminal)
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)
  const projects = useProjectStore((s) => s.projects)

  // Build command list
  const allCommands = useMemo<CommandItem[]>(() => {
    const navItems: CommandItem[] = [
      {
        id: 'nav-chat', label: 'Go to Chat', description: 'Ctrl+1',
        icon: <MessageSquare className="w-4 h-4" />,
        action: () => { setActiveTab('chat'); onClose() },
        category: 'navigation',
      },
      {
        id: 'nav-files', label: 'Go to Files', description: 'Ctrl+2',
        icon: <FolderOpen className="w-4 h-4" />,
        action: () => { setActiveTab('files'); onClose() },
        category: 'navigation',
      },
      {
        id: 'nav-git', label: 'Go to Git', description: 'Ctrl+3',
        icon: <GitBranch className="w-4 h-4" />,
        action: () => { setActiveTab('git'); onClose() },
        category: 'navigation',
      },
      {
        id: 'nav-agents', label: 'Go to Agents', description: 'Ctrl+4',
        icon: <Bot className="w-4 h-4" />,
        action: () => { setActiveTab('agents'); onClose() },
        category: 'navigation',
      },
      {
        id: 'nav-usage', label: 'Go to Usage', description: 'Ctrl+5',
        icon: <BarChart3 className="w-4 h-4" />,
        action: () => { setActiveTab('usage'); onClose() },
        category: 'navigation',
      },
    ]

    const actionItems: CommandItem[] = [
      {
        id: 'action-new-session', label: 'New Chat Session',
        icon: <Plus className="w-4 h-4" />,
        action: () => { setActiveTab('chat'); onClose() },
        category: 'action',
      },
      {
        id: 'action-settings', label: 'Open Settings',
        icon: <Settings className="w-4 h-4" />,
        action: () => { setSettingsOpen(true); onClose() },
        category: 'action',
      },
      {
        id: 'action-terminal', label: 'Toggle Terminal', description: 'Ctrl+`',
        icon: <Terminal className="w-4 h-4" />,
        action: () => { toggleTerminal(); onClose() },
        category: 'action',
      },
      {
        id: 'action-open-folder', label: 'Open Project Folder',
        icon: <FolderOpen className="w-4 h-4" />,
        action: async () => {
          const folderPath = await window.electronAPI.openFolder()
          if (folderPath) {
            setActiveProject({
              id: folderPath, name: folderPath.split(/[\\/]/).pop() || folderPath,
              path: folderPath, encodedPath: '', lastSessionAt: null,
              sessionCount: 0, hasClaudeMd: false,
            })
          }
          onClose()
        },
        category: 'action',
      },
    ]

    const projectItems: CommandItem[] = projects.map((p) => ({
      id: `project-${p.id}`,
      label: p.name,
      description: p.path,
      icon: <FileText className="w-4 h-4" />,
      action: () => { setActiveProject(p); onClose() },
      category: 'project' as const,
    }))

    return [...actionItems, ...navItems, ...projectItems]
  }, [projects, setActiveTab, setActiveProject, toggleTerminal, setSettingsOpen, onClose])

  // Filter by query
  const filtered = useMemo(() => {
    if (!query.trim()) return allCommands
    return allCommands.filter(
      (item) => fuzzyMatch(query, item.label) || (item.description && fuzzyMatch(query, item.description))
    )
  }, [allCommands, query])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const item = list.children[selectedIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((i) => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          filtered[selectedIndex]?.action()
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    },
    [filtered, selectedIndex, onClose]
  )

  if (!open) return null

  // Group by category
  const grouped = {
    action: filtered.filter((c) => c.category === 'action'),
    navigation: filtered.filter((c) => c.category === 'navigation'),
    project: filtered.filter((c) => c.category === 'project'),
  }

  let runningIndex = -1

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

      {/* Palette */}
      <div
        className="relative w-full max-w-lg bg-bg-surface border border-border rounded-xl shadow-2xl
                    overflow-hidden animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted
                       outline-none"
          />
          <kbd className="hidden sm:inline-flex text-2xs text-text-muted bg-bg-elevated
                          px-1.5 py-0.5 rounded border border-border">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[320px] overflow-y-auto custom-scrollbar py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-text-muted">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              {grouped.action.length > 0 && (
                <CategorySection label="Actions">
                  {grouped.action.map((item) => {
                    runningIndex++
                    return (
                      <CommandRow
                        key={item.id}
                        item={item}
                        selected={runningIndex === selectedIndex}
                        onSelect={item.action}
                        onHover={() => setSelectedIndex(runningIndex)}
                        index={runningIndex}
                      />
                    )
                  })}
                </CategorySection>
              )}
              {grouped.navigation.length > 0 && (
                <CategorySection label="Navigation">
                  {grouped.navigation.map((item) => {
                    runningIndex++
                    return (
                      <CommandRow
                        key={item.id}
                        item={item}
                        selected={runningIndex === selectedIndex}
                        onSelect={item.action}
                        onHover={() => setSelectedIndex(runningIndex)}
                        index={runningIndex}
                      />
                    )
                  })}
                </CategorySection>
              )}
              {grouped.project.length > 0 && (
                <CategorySection label="Projects">
                  {grouped.project.map((item) => {
                    runningIndex++
                    return (
                      <CommandRow
                        key={item.id}
                        item={item}
                        selected={runningIndex === selectedIndex}
                        onSelect={item.action}
                        onHover={() => setSelectedIndex(runningIndex)}
                        index={runningIndex}
                      />
                    )
                  })}
                </CategorySection>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function CategorySection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-4 pt-2 pb-1 text-2xs font-medium text-text-muted uppercase tracking-wider">
        {label}
      </div>
      {children}
    </div>
  )
}

function CommandRow({
  item,
  selected,
  onSelect,
  onHover,
  index,
}: {
  item: CommandItem
  selected: boolean
  onSelect: () => void
  onHover: () => void
  index: number
}) {
  return (
    <button
      data-index={index}
      onClick={onSelect}
      onMouseEnter={onHover}
      className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
        selected
          ? 'bg-accent-muted text-text-primary'
          : 'text-text-secondary hover:bg-bg-elevated'
      }`}
    >
      <span className={selected ? 'text-accent' : 'text-text-muted'}>{item.icon}</span>
      <span className="flex-1 text-sm truncate">{item.label}</span>
      {item.description && (
        <span className="text-2xs text-text-muted truncate max-w-[200px]">{item.description}</span>
      )}
      {selected && <ArrowRight className="w-3 h-3 text-accent flex-shrink-0" />}
    </button>
  )
}
