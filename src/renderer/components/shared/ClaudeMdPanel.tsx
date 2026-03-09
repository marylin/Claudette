import { useState, useEffect, useCallback } from 'react'
import { FileText, Save, Plus } from 'lucide-react'
import { Button } from './Button'
import { EmptyState } from './EmptyState'
import { useToast } from './ToastProvider'
import { useAppStore } from '../../store/app.store'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function ClaudeMdPanel() {
  const activeProject = useAppStore((s) => s.activeProject)
  const [content, setContent] = useState('')
  const [original, setOriginal] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [exists, setExists] = useState(false)

  useEffect(() => {
    if (!activeProject) return
    setLoading(true)
    window.electronAPI.readClaudeMd(activeProject.path).then((data: string | null) => {
      if (data !== null) {
        setContent(data)
        setOriginal(data)
        setExists(true)
      } else {
        setContent('')
        setOriginal('')
        setExists(false)
      }
      setLoading(false)
    })
  }, [activeProject])

  const { toast } = useToast()

  const handleSave = useCallback(async () => {
    if (!activeProject) return
    setSaving(true)
    try {
      await window.electronAPI.writeClaudeMd(activeProject.path, content)
      setOriginal(content)
      setExists(true)
      toast('success', 'CLAUDE.md saved')
    } catch {
      toast('error', 'Failed to save CLAUDE.md')
    }
    setSaving(false)
  }, [activeProject, content, toast])

  const handleCreate = async () => {
    if (!activeProject) return
    const template = `# ${activeProject.name}\n\n## Project Overview\n\nDescribe your project here.\n\n## Conventions\n\n- \n\n## Key Files\n\n- \n`
    setContent(template)
    setSaving(true)
    await window.electronAPI.writeClaudeMd(activeProject.path, template)
    setOriginal(template)
    setExists(true)
    setSaving(false)
  }

  // Ctrl+S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (exists && content !== original) handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSave, exists, content, original])

  if (!activeProject) {
    return <div className="flex items-center justify-center h-full"><EmptyState icon={<FileText className="w-10 h-10" />} title="No project selected" /></div>
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full text-xs text-text-muted">Loading...</div>
  }

  if (!exists) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          icon={<FileText className="w-10 h-10" />}
          title="No CLAUDE.md found"
          description="Create a CLAUDE.md file to give Claude context about your project"
          action={{ label: 'Create CLAUDE.md', onClick: handleCreate }}
        />
      </div>
    )
  }

  const hasChanges = content !== original

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-border bg-bg-surface shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-medium text-text-primary">CLAUDE.md</span>
          {hasChanges && <span className="w-2 h-2 rounded-full bg-warning" title="Unsaved changes" />}
        </div>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={!hasChanges} loading={saving} icon={<Save className="w-3 h-3" />}>
          Save
        </Button>
      </div>

      {/* Split editor + preview */}
      <div className="flex flex-1 min-h-0">
        {/* Editor */}
        <div className="flex-1 border-r border-border">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full resize-none bg-bg-base p-4 font-mono text-xs text-text-primary focus:outline-none select-text leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto p-4 bg-bg-base">
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
