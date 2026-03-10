import { create } from 'zustand'
import type { Session, Message } from '@shared/types'

interface SessionState {
  // Session list
  sessions: Session[]
  activeSessionId: string | null
  sessionsLoading: boolean

  // Messages
  messages: Message[]
  isStreaming: boolean
  draft: string

  // Actions
  setSessions: (sessions: Session[]) => void
  setActiveSessionId: (id: string | null) => void
  setSessionsLoading: (loading: boolean) => void
  addMessage: (message: Message) => void
  updateLastMessage: (content: string) => void
  clearMessages: () => void
  setIsStreaming: (streaming: boolean) => void
  setDraft: (draft: string) => void
}

let messageIdCounter = 0

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  sessionsLoading: false,
  messages: [],
  isStreaming: false,
  draft: '',

  setSessions: (sessions) => set({ sessions }),
  setActiveSessionId: (id) => set({ activeSessionId: id }),
  setSessionsLoading: (loading) => set({ sessionsLoading: loading }),

  addMessage: (message) =>
    set((s) => ({
      messages: [...s.messages, { ...message, id: message.id || `msg-${++messageIdCounter}` }],
    })),

  updateLastMessage: (content) =>
    set((s) => {
      const messages = [...s.messages]
      // Scan backward for the last assistant message (system messages from
      // tool-use summaries may be interspersed during streaming)
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'assistant') {
          messages[i] = { ...messages[i], content: messages[i].content + content }
          return { messages }
        }
      }
      return { messages }
    }),

  clearMessages: () => set({ messages: [], activeSessionId: null }),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  setDraft: (draft) => set({ draft }),
}))
