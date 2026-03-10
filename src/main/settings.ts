import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import type { Settings } from '../shared/types'

const SETTINGS_FILE = path.join(app.getPath('userData'), 'settings.json')

const DEFAULT_SETTINGS: Settings = {
  claudePath: '',
  defaultModel: 'claude-sonnet-4-5',
  autoAcceptPermissions: false,
  permissionMode: 'default',
  terminalVisible: false,
  sidebarCollapsed: false,
  fontSize: 13,
  theme: 'dark',
}

let cachedSettings: Settings = { ...DEFAULT_SETTINGS }
let loaded = false

export function getSettings(): Settings {
  if (loaded) return cachedSettings

  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8')
      cachedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(data) }
    } else {
      cachedSettings = { ...DEFAULT_SETTINGS }
      saveSettings(cachedSettings)
    }
  } catch {
    cachedSettings = { ...DEFAULT_SETTINGS }
  }

  loaded = true
  return cachedSettings
}

export function updateSettings(partial: Partial<Settings>): Settings {
  const current = getSettings()
  cachedSettings = { ...current, ...partial }
  saveSettings(cachedSettings)
  return cachedSettings
}

function saveSettings(settings: Settings): void {
  try {
    const dir = path.dirname(SETTINGS_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to save settings:', err)
  }
}

