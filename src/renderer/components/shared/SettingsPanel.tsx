import { useState, useEffect } from 'react'
import { X, FolderOpen, RefreshCw, Check } from 'lucide-react'
import { Button } from './Button'
import { useAppStore } from '../../store/app.store'
import type { Settings, AgentModel } from '@shared/types'

export function SettingsPanel() {
  const settings = useAppStore((s) => s.settings)
  const setSettings = useAppStore((s) => s.setSettings)
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)
  const [localSettings, setLocalSettings] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [detecting, setDetecting] = useState(false)

  useEffect(() => {
    if (settings) {
      setLocalSettings({ ...settings })
    } else {
      window.electronAPI.getSettings().then((s: Settings) => {
        setLocalSettings(s)
        setSettings(s)
      })
    }
  }, [settings, setSettings])

  if (!localSettings) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await window.electronAPI.setSettings(localSettings as any)
      setSettings(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save settings:', err)
    }
    setSaving(false)
  }

  const handleDetect = async () => {
    setDetecting(true)
    try {
      // Re-fetch settings which triggers auto-detection
      const fresh = await window.electronAPI.getSettings()
      setLocalSettings({ ...localSettings, claudePath: fresh.claudePath })
    } catch {
      // ignore
    }
    setDetecting(false)
  }

  const updateLocal = (key: keyof Settings, value: any) => {
    setLocalSettings({ ...localSettings, [key]: value })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[480px] max-h-[80vh] bg-bg-surface border border-border rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">Settings</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-primary rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[60vh]">
          {/* Claude CLI Path */}
          <SettingsField label="Claude CLI Path" description="Path to the claude command-line tool">
            <div className="flex gap-2">
              <input
                type="text"
                value={localSettings.claudePath}
                onChange={(e) => updateLocal('claudePath', e.target.value)}
                placeholder="/usr/local/bin/claude"
                className="flex-1 h-8 px-2.5 text-sm bg-bg-base border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDetect}
                loading={detecting}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Detect
              </Button>
            </div>
          </SettingsField>

          {/* Default Model */}
          <SettingsField label="Default Model" description="Model used for new sessions">
            <select
              value={localSettings.defaultModel}
              onChange={(e) => updateLocal('defaultModel', e.target.value as AgentModel)}
              className="h-8 px-2.5 text-sm bg-bg-base border border-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50"
            >
              <option value="claude-sonnet-4-5">Claude Sonnet 4.5</option>
              <option value="claude-opus-4-5">Claude Opus 4.5</option>
              <option value="claude-haiku-4-5">Claude Haiku 4.5</option>
            </select>
          </SettingsField>

          {/* Auto-accept permissions */}
          <SettingsField label="Auto-accept Permissions" description="Skip permission prompts (use with caution)">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.autoAcceptPermissions}
                onChange={(e) => updateLocal('autoAcceptPermissions', e.target.checked)}
                className="w-4 h-4 rounded border-border bg-bg-base text-accent focus:ring-accent/50"
              />
              <span className="text-sm text-text-secondary">Enable</span>
            </label>
          </SettingsField>

          {/* Font Size */}
          <SettingsField label="Font Size" description="Base font size for terminal and editor">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={10}
                max={18}
                value={localSettings.fontSize}
                onChange={(e) => updateLocal('fontSize', Number(e.target.value))}
                className="flex-1 accent-accent"
              />
              <span className="text-sm text-text-secondary w-8 text-right">{localSettings.fontSize}px</span>
            </div>
          </SettingsField>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
          <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            loading={saving}
            icon={saved ? <Check className="w-3.5 h-3.5" /> : undefined}
          >
            {saved ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function SettingsField({
  label,
  description,
  children,
}: {
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-0.5">{label}</label>
      <p className="text-xs text-text-muted mb-2">{description}</p>
      {children}
    </div>
  )
}
