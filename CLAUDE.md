# Claudette — Claude Code GUI for Windows
> Build autonomously. Never ask questions. All decisions are pre-made below.

---

## What We're Building

**Claudette** is an Electron + React desktop app that wraps the Claude Code CLI in a beautiful, polished GUI. It targets Windows developers who have Claude Code installed but hate the terminal-only experience. It must be the best Claude Code GUI on GitHub — better UX than Opcode, easier setup than CodePilot, and more complete than claudecodeui.

**One-line pitch**: "The GUI that Claude Code should have shipped with."

---

## Non-Negotiable Principles

1. **Never ask the user a question** — if something is ambiguous, pick the best option and build it
2. **Never leave placeholders** — every component must be complete and functional
3. **Token efficiency** — write complete files in one pass; avoid back-and-forth iteration on the same file
4. **No console errors** — app must be clean on launch
5. **Beauty first** — this needs to look better than VS Code extensions and other wrappers
6. **Windows first** — every feature must work on Windows 10/11. No Unix-only assumptions.

---

## Tech Stack (Final — No Substitutions)

| Layer | Choice | Reason |
|---|---|---|
| Desktop shell | Electron 31 | No Rust required, works everywhere |
| Frontend | React 18 + TypeScript | Type safety, component reuse |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent, beautiful |
| State | Zustand | Simple, no boilerplate |
| CLI bridge | Node.js child_process | Spawn claude CLI, stream output |
| Terminal | xterm.js | Embedded terminal for raw CLI |
| Code editor | Monaco Editor | CLAUDE.md editing, syntax highlighting |
| Git | simple-git | Git diff, staging, branch info |
| Charts | Recharts | Usage analytics |
| Build | electron-builder | Produces .exe installer for Windows |

---

## Design System

### Theme
- **Dark mode only** (developers hate light mode apps)
- Background: `#0d0f12` (near-black, not pure black)
- Surface: `#161920`
- Surface elevated: `#1e2128`
- Border: `#2a2d35`
- Accent: `#7c6af7` (soft violet — not generic blue)
- Accent hover: `#9b8dfb`
- Success: `#4ade80`
- Warning: `#fb923c`
- Error: `#f87171`
- Text primary: `#f1f3f8`
- Text secondary: `#8b92a5`
- Text muted: `#4b5263`

### Typography
- **UI font**: `'Geist'` (import from Google Fonts or use Inter as fallback)
- **Mono font**: `'Geist Mono'` for code, terminal, file paths
- Base size: 13px (dense like an IDE, not a webpage)
- Line height: 1.5

### Spacing
- Use 4px base unit — `4, 8, 12, 16, 20, 24, 32, 40, 48`
- Sidebar width: 240px (collapsible to 48px icon rail)
- Panel header height: 40px
- Status bar height: 24px

### Component Style Rules
- Rounded corners: `rounded-lg` (8px) for cards, `rounded-md` (6px) for buttons
- All interactive elements have hover states (100ms transition)
- Subtle gradients on primary actions only
- Icons: Lucide React (consistent, clean)
- No drop shadows on surfaces — use borders instead
- Scrollbars: custom thin scrollbar (2px width, accent color)

---

## App Layout

```
┌─────────────────────────────────────────────────────────┐
│ Title Bar (draggable, custom, frameless)    [─] [□] [×] │
├────────┬────────────────────────────────────────────────┤
│        │ Tab Bar: [Chat] [Files] [Git] [Agents] [Usage] │
│ Side   ├────────────────────────────────────────────────┤
│ bar    │                                                 │
│        │          Main Panel (changes per tab)          │
│ Project│                                                 │
│ list   │                                                 │
│        ├────────────────────────────────────────────────┤
│        │ Terminal panel (collapsible, xterm.js)         │
├────────┴────────────────────────────────────────────────┤
│ Status Bar: [● Connected] [project-name] [branch] [tokens]│
└─────────────────────────────────────────────────────────┘
```

---

## Features to Build (Priority Order)

### Phase 1 — Core (MVP)
1. **Project Sidebar** — reads `~/.claude/projects/`, shows project list with last session time
2. **Chat Panel** — streams Claude Code output in real time, markdown rendering, code blocks
3. **Session Management** — list past sessions, resume them, create new
4. **Embedded Terminal** — xterm.js panel, collapsible, runs actual claude CLI
5. **Settings** — detect claude CLI path, configure model, theme toggle placeholder

### Phase 2 — Differentiators
6. **File Explorer** — tree view of current project, click to open in Monaco, live updates
7. **Git Panel** — changed files, diff viewer, stage/unstage, commit message + commit button
8. **CLAUDE.md Editor** — Monaco editor with markdown syntax, live preview pane
9. **Agents Manager** — create/edit/delete custom agents with system prompts, model selector

### Phase 3 — Analytics
10. **Usage Dashboard** — token usage over time (read from claude session data), cost estimate, daily chart

---

## File Structure

```
claudette/
├── CLAUDE.md                    ← this file
├── package.json
├── electron-builder.yml
├── tsconfig.json
├── tailwind.config.js
├── src/
│   ├── main/
│   │   ├── index.ts             ← Electron main process
│   │   ├── claude-bridge.ts     ← spawn + stream claude CLI
│   │   ├── session-manager.ts   ← read ~/.claude/projects/
│   │   ├── git-manager.ts       ← simple-git wrapper
│   │   └── ipc-handlers.ts      ← all IPC channel definitions
│   ├── renderer/
│   │   ├── index.html
│   │   ├── main.tsx             ← React entry point
│   │   ├── App.tsx              ← root layout
│   │   ├── store/
│   │   │   ├── app.store.ts     ← global app state (Zustand)
│   │   │   ├── session.store.ts ← session/chat state
│   │   │   └── project.store.ts ← project list state
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── TitleBar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── TabBar.tsx
│   │   │   │   └── StatusBar.tsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatPanel.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   └── StreamingIndicator.tsx
│   │   │   ├── files/
│   │   │   │   ├── FileExplorer.tsx
│   │   │   │   ├── FileTree.tsx
│   │   │   │   └── CodeViewer.tsx
│   │   │   ├── git/
│   │   │   │   ├── GitPanel.tsx
│   │   │   │   ├── DiffViewer.tsx
│   │   │   │   └── CommitPanel.tsx
│   │   │   ├── agents/
│   │   │   │   ├── AgentsPanel.tsx
│   │   │   │   ├── AgentCard.tsx
│   │   │   │   └── AgentEditor.tsx
│   │   │   ├── analytics/
│   │   │   │   ├── UsagePanel.tsx
│   │   │   │   ├── TokenChart.tsx
│   │   │   │   └── CostSummary.tsx
│   │   │   ├── terminal/
│   │   │   │   └── TerminalPanel.tsx
│   │   │   └── shared/
│   │   │       ├── Button.tsx
│   │   │       ├── Badge.tsx
│   │   │       └── EmptyState.tsx
│   │   └── hooks/
│   │       ├── useClaudeBridge.ts
│   │       ├── useSession.ts
│   │       └── useGit.ts
│   └── shared/
│       └── types.ts             ← shared types between main + renderer
├── scripts/
│   └── notarize.js
└── docs/
    └── screenshots/             ← add screenshots here for README
```

---

## IPC Channel Contracts

All IPC channels are defined here. Never deviate from these names.

```typescript
// Main → Renderer (send)
'claude:output'        // { text: string, type: 'stdout' | 'stderr' | 'system' }
'claude:status'        // { status: 'running' | 'idle' | 'error' }
'session:updated'      // { session: Session }

// Renderer → Main (invoke, returns promise)
'claude:send'          // (message: string) => void
'claude:stop'          // () => void
'projects:list'        // () => Project[]
'sessions:list'        // (projectPath: string) => Session[]
'sessions:resume'      // (sessionId: string) => void
'git:status'           // (projectPath: string) => GitStatus
'git:diff'             // (projectPath: string, file: string) => string
'git:stage'            // (projectPath: string, files: string[]) => void
'git:commit'           // (projectPath: string, message: string) => void
'agents:list'          // () => Agent[]
'agents:save'          // (agent: Agent) => void
'agents:delete'        // (agentId: string) => void
'claude-md:read'       // (projectPath: string) => string
'claude-md:write'      // (projectPath: string, content: string) => void
'usage:get'            // () => UsageData
'settings:get'         // () => Settings
'settings:set'         // (settings: Partial<Settings>) => void
```

---

## Shared Types

```typescript
// src/shared/types.ts — define ALL types here, import everywhere

interface Project {
  id: string
  name: string
  path: string
  lastSessionAt: Date
  sessionCount: number
}

interface Session {
  id: string
  projectPath: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
  summary?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  tokenCount?: number
}

interface Agent {
  id: string
  name: string
  description: string
  systemPrompt: string
  model: 'claude-sonnet-4-5' | 'claude-opus-4-5' | 'claude-haiku-4-5'
  allowedTools: string[]
  createdAt: Date
}

interface GitStatus {
  branch: string
  modified: string[]
  staged: string[]
  untracked: string[]
  ahead: number
  behind: number
}

interface UsageData {
  daily: { date: string; inputTokens: number; outputTokens: number; cost: number }[]
  total: { inputTokens: number; outputTokens: number; cost: number }
  byModel: Record<string, { inputTokens: number; outputTokens: number }>
}

interface Settings {
  claudePath: string
  defaultModel: string
  autoAcceptPermissions: boolean
  terminalVisible: boolean
  sidebarCollapsed: boolean
}
```

---

## Key Implementation Notes

### Claude CLI Bridge (`claude-bridge.ts`)
- Use `child_process.spawn` not `exec` — we need streaming
- On Windows: `spawn('cmd', ['/c', 'claude', ...args])`
- Parse output line by line using readline
- Detect permission prompts and surface them in UI rather than blocking
- Store process reference so we can kill it via `claude:stop`

### Session Detection
- Claude Code stores sessions in `~/.claude/projects/`
- Each subdirectory = one project (path is encoded in dir name)
- Sessions are JSONL files inside each project dir
- Parse the last line of each JSONL for summary/timestamp

### Windows Path Handling
- ALWAYS use `path.join()` never string concatenation for paths
- Handle spaces in paths (common on Windows: `C:\Users\My Name\`)
- Use `app.getPath('home')` for home directory, never hardcode `~`

### Auto-detecting Claude CLI
- Check common install locations in order:
  1. `where claude` (Windows) / `which claude` (Unix)
  2. `%APPDATA%\npm\claude.cmd`
  3. `C:\Program Files\nodejs\claude.cmd`
  4. User-configured path from settings

### Streaming Output Rendering
- Buffer output and flush every 16ms (one frame) to avoid React re-render spam
- Use `useRef` for message buffer, only setState when flushing
- Apply syntax highlighting to code blocks using highlight.js after stream completes

---

## Error Handling Rules

- If claude CLI not found → show friendly onboarding screen with install instructions
- If project dir empty → show empty state with "Open a folder" CTA  
- If git not available → hide git tab, don't show error
- If session JSONL malformed → skip that session, log to console
- Never show raw error stack traces to user — always friendly messages

---

## Build & Distribution

```yaml
# electron-builder.yml
appId: dev.whateverai.claudette
productName: Claudette
win:
  target: nsis          # produces .exe installer
  icon: assets/icon.ico
nsis:
  oneClick: false       # let user choose install dir
  allowToChangeInstallationDirectory: true
mac:
  target: dmg
linux:
  target: AppImage
```

---

## README Requirements

The README.md must include:
1. Banner image placeholder (`docs/screenshots/banner.png`)
2. Badges: license, platform, stars
3. One-paragraph pitch
4. Feature list with emoji icons
5. Quick install section (download .exe, done)
6. Screenshots section (3 placeholder images)
7. "Built with Claude Code" badge/mention
8. Contributing guide link
9. License (MIT)

---

## Quality Gates

Before considering any feature complete:
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] No console errors/warnings on launch
- [ ] Works on Windows (path handling, CLI detection)
- [ ] Loading states on all async operations
- [ ] Empty states on all lists
- [ ] Keyboard shortcut documented where added

---

## Build Order

Build in this exact order to avoid dependency issues:

1. `package.json` + `tsconfig.json` + `tailwind.config.js` + `electron-builder.yml`
2. `src/shared/types.ts`
3. `src/main/index.ts` (Electron shell, no features yet)
4. `src/main/ipc-handlers.ts` (stub all handlers)
5. `src/main/claude-bridge.ts`
6. `src/main/session-manager.ts`
7. `src/renderer/main.tsx` + `App.tsx` + base layout components
8. `src/renderer/store/*.ts`
9. Phase 1 components (Chat, Terminal, Sessions)
10. Phase 2 components (Files, Git, Agents, CLAUDE.md editor)
11. Phase 3 components (Usage dashboard)
12. `README.md`
13. Final pass: polish, animations, empty states
