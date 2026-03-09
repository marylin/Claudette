import { useCallback, useEffect } from 'react'
import { useSessionStore } from '../store/session.store'
import { useAppStore } from '../store/app.store'
import type { Session } from '@shared/types'

export function useSession() {
  const sessions = useSessionStore((s) => s.sessions)
  const setSessions = useSessionStore((s) => s.setSessions)
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const setActiveSessionId = useSessionStore((s) => s.setActiveSessionId)
  const setSessionsLoading = useSessionStore((s) => s.setSessionsLoading)
  const sessionsLoading = useSessionStore((s) => s.sessionsLoading)
  const clearMessages = useSessionStore((s) => s.clearMessages)
  const activeProject = useAppStore((s) => s.activeProject)

  const fetchSessions = useCallback(async () => {
    if (!activeProject) return
    setSessionsLoading(true)
    try {
      const result = await window.electronAPI.listSessions(activeProject.path)
      setSessions(result)
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
    } finally {
      setSessionsLoading(false)
    }
  }, [activeProject, setSessions, setSessionsLoading])

  // Fetch sessions when project changes
  useEffect(() => {
    if (activeProject) {
      fetchSessions()
    } else {
      setSessions([])
    }
  }, [activeProject, fetchSessions, setSessions])

  const resumeSession = useCallback(
    (session: Session) => {
      setActiveSessionId(session.id)
      clearMessages()
    },
    [setActiveSessionId, clearMessages]
  )

  const createNewSession = useCallback(() => {
    setActiveSessionId(null)
    clearMessages()
  }, [setActiveSessionId, clearMessages])

  return {
    sessions,
    activeSessionId,
    sessionsLoading,
    fetchSessions,
    resumeSession,
    createNewSession,
  }
}
