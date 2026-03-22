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

export function detectClaudePath(): string {
  // Try common methods to find claude CLI
  const candidates: string[] = []

  // 1. Try `where` (Windows) or `which` (Unix)
  try {
    const cmd = process.platform === 'win32' ? 'where claude' : 'which claude'
    const result = execSync(cmd, { encoding: 'utf-8', timeout: 5000 }).trim()
    if (result) {
      // `where` on Windows can return multiple lines — take the first
      const firstLine = result.split('\n')[0].trim()
      if (firstLine && fs.existsSync(firstLine)) return firstLine
    }
  } catch {
    // Not found via PATH
  }

  // 2. Check common Windows install locations
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || ''
    candidates.push(
      path.join(appData, 'npm', 'claude.cmd'),
      path.join(appData, 'npm', 'claude'),
      'C:\\Program Files\\nodejs\\claude.cmd',
    )
    // Also check local npm prefix
    try {
      const prefix = execSync('npm config get prefix', { encoding: 'utf-8', timeout: 5000 }).trim()
      if (prefix) candidates.push(path.join(prefix, 'claude.cmd'), path.join(prefix, 'claude'))
    } catch { /* skip */ }
  } else {
    candidates.push(
      '/usr/local/bin/claude',
      '/usr/bin/claude',
      path.join(app.getPath('home'), '.npm-global', 'bin', 'claude'),
    )
  }

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) return candidate
    } catch { /* skip */ }
  }

  return ''
}

