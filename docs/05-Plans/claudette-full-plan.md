# Claudette — Full Implementation Plan (All Phases)

## Summary
Complete implementation of Claudette from empty stubs to v1.0 stable launch. Covers all features from the PRD (F-01 through F-45) and all phases from the features plan (v0.1 through v1.0). Current state: ~3% done (config + types + docs only, all 52 source files are 0 bytes, vite.config.ts missing).

---

## Phase 0.1 — Core Shell (MVP)
> **Goal**: Working app that replaces the terminal for everyday Claude Code use. Ship the `.exe` installer.
> **PRD Coverage**: F-01–F-06, F-08–F-16, F-18–F-20, F-42–F-44
> **Exit Criteria**: Windows user installs `.exe`, opens project, chats with Claude, sees streaming responses using existing subscription.

### 0.1-A: Build Infrastructure
1. [S] Create `vite.config.ts` — React plugin, path aliases (@/*, @shared/*), dev server config for Electron renderer
2. [S] Create `src/main/preload.ts` — contextBridge exposing typed IPC methods to renderer (Electron security requirement)
3. [S] Run `npm install` — verify clean install of all deps
4. [S] Verify build pipeline — `tsc --noEmit` passes, Vite builds renderer

### 0.1-B: Main Process
5. [M] `src/main/index.ts` — Electron app lifecycle, frameless BrowserWindow (dark bg #0d0f12), preload script, dev/prod URL loading, window controls IPC (minimize/maximize/close)
6. [M] `src/main/ipc-handlers.ts` — register all IPC handlers from IpcChannels type, wire to bridge/session/settings modules
7. [L] `src/main/claude-bridge.ts` — spawn claude CLI (Windows: `cmd /c claude`), readline streaming, claude:output/status events, permission prompt detection, process kill, output buffering (F-11, F-14, F-15, F-16)
8. [M] `src/main/session-manager.ts` — read `~/.claude/projects/`, decode dir names, parse JSONL session files, return Project[]/Session[] (F-05, F-06, F-08)
9. [S] `src/main/settings.ts` — read/write JSON to userData, auto-detect claude CLI path: where/which → %APPDATA%\npm → user config (F-01, F-04, F-42)

### 0.1-C: Renderer Foundation
10. [S] `src/renderer/index.html` — Vite entry, root div, meta tags
11. [S] `src/renderer/main.tsx` — ReactDOM.createRoot, import globals.css
12. [M] `src/renderer/styles/globals.css` — Tailwind directives, Geist font import, custom thin scrollbar (2px accent), dark body
13. [M] `src/renderer/App.tsx` — root layout: TitleBar + Sidebar + TabBar + MainPanel + TerminalPanel + StatusBar

### 0.1-D: State Management
14. [M] `app.store.ts` — activeProject, activeTab, sidebarCollapsed, settings, claudeStatus, actions
15. [M] `session.store.ts` — sessions[], activeSessionId, messages[], isStreaming, streaming buffer flush (16ms)
16. [S] `project.store.ts` — projects[], loading, fetchProjects via IPC

### 0.1-E: Shared UI Components
17. [S] `Button.tsx` — primary/secondary/ghost/danger variants, sm/md/lg sizes, loading state
18. [S] `Badge.tsx` — default/success/warning/error/info variants
19. [S] `EmptyState.tsx` — icon + title + description + optional CTA

### 0.1-F: Layout Components
20. [M] `TitleBar.tsx` — frameless, draggable region, app name, window control buttons via IPC
21. [L] `Sidebar.tsx` — project list from IPC, active highlight, last session time, collapsed icon-rail (48px), "Open folder" button (F-07), session list expandable, empty state
22. [M] `TabBar.tsx` — Chat/Files/Git/Agents/Usage tabs, active state, Lucide icons
23. [S] `StatusBar.tsx` — connection dot + status, project name, branch, token count, terminal toggle

### 0.1-G: Chat System
24. [L] `ChatPanel.tsx` — message list, auto-scroll, streaming buffer (useRef, flush 16ms), scroll-to-bottom FAB, empty state (F-11, F-14)
25. [L] `MessageBubble.tsx` — user (right, accent) / assistant (left, markdown via react-markdown + remark-gfm) / system (centered), code blocks with highlight.js + copy button, tool use collapsible, timestamp hover (F-12, F-13)
26. [M] `ChatInput.tsx` — multi-line textarea (Shift+Enter/Enter), send/stop toggle, model selector, disabled when no project (F-16)
27. [S] `StreamingIndicator.tsx` — animated pulsing dots (F-14)
28. [M] `useClaudeBridge.ts` — subscribe to claude:output/status IPC, send/stop, manage streaming state
29. [M] Permission prompt detection — inline approve/deny buttons in chat when detected (F-15)

### 0.1-H: Session Management
30. [M] `useSession.ts` — list sessions, resume (claude --resume), create new, sync with store (F-08, F-09, F-10)
31. [S] Session list UI in sidebar — expandable under project, "New Session" + "Resume" buttons, date formatting

### 0.1-I: Terminal Panel
32. [M] `TerminalPanel.tsx` — xterm.js + fit addon + web-links addon, design system colors, resize handle, collapse/expand, lazy init (F-18, F-19, F-20)

### 0.1-J: Onboarding & Settings
33. [M] Onboarding screen — shown if CLI not detected, install instructions link, auth check, open first project, skip button (F-02, F-03)
34. [M] Settings panel — CLI path input + auto-detect, model selector, auto-accept toggle, font size slider, open config folder (F-42, F-43, F-44)

### 0.1-K: Build & Package
35. [S] Create app icons — `assets/icon.ico` + `assets/icon.png` (violet "C" logo)
36. [M] Verify full build — `npm run dev` launches, `npm run dist:win` produces `.exe` (NSIS, dir selection, desktop shortcut)
37. [S] GitHub Actions workflow — build on push to main, attach artifacts to release
38. [S] Update README.md — badge set, install instructions, feature list, screenshots placeholder

---

## Phase 0.2 — Visual Power
> **Goal**: Features that make Claudette genuinely better than VS Code extensions. Files, git, agents, CLAUDE.md editor.
> **PRD Coverage**: F-21–F-37
> **Exit Criteria**: Full Claude Code session → review changes in git panel → commit → edit CLAUDE.md → save agents — without another app.

### 0.2-A: File Explorer
39. [M] `fs:readdir` and `fs:readfile` IPC handlers in main process — recursive dir read, ignore node_modules/.git/dist
40. [L] `FileExplorer.tsx` — tab panel container with search/filter input (F-21)
41. [L] `FileTree.tsx` — recursive tree, lazy-load, file type icons (Lucide + extension mapping), expand/collapse, modified file highlight, right-click context menu (Open, Copy Path, Reveal in Explorer) (F-22, F-24)
42. [M] `CodeViewer.tsx` — Monaco Editor read-only, language auto-detect, line numbers, word wrap toggle, "Open in default editor" button (F-23)

### 0.2-B: Git Panel
43. [M] `src/main/git-manager.ts` — simple-git wrapper: getStatus, getDiff, stage, unstage, commit, getBranch, graceful fallback if not git repo (F-29)
44. [M] `GitPanel.tsx` — changed files list + diff view container (F-25)
45. [M] `DiffViewer.tsx` — Monaco diff view (original vs modified), color-coded additions/deletions, line navigation (F-26)
46. [M] `CommitPanel.tsx` — file list with stage/unstage checkboxes, commit message textarea, commit button (disabled if no staged/empty msg), branch + ahead/behind indicator (F-27, F-28)
47. [S] `useGit.ts` — poll git status every 2s when Git tab active, auto-refresh after Claude session ends

### 0.2-C: CLAUDE.md Editor
48. [S] `claude-md:read` and `claude-md:write` IPC handlers in main process
49. [L] `ClaudeMdPanel.tsx` — left: Monaco markdown editor with autosave indicator, right: live preview (react-markdown + remark-gfm), split pane resize, Ctrl+S save, unsaved indicator in tab, "Create CLAUDE.md" button if missing (F-30, F-31, F-32, F-33)
50. [S] Sidebar dot indicator — show if CLAUDE.md exists in project

### 0.2-D: Agents Manager
51. [S] `src/main/agents-manager.ts` — store agents JSON in userData/agents.json, CRUD, validate schema (F-34)
52. [M] `AgentsPanel.tsx` — grid of agent cards, empty state (F-34)
53. [M] `AgentCard.tsx` — name, description, model badge, tool count, edit/delete buttons, "Launch" button (F-37)
54. [M] `AgentEditor.tsx` — name, description, system prompt (Monaco markdown), model selector (Sonnet/Opus/Haiku), tool permission checkboxes, create/update/cancel buttons (F-35, F-36)
55. [S] `agents:list`, `agents:save`, `agents:delete`, `agents:run` IPC handler wiring

### 0.2-E: Additional Shared UI
56. [S] `Tooltip.tsx` — Radix UI tooltip wrapper, consistent delay/styling
57. [S] `ContextMenu.tsx` — Radix UI context menu wrapper
58. [S] `ResizeHandle.tsx` — drag handle for panel resizing (terminal, CLAUDE.md split)
59. [S] `LoadingSpinner.tsx` — animated spinner, sm/md/lg
60. [S] `KeyboardShortcut.tsx` — renders Ctrl+K style shortcut badges

### 0.2-F: Keyboard Shortcuts
61. [M] Global keyboard shortcut system — Ctrl+N (new session), Ctrl+K (command palette placeholder), Ctrl+` (toggle terminal), Ctrl+B (toggle sidebar), Ctrl+1–5 (switch tabs), Ctrl+S (save CLAUDE.md), Escape (stop Claude / close modals)

### 0.2-G: Animations & Polish
62. [M] Tab transitions (fade 100ms), sidebar slide on collapse/expand, message appear (slide up + fade), streaming pulse, button hover/active (100ms), terminal slide, loading skeleton screens on project/session lists

---

## Phase 0.3 — Intelligence
> **Goal**: Analytics, polish, auto-updater. Ready for Product Hunt.
> **PRD Coverage**: F-38–F-41, F-45
> **Exit Criteria**: Stable, polished, real screenshots in README, auto-updates, ready for public sharing.

### 0.3-A: Usage Dashboard
63. [M] `src/main/usage-analyzer.ts` — parse session JSONL for token counts, aggregate by day/model, estimate cost with pricing constants, cache parsed data (F-38)
64. [M] `UsagePanel.tsx` — dashboard layout with summary cards + chart container (F-38)
65. [M] `TokenChart.tsx` — Recharts bar chart, daily input vs output tokens, 30-day range, date range picker, hover tooltip (F-39)
66. [M] `CostSummary.tsx` — total spend, daily average, most-used model, session count, projected monthly cost (F-40)
67. [S] Model breakdown table — model → input/output tokens → cost (F-41)
68. [S] `usage:get` IPC handler wiring

### 0.3-B: Command Palette
69. [L] `CommandPalette.tsx` (Ctrl+K) — fuzzy search across projects/sessions/agents/settings, keyboard nav (arrows + Enter), recent items, actions (New Session, Open Project, Open Settings), animated slide-down + blur bg

### 0.3-C: Notifications & Toasts
70. [M] `ToastProvider.tsx` — toast notification stack (top-right), success/error/warning/info types, auto-dismiss 4s, manual dismiss, hook: useToast()
71. [S] Wire toasts — commit success, save success, agent created, session resumed, errors

### 0.3-D: Auto-Updater
72. [M] electron-updater integration — check on launch (silent), update notification in title bar, "Download and install" button, changelog from GitHub release notes

### 0.3-E: Error Handling Hardening
73. [M] Global React error boundary — catches renderer crashes, shows reload button
74. [S] IPC error envelope — all handlers return `{ data, error }` pattern
75. [S] Session JSONL parse errors — skip malformed, log to console
76. [S] Git failure inline errors — show in git panel, not modal
77. [S] Claude crash detection — "Claude stopped unexpectedly" banner + restart button

### 0.3-F: Performance Optimization
78. [M] Virtual list for file tree — react-window or manual virtualization for 10k+ files
79. [M] Message list virtualization — handle 1000+ messages without lag
80. [S] Debounce git status polling — 500ms after file change events
81. [S] Monaco lazy-load — only import when Files tab first opened
82. [S] xterm.js lazy-load — only initialize when terminal first opened

### 0.3-G: Accessibility
83. [M] Keyboard navigation — all interactive elements navigable, focus trap in modals
84. [S] ARIA labels — icon-only buttons, sufficient color contrast (WCAG AA)
85. [S] Reduced motion — `@media (prefers-reduced-motion)` disables animations

### 0.3-H: Documentation Polish
86. [S] README.md — add real screenshots from built app
87. [M] CONTRIBUTING.md — architecture walkthrough, how to add a tab, how IPC works
88. [S] CHANGELOG.md — keep-a-changelog format
89. [M] In-app help — keyboard shortcut reference panel (? key), tooltips on all non-obvious UI
90. [S] Font size setting wiring (F-45)

---

## Phase 0.4 — Ecosystem
> **Goal**: Power features for advanced users. Build community momentum.
> **PRD Coverage**: Beyond initial F-01–F-45, advanced features.
> **Exit Criteria**: MCP management, checkpoint timelines, multi-workspace. Community PRs flowing.

### 0.4-A: MCP Server Manager
91. [M] `src/main/mcp-manager.ts` — read MCP configs from ~/.claude/, add/edit/remove entries, test connection
92. [L] `MCPPanel.tsx` — list MCP servers with status badges, add server form (name, type stdio/sse/http, URL/command, env vars), import from Claude Desktop config, enable/disable toggle

### 0.4-B: Multi-Workspace
93. [L] Multi-workspace support — open multiple project folders, workspace tabs at sidebar top, independent sessions/git/files per workspace, save/restore on restart, "Open in new workspace" context menu

### 0.4-C: Session Checkpoints (Timeline)
94. [L] Checkpoint system — save session state at point in time, timeline view with timestamps/descriptions, restore to checkpoint (revert files), auto-checkpoint before Claude response (configurable), checkpoint diff view

### 0.4-D: Prompt Templates
95. [M] Template system — built-in library (refactor, explain, write tests, document), custom creation with `{{variable}}` placeholders, template picker in chat input (`/` command), import/export as JSON, community import via URL

### 0.4-E: GitHub Integration
96. [M] GitHub integration — link project to repo, PR status in status bar, "Create PR" button (opens browser to pre-filled PR), open issues list (read-only)

---

## Phase 1.0 — Stable Launch
> **Goal**: Production quality. Public launch. Canonical Windows Claude Code GUI.
> **Exit Criteria**: Stable on all platforms, 1000+ GitHub stars, real testimonials, developer newsletter mention.

### 1.0-A: Final Polish Pass
97. [M] Dark mode audit — no unintended light backgrounds anywhere
98. [S] Typography audit — consistent sizing, weight, spacing throughout
99. [S] Animation audit — all transitions snappy, not janky
100. [S] Empty state audit — every list has meaningful empty state
101. [S] Loading state audit — every async operation has loading indicator
102. [S] Error state audit — every failure has friendly message

### 1.0-B: Testing
103. [L] Electron integration tests — Playwright for IPC handlers
104. [M] Unit tests — session-manager.ts, git-manager.ts, usage-analyzer.ts, claude-bridge.ts
105. [M] Manual test matrix — Windows 10, Windows 11, macOS 13+, Ubuntu 22
106. [S] Auth testing — both subscription and API key auth
107. [S] Edge case testing — empty ~/.claude/, large projects (10k+ files), malformed JSONL

### 1.0-C: Release Infrastructure
108. [M] GitHub Releases — proper changelogs, auto-update feed from releases
109. [S] Code signing for Windows — reduces SmartScreen warnings
110. [S] SECURITY.md — vulnerability disclosure policy
111. [S] Issue templates — bug report + feature request
112. [S] PR template

### 1.0-D: Launch Assets
113. [M] Banner image — `docs/screenshots/banner.png` (1280×640px)
114. [S] 4+ screenshots — all major panels
115. [M] 60-second demo GIF or video
116. [S] Product Hunt listing draft
117. [S] Show HN post draft

### 1.0-E: Community Setup
118. [S] GitHub Discussions — Q&A, ideas, show-and-tell categories
119. [S] Labels — `good-first-issue`, `help-wanted` on appropriate issues
120. [S] Response SLA — acknowledge issues within 48 hours (documented)

---

## Task Summary

| Phase | Tasks | S | M | L | PRD Reqs Covered |
|-------|-------|---|---|---|------------------|
| 0.1 Core Shell | 1–38 | 14 | 18 | 6 | F-01–F-16, F-18–F-20, F-42–F-44 |
| 0.2 Visual Power | 39–62 | 11 | 10 | 3 | F-21–F-37 |
| 0.3 Intelligence | 63–90 | 14 | 11 | 1 | F-38–F-41, F-45 |
| 0.4 Ecosystem | 91–96 | 0 | 3 | 3 | Beyond initial PRD |
| 1.0 Stable Launch | 97–120 | 15 | 6 | 2 | Quality + launch |
| **Total** | **120** | **54** | **48** | **15** | **All F-01–F-45 + extras** |

## PRD Requirements Coverage Matrix

| Req | Description | Task(s) |
|-----|-------------|---------|
| F-01 | Auto-detect Claude CLI path | 9 |
| F-02 | Setup screen if CLI not found | 33 |
| F-03 | OAuth subscription + API key auth | 33 |
| F-04 | Persist settings across sessions | 9 |
| F-05 | Read ~/.claude/projects/, list in sidebar | 8, 21 |
| F-06 | Last session date + count per project | 8, 21 |
| F-07 | Open new folder via picker | 21 |
| F-08 | List past sessions for active project | 8, 30 |
| F-09 | Resume past session via --resume | 30 |
| F-10 | Create new session | 30 |
| F-11 | Stream stdout/stderr real time | 7, 24 |
| F-12 | Render markdown in assistant messages | 25 |
| F-13 | Syntax highlight code blocks | 25 |
| F-14 | Streaming indicator | 27 |
| F-15 | Detect permission prompts → UI buttons | 29 |
| F-16 | Stop button mid-response | 26 |
| F-17 | Token count + model in chat header | 23 (status bar) |
| F-18 | Embed xterm.js terminal | 32 |
| F-19 | Collapse/expand terminal | 32 |
| F-20 | Sync terminal with chat process | 32 |
| F-21 | File tree of project root | 40, 41 |
| F-22 | Expand/collapse directories | 41 |
| F-23 | Open files in Monaco viewer | 42 |
| F-24 | Highlight modified files | 41 |
| F-25 | Show branch, modified, staged, untracked | 44 |
| F-26 | Inline diff for modified file | 45 |
| F-27 | Stage/unstage via checkbox | 46 |
| F-28 | Commit message + submit | 46 |
| F-29 | Hide git tab if not git repo | 43 |
| F-30 | CLAUDE.md in Monaco editor | 49 |
| F-31 | Live markdown preview pane | 49 |
| F-32 | Ctrl+S to save | 49 |
| F-33 | Create CLAUDE.md if missing | 49 |
| F-34 | List all saved agents | 52 |
| F-35 | Create agent with full config | 54 |
| F-36 | Edit and delete agents | 54 |
| F-37 | Launch session with agent | 53 |
| F-38 | Parse JSONL for token usage | 63 |
| F-39 | Daily token usage bar chart | 65 |
| F-40 | Total cost estimate | 66 |
| F-41 | Breakdown by model | 67 |
| F-42 | Configure CLI path manually | 34 |
| F-43 | Select default model | 34 |
| F-44 | Toggle auto-accept permissions | 34 |
| F-45 | Configure font size | 90 |

## Dependencies Between Phases
- Phase 0.2 requires Phase 0.1 complete (app must run first)
- Phase 0.3 requires Phase 0.2 complete (analytics parses sessions, polish assumes all panels exist)
- Phase 0.4 requires Phase 0.3 complete (stability + error handling needed before advanced features)
- Phase 1.0 requires Phase 0.4 complete (full feature set before final polish + launch)
