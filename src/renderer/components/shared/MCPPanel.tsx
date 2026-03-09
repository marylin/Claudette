import { useState, useEffect } from 'react'
import { Server, Plus, Trash2, Power, PowerOff, Globe, Terminal as TerminalIcon } from 'lucide-react'
import { Button } from './Button'
import { EmptyState } from './EmptyState'
import { useToast } from './ToastProvider'
import { useAppStore } from '../../store/app.store'

interface McpServer {
  id: string
  name: string
  type: 'stdio' | 'sse' | 'http'
  command?: string
  args?: string[]
  url?: string
  env?: Record<string, string>
  enabled: boolean
  scope: 'global' | 'project'
  source: string
}

export function MCPPanel() {
  const activeProject = useAppStore((s) => s.activeProject)
  const [servers, setServers] = useState<McpServer[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const { toast } = useToast()

  const refresh = async () => {
    try {
      const list = await window.electronAPI.listMcpServers(activeProject?.path)
      setServers(list)
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { refresh() }, [activeProject])

  const handleToggle = async (server: McpServer) => {
    await window.electronAPI.toggleMcpServer(server.name, server.scope, !server.enabled, activeProject?.path)
    toast('info', `${server.name} ${server.enabled ? 'disabled' : 'enabled'}`)
    refresh()
  }

  const handleDelete = async (server: McpServer) => {
    await window.electronAPI.removeMcpServer(server.name, server.scope, activeProject?.path)
    toast('info', `${server.name} removed`)
    refresh()
  }

  if (loading) {
    return <div className="p-4 text-xs text-text-muted">Loading MCP servers...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-medium text-text-primary">MCP Servers</h3>
        </div>
        <Button variant="ghost" size="sm" icon={<Plus className="w-3 h-3" />} onClick={() => setShowAdd(true)}>
          Add Server
        </Button>
      </div>

      {showAdd && (
        <AddServerForm
          projectPath={activeProject?.path}
          onSave={() => { setShowAdd(false); refresh() }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {servers.length === 0 && !showAdd && (
        <EmptyState
          icon={<Server className="w-8 h-8" />}
          title="No MCP servers configured"
          description="Add MCP servers to extend Claude's capabilities"
          action={{ label: 'Add Server', onClick: () => setShowAdd(true) }}
          className="py-6"
        />
      )}

      <div className="space-y-2">
        {servers.map((server) => (
          <div
            key={server.id}
            className="flex items-center gap-3 px-3 py-2.5 bg-bg-elevated rounded-lg border border-border"
          >
            <div className={`p-1.5 rounded-md ${server.enabled ? 'bg-success-muted' : 'bg-bg-surface'}`}>
              {server.type === 'stdio' ? (
                <TerminalIcon className={`w-3.5 h-3.5 ${server.enabled ? 'text-success' : 'text-text-muted'}`} />
              ) : (
                <Globe className={`w-3.5 h-3.5 ${server.enabled ? 'text-success' : 'text-text-muted'}`} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-text-primary">{server.name}</span>
                <span className={`text-2xs px-1.5 py-0.5 rounded ${
                  server.scope === 'global'
                    ? 'bg-info-muted text-info'
                    : 'bg-accent-muted text-accent'
                }`}>
                  {server.scope}
                </span>
                <span className="text-2xs text-text-muted">{server.type}</span>
              </div>
              <p className="text-2xs text-text-muted truncate mt-0.5">
                {server.command ? `${server.command} ${(server.args || []).join(' ')}` : server.url || 'No command set'}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleToggle(server)}
                className="p-1 text-text-muted hover:text-text-primary transition-colors"
                title={server.enabled ? 'Disable' : 'Enable'}
                aria-label={server.enabled ? 'Disable server' : 'Enable server'}
              >
                {server.enabled ? <Power className="w-3.5 h-3.5 text-success" /> : <PowerOff className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleDelete(server)}
                className="p-1 text-text-muted hover:text-error transition-colors"
                title="Remove"
                aria-label="Remove server"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AddServerForm({
  projectPath,
  onSave,
  onCancel,
}: {
  projectPath?: string
  onSave: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'stdio' | 'sse' | 'http'>('stdio')
  const [command, setCommand] = useState('')
  const [args, setArgs] = useState('')
  const [url, setUrl] = useState('')
  const [scope, setScope] = useState<'global' | 'project'>(projectPath ? 'project' : 'global')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await window.electronAPI.addMcpServer({
        name: name.trim(),
        type,
        command: type === 'stdio' ? command : undefined,
        args: type === 'stdio' && args ? args.split(' ').filter(Boolean) : undefined,
        url: type !== 'stdio' ? url : undefined,
        enabled: true,
        scope,
      }, projectPath)
      toast('success', `MCP server "${name}" added`)
      onSave()
    } catch {
      toast('error', 'Failed to add MCP server')
    }
    setSaving(false)
  }

  return (
    <div className="bg-bg-elevated border border-border rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-2xs text-text-muted mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="my-server"
            className="w-full h-7 px-2 text-xs bg-bg-base border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
        </div>
        <div>
          <label className="block text-2xs text-text-muted mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'stdio' | 'sse' | 'http')}
            className="w-full h-7 px-2 text-xs bg-bg-base border border-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50"
          >
            <option value="stdio">stdio</option>
            <option value="sse">SSE</option>
            <option value="http">HTTP</option>
          </select>
        </div>
      </div>

      {type === 'stdio' ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-2xs text-text-muted mb-1">Command</label>
            <input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="npx -y @modelcontextprotocol/server"
              className="w-full h-7 px-2 text-xs bg-bg-base border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
            />
          </div>
          <div>
            <label className="block text-2xs text-text-muted mb-1">Args (space separated)</label>
            <input
              value={args}
              onChange={(e) => setArgs(e.target.value)}
              placeholder="--port 3000"
              className="w-full h-7 px-2 text-xs bg-bg-base border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-2xs text-text-muted mb-1">URL</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://localhost:3000/sse"
            className="w-full h-7 px-2 text-xs bg-bg-base border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
        </div>
      )}

      <div>
        <label className="block text-2xs text-text-muted mb-1">Scope</label>
        <div className="flex gap-3">
          <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
            <input type="radio" checked={scope === 'global'} onChange={() => setScope('global')} className="accent-accent" />
            Global
          </label>
          <label className={`flex items-center gap-1.5 text-xs cursor-pointer ${projectPath ? 'text-text-secondary' : 'text-text-muted'}`}>
            <input type="radio" checked={scope === 'project'} onChange={() => setScope('project')} disabled={!projectPath} className="accent-accent" />
            Project
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="primary" size="sm" onClick={handleSave} loading={saving} disabled={!name.trim()}>
          Add Server
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
