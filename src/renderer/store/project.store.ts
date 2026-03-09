import { create } from 'zustand'
import type { Project } from '@shared/types'

interface ProjectState {
  projects: Project[]
  loading: boolean
  lastRefresh: number | null

  // Actions
  setProjects: (projects: Project[]) => void
  setLoading: (loading: boolean) => void
  fetchProjects: () => Promise<void>
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  loading: false,
  lastRefresh: null,

  setProjects: (projects) => set({ projects, lastRefresh: Date.now() }),
  setLoading: (loading) => set({ loading }),

  fetchProjects: async () => {
    set({ loading: true })
    try {
      const projects = await window.electronAPI.listProjects()
      set({ projects, loading: false, lastRefresh: Date.now() })
    } catch (err) {
      console.error('Failed to fetch projects:', err)
      set({ loading: false })
    }
  },
}))
