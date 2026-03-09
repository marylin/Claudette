import { IpcMain, dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import { sendMessage, stopClaude } from './claude-bridge'
import { listProjects, listSessions } from './session-manager'
import { getSettings, updateSettings } from './settings'
import type { FileNode } from '../shared/types'

const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', '.next', '__pycache__',
  '.venv', 'venv', '.cache', 'coverage', '.turbo', '.nuxt',
])

export function registerIpcHandlers(ipcMain: IpcMain): void {
  // Claude process
  ipcMain.handle('claude:send', (_event, message: string, sessionId?: string) => {
    sendMessage(message, sessionId)
  })

  ipcMain.handle('claude:stop', () => {
    stopClaude()
  })

  // Projects
  ipcMain.handle('projects:list', () => {
    return listProjects()
  })

  // Sessions
  ipcMain.handle('sessions:list', (_event, projectPath: string) => {
    return listSessions(projectPath)
  })

  ipcMain.handle('sessions:resume', (_event, _sessionId: string) => {
    // Resume is handled via claude:send with sessionId
  })

  ipcMain.handle('sessions:delete', (_event, _sessionId: string) => {
    // TODO: implement session deletion
  })

  // Git (stubs for Phase 0.2)
  ipcMain.handle('git:status', (_event, _projectPath: string) => {
    return { branch: '', files: [], ahead: 0, behind: 0, isRepo: false }
  })

  ipcMain.handle('git:diff', (_event, _projectPath: string, _filePath: string) => {
    return ''
  })

  ipcMain.handle('git:stage', (_event, _projectPath: string, _files: string[]) => {})
  ipcMain.handle('git:unstage', (_event, _projectPath: string, _files: string[]) => {})
  ipcMain.handle('git:commit', (_event, _projectPath: string, _message: string) => {})

  // Agents (stubs for Phase 0.2)
  ipcMain.handle('agents:list', () => [])
  ipcMain.handle('agents:save', (_event, _agent: unknown) => _agent)
  ipcMain.handle('agents:delete', (_event, _agentId: string) => {})
  ipcMain.handle('agents:run', (_event, _agentId: string, _prompt: string) => {})

  // CLAUDE.md
  ipcMain.handle('claude-md:read', (_event, projectPath: string) => {
    const mdPath = path.join(projectPath, 'CLAUDE.md')
    try {
      if (fs.existsSync(mdPath)) {
        return fs.readFileSync(mdPath, 'utf-8')
      }
      return null
    } catch {
      return null
    }
  })

  ipcMain.handle('claude-md:write', (_event, projectPath: string, content: string) => {
    const mdPath = path.join(projectPath, 'CLAUDE.md')
    fs.writeFileSync(mdPath, content, 'utf-8')
  })

  // Usage (stub for Phase 0.3)
  ipcMain.handle('usage:get', () => {
    return {
      daily: [],
      total: { inputTokens: 0, outputTokens: 0, cost: 0, sessions: 0 },
      byModel: {},
    }
  })

  // Settings
  ipcMain.handle('settings:get', () => {
    return getSettings()
  })

  ipcMain.handle('settings:set', (_event, partial: Record<string, unknown>) => {
    return updateSettings(partial as any)
  })

  // File system
  ipcMain.handle('fs:readdir', (_event, dirPath: string) => {
    return readDirectory(dirPath)
  })

  ipcMain.handle('fs:readfile', (_event, filePath: string) => {
    try {
      return fs.readFileSync(filePath, 'utf-8')
    } catch {
      return ''
    }
  })

  // Dialog
  ipcMain.handle('dialog:open-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Open Project Folder',
    })
    return result.canceled ? null : result.filePaths[0]
  })
}

function readDirectory(dirPath: string, depth = 0): FileNode[] {
  if (depth > 5) return []

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    const nodes: FileNode[] = []

    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.env') continue
      if (IGNORED_DIRS.has(entry.name)) continue

      const fullPath = path.join(dirPath, entry.name)

      if (entry.isDirectory()) {
        nodes.push({
          name: entry.name,
          path: fullPath,
          type: 'directory',
          children: readDirectory(fullPath, depth + 1),
        })
      } else {
        nodes.push({
          name: entry.name,
          path: fullPath,
          type: 'file',
          extension: path.extname(entry.name).slice(1),
        })
      }
    }

    // Sort: directories first, then files, alphabetically
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
      return a.name.localeCompare(b.name)
    })

    return nodes
  } catch {
    return []
  }
}
