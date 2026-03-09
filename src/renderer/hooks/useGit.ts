import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '../store/app.store'
import type { GitStatus } from '@shared/types'

export function useGit() {
  const activeProject = useAppStore((s) => s.activeProject)
  const [status, setStatus] = useState<GitStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!activeProject) return
    setLoading(true)
    try {
      const s = await window.electronAPI.getGitStatus(activeProject.path)
      setStatus(s)
    } catch {
      setStatus(null)
    }
    setLoading(false)
  }, [activeProject])

  useEffect(() => { refresh() }, [refresh])

  return { status, loading, refresh }
}
