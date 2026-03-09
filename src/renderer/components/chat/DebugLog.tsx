import { useEffect, useRef, useState } from 'react'
import { Bug, Trash2, ChevronDown, ChevronUp, Copy } from 'lucide-react'
import { create } from 'zustand'

export interface LogEntry {
  id: number
  timestamp: Date
  channel: string
  direction: 'in' | 'out'  // in = from main, out = to main
  data: any
}

let logId = 0

interface DebugLogState {
  entries: LogEntry[]
  visible: boolean
  addEntry: (channel: string, direction: 'in' | 'out', data: any) => void
  clear: () => void
  toggle: () => void
  setVisible: (v: boolean) => void
}

export const useDebugLog = create<DebugLogState>((set) => ({
  entries: [],
  visible: false,
  addEntry: (channel, direction, data) =>
    set((s) => ({
      entries: [...s.entries.slice(-500), { id: ++logId, timestamp: new Date(), channel, direction, data }],
    })),
  clear: () => set({ entries: [] }),
  toggle: () => set((s) => ({ visible: !s.visible })),
  setVisible: (v) => set({ visible: v }),
}))

const CHANNEL_COLORS: Record<string, string> = {
  'claude:output': 'text-green-400',
  'claude:status': 'text-blue-400',
  'claude:command': 'text-yellow-400',
  'claude:send': 'text-violet-400',
  'claude:stop': 'text-red-400',
  'error': 'text-red-400',
}

function formatData(data: any): string {
  if (typeof data === 'string') return data
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 } as any)
}

export function DebugLogPanel() {
  const { entries, visible, clear, toggle } = useDebugLog()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries, autoScroll])

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 40)
  }

  const toggleEntry = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const copyAll = () => {
    const text = entries.map((e) =>
      `[${formatTime(e.timestamp)}] ${e.direction === 'out' ? '→' : '←'} ${e.channel}: ${formatData(e.data)}`
    ).join('\n')
    navigator.clipboard.writeText(text)
  }

  if (!visible) {
    return (
      <button
        onClick={toggle}
        className="absolute top-2 right-2 z-20 w-7 h-7 flex items-center justify-center rounded bg-bg-elevated/80 border border-border text-text-muted hover:text-text-primary transition-colors"
        title="Show debug log"
      >
        <Bug className="w-3.5 h-3.5" />
      </button>
    )
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-bg-primary/95 backdrop-blur-sm">
      {/* Header */}
      <div className="h-8 px-3 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Bug className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-medium text-text-primary">Debug Log</span>
          <span className="text-2xs text-text-muted">({entries.length} events)</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={copyAll}
            className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-primary rounded transition-colors"
            title="Copy all"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={clear}
            className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-primary rounded transition-colors"
            title="Clear"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <button
            onClick={toggle}
            className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-primary rounded transition-colors"
            title="Close"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log entries */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto font-mono text-2xs leading-relaxed"
      >
        {entries.length === 0 && (
          <div className="flex items-center justify-center h-full text-text-muted text-xs">
            No events yet. Send a message to see IPC traffic.
          </div>
        )}

        {entries.map((entry) => {
          const isExpanded = expanded.has(entry.id)
          const dataStr = formatData(entry.data)
          const isLong = dataStr.length > 120
          const preview = isLong && !isExpanded ? dataStr.slice(0, 120) + '…' : dataStr
          const colorClass = CHANNEL_COLORS[entry.channel] || 'text-text-secondary'

          return (
            <div
              key={entry.id}
              className="px-3 py-0.5 hover:bg-bg-surface/50 border-b border-border/30 cursor-pointer"
              onClick={() => isLong && toggleEntry(entry.id)}
            >
              <span className="text-text-muted">{formatTime(entry.timestamp)}</span>
              {' '}
              <span className={entry.direction === 'out' ? 'text-orange-400' : 'text-cyan-400'}>
                {entry.direction === 'out' ? '→' : '←'}
              </span>
              {' '}
              <span className={colorClass}>{entry.channel}</span>
              {' '}
              <span className="text-text-secondary whitespace-pre-wrap break-all">{preview}</span>
              {isLong && (
                <span className="ml-1 text-text-muted">
                  {isExpanded ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
