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
  const log = useDebugLog((s) => s.addEntry)

  // Buffer for streaming output
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
    const cleanupCommand = window.electronAPI.onClaudeCommand?.((data) => {
      log('claude:command', 'in', data)
      if (data.action === 'clear') {
        clearMessages()
      }
    })

    const cleanupOutput = window.electronAPI.onClaudeOutput((data) => {
      log('claude:output', 'in', data)

      if (data.type === 'system') {
        addMessage({
          id: `msg-system-${Date.now()}`,
          role: 'system',
          content: data.text,
          timestamp: new Date(),
        })
        return
      }

      if (data.type === 'stderr') {
        addMessage({
          id: `msg-system-${Date.now()}`,
          role: 'system',
          content: data.text,
          timestamp: new Date(),
        })
        return
      }

      // Buffer stdout for 16ms batching
      bufferRef.current += (bufferRef.current ? '\n' : '') + data.text

      if (!flushTimerRef.current) {
        flushTimerRef.current = setTimeout(flushBuffer, 16)
      }
    })

    const cleanupStatus = window.electronAPI.onClaudeStatus((data) => {
      log('claude:status', 'in', data)
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

    return () => {
      cleanupCommand?.()
      cleanupOutput()
      cleanupStatus()
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current)
      }
    }
  }, [addMessage, updateLastMessage, setIsStreaming, setClaudeStatus, flushBuffer, clearMessages, log])

  const sendMessage = useCallback(
    (message: string) => {
      log('claude:send', 'out', { message, sessionId: activeSessionId })

      addMessage({
        id: `msg-user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date(),
      })

      window.electronAPI.sendMessage(message, activeSessionId || undefined)
    },
    [addMessage, activeSessionId, log]
  )

  const stopClaude = useCallback(() => {
    log('claude:stop', 'out', {})
    window.electronAPI.stopClaude()
  }, [log])

  return { sendMessage, stopClaude, isStreaming, messages }
}
