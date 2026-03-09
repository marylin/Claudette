import { useMemo } from 'react'
import { clsx } from 'clsx'

interface DiffViewerProps {
  filePath: string
  diff: string
}

export function DiffViewer({ filePath, diff }: DiffViewerProps) {
  const lines = useMemo(() => parseDiff(diff), [diff])
  const fileName = filePath.split(/[\\/]/).pop() || filePath

  if (!diff) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-text-muted">
        No diff available for this file
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="h-9 px-3 flex items-center border-b border-border bg-bg-surface shrink-0">
        <span className="text-xs font-medium text-text-primary font-mono">{fileName}</span>
        <span className="text-2xs text-text-muted ml-2">
          <span className="text-success">+{lines.filter((l) => l.type === 'add').length}</span>
          {' '}
          <span className="text-error">-{lines.filter((l) => l.type === 'remove').length}</span>
        </span>
      </div>
      <div className="flex-1 overflow-auto bg-bg-base select-text">
        <table className="w-full border-collapse font-mono text-xs">
          <tbody>
            {lines.map((line, i) => (
              <tr
                key={i}
                className={clsx({
                  'bg-success/5': line.type === 'add',
                  'bg-error/5': line.type === 'remove',
                  'bg-info/5': line.type === 'header',
                })}
              >
                <td className="text-right px-2 py-0 text-2xs text-text-muted select-none w-10 border-r border-border/30">
                  {line.oldLine || ''}
                </td>
                <td className="text-right px-2 py-0 text-2xs text-text-muted select-none w-10 border-r border-border/30">
                  {line.newLine || ''}
                </td>
                <td className={clsx('px-1 py-0 w-4 text-center select-none', {
                  'text-success': line.type === 'add',
                  'text-error': line.type === 'remove',
                  'text-info': line.type === 'header',
                  'text-text-muted': line.type === 'context',
                })}>
                  {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : line.type === 'header' ? '@@' : ''}
                </td>
                <td className="px-2 py-0 whitespace-pre overflow-x-auto text-text-primary">
                  {line.content}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface DiffLine {
  type: 'add' | 'remove' | 'context' | 'header'
  content: string
  oldLine?: number
  newLine?: number
}

function parseDiff(raw: string): DiffLine[] {
  const lines = raw.split('\n')
  const result: DiffLine[] = []
  let oldLine = 0
  let newLine = 0

  for (const line of lines) {
    if (line.startsWith('@@')) {
      const match = line.match(/@@ -(\d+)/)
      if (match) {
        oldLine = parseInt(match[1], 10)
        const newMatch = line.match(/\+(\d+)/)
        newLine = newMatch ? parseInt(newMatch[1], 10) : oldLine
      }
      result.push({ type: 'header', content: line })
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      result.push({ type: 'add', content: line.slice(1), newLine: newLine++ })
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      result.push({ type: 'remove', content: line.slice(1), oldLine: oldLine++ })
    } else if (line.startsWith('diff ') || line.startsWith('index ') || line.startsWith('---') || line.startsWith('+++')) {
      result.push({ type: 'header', content: line })
    } else {
      result.push({ type: 'context', content: line.startsWith(' ') ? line.slice(1) : line, oldLine: oldLine++, newLine: newLine++ })
    }
  }

  return result
}
