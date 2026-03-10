import { useEffect, useRef, useCallback } from 'react'
import { useSessionStore } from '../store/session.store'
import { useAppStore } from '../store/app.store'
import { useDebugLog } from '../components/chat/DebugLog'
import type { ClaudeStatus } from '@shared/types'

export function useClaudeBridge() {
  const addMessage = useSessionStore((s) => s.addMessage)
  const updateLastMessage = useSessionStore((s) => s.updateLastMessage)
  const setIsStreaming = useSessionStore((s) => s.setIsStreaming)
  const isStreaming = useSessionStore((s) => s.isStreaming)
  const messages = useSessionStore((s) => s.messages)
  const setClaudeStatus = useAppStore((s) => s.setClaudeStatus)
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const setActiveSessionId = useSessionStore((s) => s.setActiveSessionId)

  // Buffer for streaming output — batch 16ms to avoid React re-render spam
  const bufferRef = useRef('')
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasAssistantMsgRef = useRef(false)

  const flushBuffer = useCallback(() => {
    if (bufferRef.current) {
      const content = bufferRef.current
      bufferRef.current = ''

      if (!hasAssistantMsgRef.current) {
        addMessage({
          id: `msg-assistant-${Date.now()}`,
          role: 'assistant',
          content,
          timestamp: new Date(),
          isStreaming: true,
        })
        hasAssistantMsgRef.current = true
      } else {
        updateLastMessage(content)
      }
    }
    flushTimerRef.current = null
  }, [addMessage, updateLastMessage])

  const clearMessages = useSessionStore((s) => s.clearMessages)

  useEffect(() => {
    // Command events (clear, etc.)
    const cleanupCommand = window.electronAPI.onClaudeCommand?.((data) => {
      if (data.action === 'clear') {
        clearMessages()
      }
    })

    // Streaming text output
    const cleanupOutput = window.electronAPI.onClaudeOutput((data) => {
      if (data.type === 'system') {
        addMessage({
          id: `msg-system-${Date.now()}-${Math.random()}`,
          role: 'system',
          content: data.text,
          timestamp: new Date(),
        })
        return
      }

      if (data.type === 'stderr') {
        addMessage({
          id: `msg-system-${Date.now()}-${Math.random()}`,
          role: 'system',
          content: data.text,
          timestamp: new Date(),
        })
        return
      }

      // Buffer stdout for 16ms batching
      bufferRef.current += data.text
      if (!flushTimerRef.current) {
        flushTimerRef.current = setTimeout(flushBuffer, 16)
      }
    })

    // Status changes
    const cleanupStatus = window.electronAPI.onClaudeStatus((data) => {
      setClaudeStatus(data as ClaudeStatus)

      if (data.status === 'running') {
        setIsStreaming(true)
        hasAssistantMsgRef.current = false
      } else if (data.status === 'idle' || data.status === 'error') {
        // Flush remaining buffer
        if (flushTimerRef.current) {
          clearTimeout(flushTimerRef.current)
          flushBuffer()
        }
        setIsStreaming(false)
        hasAssistantMsgRef.current = false
      }
    })

    // Session ID from SDK
    const cleanupSession = window.electronAPI.onClaudeSession?.((data) => {
      if (data.sessionId) {
        setActiveSessionId(data.sessionId)
      }
    })

    // Cost info
    const cleanupCost = window.electronAPI.onClaudeCost?.((data) => {
      // Store cost in app state for status bar
      useAppStore.getState().setLastCost(data)
    })

    // Debug messages from bridge (file-based logging emitted to renderer)
    const cleanupDebug = window.electronAPI.onClaudeDebug?.((data) => {
      useDebugLog.getState().addEntry('bridge:debug', 'in', data.message)
    })

    return () => {
      cleanupCommand?.()
      cleanupOutput()
      cleanupStatus()
      cleanupSession?.()
      cleanupCost?.()
      cleanupDebug?.()
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current)
      }
    }
  }, [addMessage, updateLastMessage, setIsStreaming, setClaudeStatus, setActiveSessionId, flushBuffer, clearMessages])

  const sendMessage = useCallback(
    (message: string) => {
      addMessage({
        id: `msg-user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date(),
      })

      window.electronAPI.sendMessage(message, activeSessionId || undefined)
    },
    [addMessage, activeSessionId]
  )

  const stopClaude = useCallback(() => {
    window.electronAPI.stopClaude()
  }, [])

  return { sendMessage, stopClaude, isStreaming, messages }
}
