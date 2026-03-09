# Claudette — Features Plan by Phase

**Project**: Claudette  
**Stack**: Electron + React + TypeScript + Tailwind  
**Goal**: Best Claude Code GUI on GitHub, Windows-native, works with existing subscription

---

## Overview

| Phase | Name | Focus | Target |
|---|---|---|---|
| **v0.1** | Core Shell | Chat + terminal + sessions + `.exe` installer | Month 1 |
| **v0.2** | Visual Power | Files + git + CLAUDE.md editor + agents | Month 2 |
| **v0.3** | Intelligence | Usage analytics + polish + auto-updater | Month 3 |
| **v0.4** | Ecosystem | MCP manager + multi-workspace + plugins | Month 4–5 |
| **v1.0** | Stable Launch | Hardening + Product Hunt + community | Month 6 |

---

## Phase 0.1 — Core Shell
> **Goal**: A working app that replaces the terminal for everyday Claude Code use. Ship the `.exe` installer. Get people off PowerShell.

### 0.1.1 — Project Scaffold & Electron Shell

- [ ] `package.json` with all dependencies (Electron 31, React 18, TypeScript, Tailwind, shadcn/ui)
- [ ] `tsconfig.json` + `tsconfig.main.json` — strict TypeScript for both processes
- [ ] `vite.config.ts` — renderer build
- [ ] `electron-builder.yml` — NSIS `.exe` for Windows, `.dmg` for macOS, `.AppImage` for Linux
- [ ] `tailwind.config.js` — full design system (colors, fonts, spacing tokens)
- [ ] `src/shared/types.ts` — all shared interfaces (Project, Session, Message, Agent, GitStatus, etc.)
- [ ] Frameless Electron window with custom title bar
- [ ] Custom drag region for title bar
- [ ] Native window controls (minimize, maximize, close) positioned for Windows (right side)
- [ ] App icon for all platforms (`icon.ico`, `icon.icns`, `icon.png`)

### 0.1.2 — Main Process Foundation

- [ ] `src/main/index.ts` — Electron app lifecycle, window creation, IPC setup
- [ ] `src/main/ipc-handlers.ts` — all IPC channel registrations stubbed with proper types
- [ ] `src/main/claude-bridge.ts`:
  - Spawn Claude Code CLI via `child_process.spawn`
  - Windows-compatible: `spawn('cmd', ['/c', 'claude', ...args])`
  - Stream stdout/stderr line-by-line via readline
  - Emit `claude:output` events to renderer
  - Emit `claude:status` (idle / running / error)
  - Handle process kill via `claude:stop`
  - Detect permission prompts by pattern-matching output
- [ ] `src/main/session-manager.ts`:
  - Locate `~/.claude/projects/` using `app.getPath('home')` (never hardcode `~`)
  - Read and decode project directory names
  - Parse JSONL session files for metadata (timestamp, message count, summary)
  - Return typed `Project[]` and `Session[]`
- [ ] Auto-detect Claude CLI path:
  1. `where claude` (Windows) / `which claude` (macOS/Linux)
  2. `%APPDATA%\npm\claude.cmd`
  3. User-configured path from settings fallback
- [ ] `src/main/settings.ts` — read/write settings JSON to `app.getPath('userData')`

### 0.1.3 — Base Layout (Renderer)

- [ ] `src/renderer/index.html` — Vite entry point
- [ ] `src/renderer/main.tsx` — React root with Zustand provider
- [ ] `src/renderer/App.tsx` — root layout: sidebar + main panel + terminal + status bar
- [ ] `src/renderer/styles/globals.css` — Tailwind base, custom scrollbar, font imports (Geist)
- [ ] `TitleBar.tsx` — custom frameless title bar with app name, window controls
- [ ] `Sidebar.tsx`:
  - Project list from `projects:list` IPC
  - Active project highlight
  - Last session time display
  - Collapsed icon-rail mode (48px)
  - "Open folder" button → `dialog:open-folder` IPC
  - Empty state: "No projects yet — open a folder to start"
- [ ] `TabBar.tsx` — tabs: Chat · Files · Git · Agents · Usage (hide unavailable tabs gracefully)
- [ ] `StatusBar.tsx` — left: connection dot + status text | center: project name | right: branch + token count

### 0.1.4 — Zustand Stores

- [ ] `app.store.ts` — active project, active tab, sidebar collapsed, settings, claude status
- [ ] `session.store.ts` — sessions list, active session ID, messages array, streaming state
- [ ] `project.store.ts` — projects list, loading state, last refresh timestamp

### 0.1.5 — Chat Panel (Core Feature)

- [ ] `ChatPanel.tsx`:
  - Message list with auto-scroll to bottom
  - Streaming buffer — flush every 16ms to avoid React re-render spam
  - Message grouping by role
  - Empty state: "Start a conversation with Claude"
  - Scroll-to-bottom button when scrolled up
- [ ] `MessageBubble.tsx`:
  - User messages: right-aligned, accent background
  - Assistant messages: left-aligned, surface background, full markdown rendering
  - System messages: centered, muted text
  - Code blocks: syntax highlighted with highlight.js after stream ends, copy button
  - Tool use blocks: collapsed by default, expandable
  - Timestamp on hover
- [ ] `ChatInput.tsx`:
  - Multi-line textarea (Shift+Enter for newline, Enter to send)
  - Send button with loading state
  - Stop button (replaces send while Claude is running)
  - Disabled state when no project selected
  - Model selector dropdown
  - Character/token count indicator
- [ ] `StreamingIndicator.tsx` — animated pulsing dots while streaming
- [ ] Permission prompt detection → inline approve/deny buttons in chat
- [ ] `useClaudeBridge.ts` hook — subscribe to `claude:output` and `claude:status` IPC events

### 0.1.6 — Session Management

- [ ] `useSession.ts` hook — list sessions, resume session, create new session
- [ ] Session list panel in sidebar (expandable under project name)
- [ ] "New Session" button
- [ ] "Resume" button on each past session
- [ ] Session summary display (first user message or Claude-generated summary)
- [ ] Session date/time formatting with `date-fns`

### 0.1.7 — Embedded Terminal

- [ ] `TerminalPanel.tsx`:
  - xterm.js instance connected to Claude Code CLI process
  - `@xterm/addon-fit` for responsive sizing
  - `@xterm/addon-web-links` for clickable links
  - Resize handle (drag to expand/collapse)
  - Toggle button in status bar
  - Matches design system: background `#0d0f12`, font Geist Mono
- [ ] Terminal panel starts collapsed by default, opens on toggle

### 0.1.8 — Onboarding Screen

- [ ] Show on first launch if Claude CLI not detected
- [ ] Step 1: Check if Claude Code installed → link to official install docs
- [ ] Step 2: Confirm auth (logged in via subscription or API key)
- [ ] Step 3: Open first project
- [ ] Skip button for users who want to configure manually

### 0.1.9 — Settings Panel

- [ ] Claude CLI path input with "Detect automatically" button
- [ ] Default model selector
- [ ] Auto-accept permissions toggle
- [ ] Font size slider (12–16px)
- [ ] "Open config folder" button

### 0.1.10 — Build & Distribution

- [ ] `npm run dist:win` → `Claudette-Setup.exe` (NSIS, allows dir selection, desktop shortcut)
- [ ] `npm run dist:mac` → `Claudette.dmg`
- [ ] `npm run dist` → all platforms
- [ ] GitHub Actions workflow: build on push to `main`, attach artifacts to release
- [ ] `README.md` v0.1: badge set, install instructions, feature list, screenshots placeholder

**Exit criteria for v0.1**: A Windows user can install the `.exe`, open a project, chat with Claude, and see responses stream in real time — all using their existing Claude subscription.

---

## Phase 0.2 — Visual Power
> **Goal**: Add the features that make Claude Code GUI genuinely better than the VS Code extension. Files, git, agents, CLAUDE.md.

### 0.2.1 — File Explorer

- [ ] `FileExplorer.tsx` — tab panel container
- [ ] `FileTree.tsx`:
  - Recursive tree rendering with lazy-load for large directories
  - File type icons (Lucide + extension mapping)
  - Expand/collapse directories
  - Highlight files modified in current Claude session
  - Right-click context menu: Open, Copy Path, Reveal in Explorer
  - Search/filter input (client-side, filters visible nodes)
- [ ] `CodeViewer.tsx`:
  - Monaco Editor in read-only mode
  - Language auto-detection from file extension
  - Line numbers, minimap off (too narrow), word wrap toggle
  - "Open in default editor" button
- [ ] `fs:readdir` and `fs:readfile` IPC handlers in main process
- [ ] Ignore `node_modules/`, `.git/`, `dist/` by default (configurable)

### 0.2.2 — Git Panel

- [ ] `src/main/git-manager.ts` — simple-git wrapper:
  - `getStatus(projectPath)` → `GitStatus`
  - `getDiff(projectPath, filePath)` → unified diff string
  - `stage(projectPath, files[])` → void
  - `unstage(projectPath, files[])` → void
  - `commit(projectPath, message)` → void
  - `getBranch(projectPath)` → string
  - Graceful fallback if not a git repo (return `{ isRepo: false }`)
- [ ] `GitPanel.tsx` — container with changed files list + diff view
- [ ] `DiffViewer.tsx`:
  - Monaco Editor diff view (original vs. modified)
  - Color-coded additions (green) and deletions (red)
  - Line-by-line navigation
  - Keyboard shortcut: next/prev change
- [ ] `CommitPanel.tsx`:
  - File list with stage/unstage checkboxes
  - Commit message textarea
  - "Commit" button (disabled if no staged files or empty message)
  - Branch indicator with remote ahead/behind count
- [ ] `useGit.ts` hook — poll git status every 2 seconds when Git panel is active
- [ ] Auto-refresh git status after Claude session ends

### 0.2.3 — CLAUDE.md Editor

- [ ] Detect `CLAUDE.md` in project root on project open
- [ ] `ClaudeMdPanel.tsx`:
  - Left: Monaco editor with markdown syntax, line numbers, autosave indicator
  - Right: Live markdown preview (react-markdown + remark-gfm)
  - Split pane resize handle
  - Ctrl+S to save
  - Unsaved changes indicator in tab
  - "Create CLAUDE.md" button if file doesn't exist
- [ ] `claude-md:read` and `claude-md:write` IPC handlers
- [ ] Sidebar indicator: show dot on project if CLAUDE.md exists

### 0.2.4 — Agents Manager

- [ ] `src/main/agents-manager.ts`:
  - Store agents as JSON in `app.getPath('userData')/agents.json`
  - CRUD: list, save, delete
  - Validate agent schema before saving
- [ ] `AgentsPanel.tsx` — grid of agent cards
- [ ] `AgentCard.tsx`:
  - Name, description, model badge, tool count
  - Edit and delete buttons
  - "Launch" button → starts Claude session with agent's system prompt
- [ ] `AgentEditor.tsx`:
  - Name field
  - Description field
  - System prompt textarea (Monaco editor, markdown mode)
  - Model selector (Sonnet / Opus / Haiku)
  - Tool permissions checkboxes (Read files / Write files / Execute commands / Web search)
  - Create / Update / Cancel buttons
- [ ] `agents:list`, `agents:save`, `agents:delete`, `agents:run` IPC handlers

### 0.2.5 — Shared UI Components

- [ ] `Button.tsx` — variants: primary, secondary, ghost, danger; sizes: sm, md, lg
- [ ] `Badge.tsx` — variants: default, success, warning, error, info
- [ ] `EmptyState.tsx` — icon + title + description + optional CTA button
- [ ] `Tooltip.tsx` — Radix UI tooltip wrapper, consistent delay/styling
- [ ] `ContextMenu.tsx` — Radix UI context menu wrapper
- [ ] `ResizeHandle.tsx` — drag handle for panel resizing
- [ ] `LoadingSpinner.tsx` — animated spinner, sizes: sm/md/lg
- [ ] `KeyboardShortcut.tsx` — renders `⌘K` / `Ctrl+K` style badges

### 0.2.6 — Keyboard Shortcuts

- [ ] `Ctrl+N` — new session
- [ ] `Ctrl+K` — command palette (search projects + sessions)
- [ ] `Ctrl+\`` — toggle terminal
- [ ] `Ctrl+B` — toggle sidebar
- [ ] `Ctrl+1–5` — switch tabs (Chat, Files, Git, Agents, Usage)
- [ ] `Ctrl+S` — save CLAUDE.md (when editor focused)
- [ ] `Escape` — stop Claude / close modals

### 0.2.7 — Animations & Polish

- [ ] Page transitions between tabs (fade, 100ms)
- [ ] Sidebar slide animation on collapse/expand
- [ ] Message appear animation (slide up + fade)
- [ ] Streaming indicator pulse animation
- [ ] Button hover/active states (100ms transition)
- [ ] Terminal panel slide animation
- [ ] Loading skeleton screens on project/session lists

**Exit criteria for v0.2**: Power users can run a full Claude Code session, review all changes in the git panel, commit, edit their CLAUDE.md, and save reusable agents — without ever opening another app.

---

## Phase 0.3 — Intelligence
> **Goal**: Add analytics, polish the rough edges, ship auto-updater. Ready for Product Hunt.

### 0.3.1 — Usage Dashboard

- [ ] `src/main/usage-analyzer.ts`:
  - Parse all session JSONL files in `~/.claude/projects/`
  - Extract token counts from message metadata
  - Aggregate by day and model
  - Estimate cost using current Claude pricing constants
  - Cache parsed data, re-parse only on new sessions
- [ ] `UsagePanel.tsx` — dashboard layout with summary cards + chart
- [ ] `TokenChart.tsx`:
  - Recharts bar chart — daily input vs. output tokens
  - 30-day default range with date range picker
  - Hover tooltip: exact tokens + cost for that day
  - Responsive width
- [ ] `CostSummary.tsx`:
  - Total spend this month (estimated)
  - Daily average
  - Most-used model
  - Sessions count
  - Projected monthly cost
- [ ] Model breakdown table: model → input tokens → output tokens → cost

### 0.3.2 — Command Palette

- [ ] `CommandPalette.tsx` (`Ctrl+K`):
  - Fuzzy search across: projects, sessions, agents, settings
  - Keyboard navigation (arrow keys + Enter)
  - Recent items section
  - Actions: New Session, Open Project, Open Settings
  - Animated slide-down open, blur background

### 0.3.3 — Notifications & Toasts

- [ ] `ToastProvider.tsx` — stack of toast notifications (top-right)
- [ ] Toast types: success, error, warning, info
- [ ] Toasts for: commit success, save success, agent created, session resumed, errors
- [ ] Auto-dismiss after 4 seconds, manual dismiss X button

### 0.3.4 — Auto-Updater

- [ ] electron-updater integration
- [ ] Check for updates on launch (silent)
- [ ] Show update available notification in title bar
- [ ] "Download and install" button → downloads in background, installs on restart
- [ ] Changelog display in update dialog (pull from GitHub release notes)

### 0.3.5 — Error Handling Hardening

- [ ] Global error boundary in React — catches renderer crashes, shows reload button
- [ ] IPC error propagation — all IPC handlers return `{ data, error }` envelope
- [ ] Session JSONL parse errors — skip malformed entries, log to console
- [ ] Git operation failures — show inline error in git panel, not modal
- [ ] Claude process crash detection → show "Claude stopped unexpectedly" banner with restart button
- [ ] No raw stack traces ever shown to user

### 0.3.6 — Performance Optimization

- [ ] Virtual list for file tree (react-window or manual virtualization) — handles 10k+ files
- [ ] Message list virtualization — handles 1000+ messages without lag
- [ ] Debounce git status polling (500ms after file change events)
- [ ] Monaco editor lazy-load (only import when Files tab first opened)
- [ ] xterm.js lazy-load (only initialize when terminal first opened)

### 0.3.7 — Accessibility

- [ ] All interactive elements keyboard-navigable
- [ ] Focus trap in modals and dialogs
- [ ] ARIA labels on icon-only buttons
- [ ] Sufficient color contrast (WCAG AA)
- [ ] Reduced motion support: `@media (prefers-reduced-motion)` — disable animations

### 0.3.8 — Documentation Polish

- [ ] `README.md` — add real screenshots from the built app
- [ ] `CONTRIBUTING.md` — architecture walkthrough, how to add a new tab, how IPC works
- [ ] `CHANGELOG.md` — keep-a-changelog format
- [ ] In-app help: keyboard shortcut reference panel (`?` key)
- [ ] Tooltips on all non-obvious UI elements

**Exit criteria for v0.3**: App is stable, polished, has real screenshots in README, auto-updates, and is ready to be shared publicly.

---

## Phase 0.4 — Ecosystem
> **Goal**: Power features for advanced users. Build community momentum.

### 0.4.1 — MCP Server Manager

- [ ] `src/main/mcp-manager.ts`:
  - Read MCP server configs from `~/.claude/` config
  - Add, edit, remove MCP server entries
  - Test connection to MCP server
- [ ] `MCPPanel.tsx` — list of configured MCP servers with status badges
- [ ] Add server form: name, type (stdio/sse/http), URL/command, environment variables
- [ ] Import from Claude Desktop config (one-click migration)
- [ ] Enable/disable individual servers without deleting config

### 0.4.2 — Multi-Workspace

- [ ] Support opening multiple project folders simultaneously
- [ ] Workspace tabs at top of sidebar
- [ ] Each workspace has independent sessions, git state, file explorer
- [ ] Save/restore workspace set on app restart
- [ ] "Open in new workspace" from project context menu

### 0.4.3 — Session Checkpoints (Timeline)

- [ ] Checkpoint creation: save Claude Code session state at a point in time
- [ ] Timeline view: visual list of checkpoints with timestamps and descriptions
- [ ] Restore to checkpoint: revert project files to checkpoint state
- [ ] Auto-checkpoint before each Claude response (configurable)
- [ ] Checkpoint diff view: compare current state to any checkpoint

### 0.4.4 — Prompt Templates

- [ ] Built-in prompt template library (refactor, explain, write tests, document, etc.)
- [ ] Custom template creation with variable placeholders (e.g., `{{filename}}`)
- [ ] Template picker in chat input (`/` command)
- [ ] Import/export templates as JSON
- [ ] Community templates import via URL

### 0.4.5 — GitHub Integration

- [ ] Link project to GitHub repo
- [ ] Show PR status in status bar
- [ ] "Create PR" button from git panel (opens browser to pre-filled PR)
- [ ] View open issues list (read-only)

**Exit criteria for v0.4**: Advanced users have MCP management, checkpoint timelines, and multi-workspace. Community contributors are actively opening PRs.

---

## Phase 1.0 — Stable Launch
> **Goal**: Production quality. Public launch. Establish as the canonical Windows Claude Code GUI.

### 1.0.1 — Final Polish Pass

- [ ] Full dark mode audit — no unintended light backgrounds anywhere
- [ ] Typography audit — consistent sizing, weight, spacing throughout
- [ ] Animation audit — all transitions feel snappy (not slow/janky)
- [ ] Empty state audit — every list has a meaningful empty state
- [ ] Loading state audit — every async operation has a loading indicator
- [ ] Error state audit — every failure has a friendly message

### 1.0.2 — Testing

- [ ] Electron integration tests for IPC handlers (Playwright or Spectron)
- [ ] Unit tests for `session-manager.ts` and `git-manager.ts`
- [ ] Manual test matrix: Windows 10, Windows 11, macOS 13+, Ubuntu 22
- [ ] Test with both subscription auth and API key auth
- [ ] Test with empty `~/.claude/` (first-time user)
- [ ] Test with large projects (10k+ files)

### 1.0.3 — Release Infrastructure

- [ ] GitHub Releases with proper changelogs
- [ ] Auto-update server (can use GitHub Releases as update feed)
- [ ] Code signing for Windows (reduces SmartScreen warnings)
- [ ] `SECURITY.md` — vulnerability disclosure policy
- [ ] Issue templates: bug report, feature request
- [ ] PR template

### 1.0.4 — Launch Assets

- [ ] High-quality banner image (`docs/screenshots/banner.png`) — 1280×640px
- [ ] 4+ screenshots covering all major panels
- [ ] 60-second demo GIF or video
- [ ] Product Hunt listing draft
- [ ] Hacker News "Show HN" post draft
- [ ] Tweet/LinkedIn post announcing launch

### 1.0.5 — Community Setup

- [ ] GitHub Discussions enabled (Q&A, ideas, show-and-tell categories)
- [ ] `good-first-issue` label applied to starter bugs
- [ ] `help-wanted` label on feature requests open to contributors
- [ ] Response SLA: acknowledge all issues within 48 hours

**Exit criteria for v1.0**: App is stable on all platforms, has 1000+ GitHub stars, real user testimonials, and is mentioned in at least one developer newsletter or Claude Code community thread.

---

## Deferred / Future Considerations

| Feature | Reason Deferred |
|---|---|
| Light mode | v1 is dark-only; low demand from target audience |
| Multiplayer / team sessions | Complex auth model; out of scope for solo tool |
| Plugin system | Architecture work needed; v0.4 is already ecosystem-heavy |
| Mobile companion app | Different platform entirely; potential future product |
| AI-powered session search | Requires embedding infrastructure; separate service |
| Monetization (Pro tier) | v1 is fully free; evaluate after community traction |
| Windows Store distribution | Code signing and certification overhead for later |

---

## Build Order for Claude Code

When building with Claude Code, follow this exact order to avoid import errors:

```
1.  package.json, tsconfig files, tailwind.config.js, electron-builder.yml
2.  src/shared/types.ts
3.  src/main/index.ts (shell only)
4.  src/main/ipc-handlers.ts (stub all channels)
5.  src/main/claude-bridge.ts
6.  src/main/session-manager.ts
7.  src/main/git-manager.ts
8.  src/main/agents-manager.ts
9.  src/main/usage-analyzer.ts
10. src/renderer/styles/globals.css
11. src/renderer/main.tsx + App.tsx
12. store/*.ts (app, session, project)
13. components/shared/*.tsx
14. components/layout/*.tsx
15. components/chat/*.tsx + useClaudeBridge.ts
16. components/terminal/TerminalPanel.tsx
17. components/files/*.tsx
18. components/git/*.tsx + useGit.ts
19. components/agents/*.tsx
20. components/analytics/*.tsx
21. README.md, CONTRIBUTING.md, CHANGELOG.md
```
