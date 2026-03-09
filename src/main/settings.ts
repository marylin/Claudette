import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'
import type { Settings } from '../shared/types'

const SETTINGS_FILE = path.join(app.getPath('userData'), 'settings.json')

const DEFAULT_SETTINGS: Settings = {
  claudePath: '',
  defaultModel: 'claude-sonnet-4-5',
  autoAcceptPermissions: false,
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
      cachedSettings.claudePath = detectClaudePath()
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

export function detectClaudePath(): string {
  // 1. Try PATH lookup
  try {
    const cmd = process.platform === 'win32' ? 'where claude' : 'which claude'
    const result = execSync(cmd, { encoding: 'utf-8', timeout: 5000 }).trim()
    const firstLine = result.split('\n')[0].trim()
    if (firstLine && fs.existsSync(firstLine)) return firstLine
  } catch {
    // not found in PATH
  }

  // 2. Try common Windows locations
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || ''
    const candidates = [
      path.join(appData, 'npm', 'claude.cmd'),
      path.join(appData, 'npm', 'claude'),
      'C:\\Program Files\\nodejs\\claude.cmd',
    ]
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) return candidate
    }
  }

  // 3. Try common Unix locations
  const unixCandidates = [
    '/usr/local/bin/claude',
    '/usr/bin/claude',
    path.join(app.getPath('home'), '.npm-global', 'bin', 'claude'),
  ]
  for (const candidate of unixCandidates) {
    if (fs.existsSync(candidate)) return candidate
  }

  return ''
}
