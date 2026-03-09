# Phase 0.1 — Core Shell Plan

## Summary
Build the Claudette MVP: a working Electron + React app that wraps Claude Code CLI in a polished GUI. Users install the `.exe`, open a project, chat with Claude, and see streaming responses — all using their existing subscription. This covers the entire v0.1 scope from `claudette-features-plan.md`.

## Current State
- Config files done: package.json, tsconfig.json, tsconfig.main.json, tailwind.config.js
- `src/shared/types.ts` fully typed
- All 52 source files exist but are **0 bytes** (empty stubs)
- **Missing**: vite.config.ts (critical blocker)
- electron-builder config embedded in package.json (acceptable)
- No node_modules installed

## Tasks

### Build Infrastructure
1. [S] Create `vite.config.ts` — Vite config for renderer with React plugin, path aliases matching tsconfig, dev server for HMR
2. [S] Create `src/main/preload.ts` — contextBridge exposing IPC methods to renderer (required for Electron security)
3. [S] Install dependencies — `npm install` and verify clean install
4. [S] Verify build pipeline — `tsc --noEmit` passes for both tsconfig files, Vite builds renderer

### Main Process (Electron Backend)
5. [M] Implement `src/main/index.ts` — Electron app lifecycle, BrowserWindow (frameless, dark bg), preload script, dev/prod URL loading, window controls IPC
6. [M] Implement `src/main/ipc-handlers.ts` — register all IPC handlers from types.ts IpcChannels, wire to bridge/session/settings modules
7. [L] Implement `src/main/claude-bridge.ts` — spawn claude CLI via child_process (Windows: `cmd /c claude`), readline streaming, status events, permission prompt detection, process kill, output buffering
8. [M] Implement `src/main/session-manager.ts` — read `~/.claude/projects/`, decode dir names, parse JSONL session files for metadata, return typed Project[] and Session[]
9. [S] Implement `src/main/settings.ts` — read/write settings JSON to `app.getPath('userData')`, auto-detect claude CLI path (where/which → common paths → user config)

### Renderer Foundation
10. [S] Implement `src/renderer/index.html` — Vite entry point with root div, meta tags, CSP
11. [S] Implement `src/renderer/main.tsx` — ReactDOM.createRoot, import globals.css
12. [M] Implement `src/renderer/styles/globals.css` — Tailwind directives, Geist font import, custom thin scrollbar, base resets, dark theme body
13. [M] Implement `src/renderer/App.tsx` — root layout composing TitleBar + Sidebar + TabBar + MainPanel + TerminalPanel + StatusBar, responsive grid

### State Management
14. [M] Implement `src/renderer/store/app.store.ts` — activeProject, activeTab, sidebarCollapsed, settings, claudeStatus, theme state, actions
15. [M] Implement `src/renderer/store/session.store.ts` — sessions[], activeSessionId, messages[], isStreaming, addMessage, clearMessages, streaming buffer flush
16. [S] Implement `src/renderer/store/project.store.ts` — projects[], loading, fetchProjects action via IPC

### Shared UI Components
17. [S] Implement `src/renderer/components/shared/Button.tsx` — variants: primary/secondary/ghost/danger, sizes: sm/md/lg, loading state
18. [S] Implement `src/renderer/components/shared/Badge.tsx` — variants: default/success/warning/error/info
19. [S] Implement `src/renderer/components/shared/EmptyState.tsx` — icon + title + description + optional CTA

### Layout Components
20. [M] Implement `TitleBar.tsx` — custom frameless title bar, draggable region, app name, minimize/maximize/close buttons via IPC
21. [L] Implement `Sidebar.tsx` — project list from IPC, active highlight, last session time, collapsed icon-rail mode (48px), "Open folder" button, session list expandable under project, empty state
22. [M] Implement `TabBar.tsx` — tabs: Chat · Files · Git · Agents · Usage, active state, icons (Lucide), keyboard shortcuts Ctrl+1–5
23. [S] Implement `StatusBar.tsx` — connection dot + status, project name, branch, token count, terminal toggle button

### Chat System (Core Feature)
24. [L] Implement `ChatPanel.tsx` — message list with auto-scroll, streaming buffer (flush every 16ms via useRef), message grouping by role, scroll-to-bottom FAB, empty state
25. [L] Implement `MessageBubble.tsx` — user (right, accent bg) / assistant (left, surface bg, markdown via react-markdown + remark-gfm) / system (centered, muted), code blocks with syntax highlight + copy button, tool use collapsible blocks, timestamp on hover
26. [M] Implement `ChatInput.tsx` — multi-line textarea (Shift+Enter newline, Enter send), send/stop button toggle, disabled when no project, model selector dropdown, character count
27. [S] Implement `StreamingIndicator.tsx` — animated pulsing dots
28. [M] Implement `useClaudeBridge.ts` hook — subscribe to claude:output/status IPC events, send messages, stop, manage streaming state

### Session Management
29. [M] Implement `useSession.ts` hook — list sessions, resume (claude --resume), create new session, session state sync with store

### Terminal Panel
30. [M] Implement `TerminalPanel.tsx` — xterm.js instance with fit addon + web-links addon, design system colors, resize handle, collapse/expand toggle, lazy init on first open

### Onboarding
31. [M] Implement onboarding screen — shown when Claude CLI not detected, install instructions, auth check, open first project, skip button (can be inline in Sidebar or a modal)

### Settings
32. [M] Implement settings panel — Claude CLI path input + auto-detect button, default model selector, auto-accept toggle, font size slider, open config folder button (can be a tab or modal)

### Build & Package
33. [S] Create app icon files — `assets/icon.ico` (Windows), `assets/icon.png` (generic) — simple violet "C" logo
34. [M] Verify full build — `npm run dev` launches app, `npm run dist:win` produces `.exe` installer
35. [S] Update README.md with actual dev setup instructions if needed

## Dependencies
- Tasks 1–4 must complete first (build infrastructure)
- Tasks 5–9 (main process) can run in parallel but before renderer components
- Tasks 10–13 (renderer foundation) depend on task 1 (vite config)
- Tasks 14–16 (stores) depend on 10–13
- Tasks 17–19 (shared UI) can run after 10–13
- Tasks 20–23 (layout) depend on 14–16 (stores) and 17–19 (shared UI)
- Tasks 24–30 (chat + terminal) depend on 20–23 (layout) and 5–9 (main process IPC)
- Tasks 31–32 (onboarding + settings) can run after layout
- Tasks 33–35 (packaging) run last

## Build Order (strict)
```
Wave 1: Tasks 1–4    (infrastructure)
Wave 2: Tasks 5–9    (main process) + Tasks 10–13 (renderer foundation) — parallel
Wave 3: Tasks 14–16  (stores) + Tasks 17–19 (shared UI) — parallel
Wave 4: Tasks 20–23  (layout components)
Wave 5: Tasks 24–30  (chat + session + terminal)
Wave 6: Tasks 31–32  (onboarding + settings)
Wave 7: Tasks 33–35  (icons + build + readme)
```

## Open Questions
None — all decisions are pre-made in CLAUDE.md and PRD. Build autonomously per the non-negotiable principles.

## Estimate
- 35 tasks: 8 S + 17 M + 4 L
- ~8,000–10,000 LOC across all files
- Estimated effort: This is the entire Phase 0.1 from the features plan
