import { create } from 'zustand'
import type { Project, Settings, ClaudeStatus, CostEvent } from '@shared/types'

export type TabId = 'chat' | 'files' | 'git' | 'agents' | 'usage'

interface AppState {
  // Active state
  activeProject: Project | null
  activeTab: TabId
  sidebarCollapsed: boolean
  terminalVisible: boolean

  // Claude status
  claudeStatus: ClaudeStatus
  lastCost: CostEvent | null

  // Settings
  settings: Settings | null
  settingsOpen: boolean

  // Actions
  setActiveProject: (project: Project | null) => void
  setActiveTab: (tab: TabId) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleTerminal: () => void
  setTerminalVisible: (visible: boolean) => void
  setClaudeStatus: (status: ClaudeStatus) => void
  setLastCost: (cost: CostEvent) => void
  setSettings: (settings: Settings) => void
  setSettingsOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeProject: null,
  activeTab: 'chat',
  sidebarCollapsed: false,
  terminalVisible: false,
  claudeStatus: { status: 'idle' },
  lastCost: null,
  settings: null,
  settingsOpen: false,

  setActiveProject: (project) => set({ activeProject: project }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleTerminal: () => set((s) => ({ terminalVisible: !s.terminalVisible })),
  setTerminalVisible: (visible) => set({ terminalVisible: visible }),
  setClaudeStatus: (status) => set({ claudeStatus: status }),
  setLastCost: (cost) => set({ lastCost: cost }),
  setSettings: (settings) => set({ settings }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
}))
