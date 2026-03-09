import { autoUpdater, type UpdateInfo } from 'electron-updater'
import { BrowserWindow } from 'electron'
import { getMainWindow } from './index'

export interface UpdateStatus {
  state: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'ready' | 'error'
  info?: {
    version?: string
    releaseNotes?: string
    releaseDate?: string
  }
  progress?: {
    percent: number
    bytesPerSecond: number
    transferred: number
    total: number
  }
  error?: string
}

let currentStatus: UpdateStatus = { state: 'idle' }

function sendStatus(status: UpdateStatus) {
  currentStatus = status
  const win = getMainWindow()
  if (win && !win.isDestroyed()) {
    win.webContents.send('updater:status', status)
  }
}

export function getUpdateStatus(): UpdateStatus {
  return currentStatus
}

export function initAutoUpdater(): void {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    sendStatus({ state: 'checking' })
  })

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    sendStatus({
      state: 'available',
      info: {
        version: info.version,
        releaseNotes: typeof info.releaseNotes === 'string'
          ? info.releaseNotes
          : Array.isArray(info.releaseNotes)
            ? info.releaseNotes.map((n) => n.note).join('\n')
            : undefined,
        releaseDate: info.releaseDate,
      },
    })
  })

  autoUpdater.on('update-not-available', () => {
    sendStatus({ state: 'not-available' })
  })

  autoUpdater.on('download-progress', (progress) => {
    sendStatus({
      state: 'downloading',
      progress: {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total,
      },
    })
  })

  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    sendStatus({
      state: 'ready',
      info: {
        version: info.version,
        releaseNotes: typeof info.releaseNotes === 'string'
          ? info.releaseNotes
          : Array.isArray(info.releaseNotes)
            ? info.releaseNotes.map((n) => n.note).join('\n')
            : undefined,
        releaseDate: info.releaseDate,
      },
    })
  })

  autoUpdater.on('error', (err) => {
    sendStatus({
      state: 'error',
      error: err.message,
    })
  })

  // Check silently on launch after 5 seconds
  setTimeout(() => {
    checkForUpdates()
  }, 5000)
}

export function checkForUpdates(): void {
  autoUpdater.checkForUpdates().catch((err) => {
    console.error('Update check failed:', err)
    sendStatus({ state: 'error', error: err.message })
  })
}

export function downloadUpdate(): void {
  autoUpdater.downloadUpdate().catch((err) => {
    console.error('Update download failed:', err)
    sendStatus({ state: 'error', error: err.message })
  })
}

export function installUpdate(): void {
  autoUpdater.quitAndInstall(false, true)
}
