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
      const lastIdx = messages.length - 1
      if (lastIdx >= 0 && messages[lastIdx].role === 'assistant') {
        messages[lastIdx] = { ...messages[lastIdx], content: messages[lastIdx].content + content }
      }
      return { messages }
    }),

  clearMessages: () => set({ messages: [], activeSessionId: null }),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  setDraft: (draft) => set({ draft }),
}))
