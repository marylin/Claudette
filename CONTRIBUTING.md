# Contributing to Claudette

Thank you for your interest in contributing! This guide will get you up and running.

## Development Setup

```bash
git clone https://github.com/marylin/claudette.git
cd claudette
npm install
npm run start
```

## Architecture Overview

Claudette is an Electron app with a clear main/renderer process split:

```
src/
├── main/              # Electron main process (Node.js)
│   ├── index.ts       # App lifecycle, BrowserWindow creation
│   ├── preload.ts     # contextBridge — exposes IPC to renderer
│   ├── ipc-handlers.ts # All IPC channel registrations
│   ├── claude-bridge.ts # Spawns claude CLI, streams output
│   ├── session-manager.ts # Reads ~/.claude/projects/ for sessions
│   ├── git-manager.ts  # simple-git wrapper for Git panel
│   ├── settings.ts     # JSON settings in userData
│   ├── agents-manager.ts # Agent CRUD in userData
│   ├── usage-analyzer.ts # Parses JSONL for token analytics
│   ├── mcp-manager.ts  # MCP server config management
│   └── template-manager.ts # Prompt template system
├── renderer/          # React app (browser context)
│   ├── App.tsx        # Root layout with TooltipProvider
│   ├── store/         # Zustand stores (app, session, project)
│   ├── components/
│   │   ├── layout/    # TitleBar, Sidebar, TabBar, StatusBar
│   │   ├── chat/      # ChatPanel, MessageBubble, ChatInput
│   │   ├── files/     # FileExplorer, FileTree, CodeViewer
│   │   ├── git/       # GitPanel, DiffViewer, CommitPanel
│   │   ├── agents/    # AgentsPanel
│   │   ├── analytics/ # UsagePanel, TokenChart, CostSummary
│   │   ├── terminal/  # TerminalPanel (xterm.js)
│   │   └── shared/    # Button, Badge, Tooltip, etc.
│   └── hooks/         # useClaudeBridge, useSession, useGit
└── shared/
    └── types.ts       # Types shared between main + renderer
```

### How IPC Works

All communication between main and renderer uses Electron IPC:

1. **Renderer calls main**: `window.electronAPI.someMethod()` (defined in `preload.ts`)
2. **Preload bridges**: Maps to `ipcRenderer.invoke('channel-name', ...args)`
3. **Main handles**: Registered in `ipc-handlers.ts` via `ipcMain.handle()`
4. **Main pushes to renderer**: `mainWindow.webContents.send('channel', data)` for events like `claude:output`

### How to Add a New Tab

1. Add the tab ID to `TabId` type in `src/renderer/store/app.store.ts`
2. Add the tab entry in `src/renderer/components/layout/TabBar.tsx`
3. Create your panel component in `src/renderer/components/your-feature/`
4. Add the `case` in `MainPanel()` switch in `src/renderer/App.tsx`

### How to Add a New IPC Channel

1. Add the type signature in `src/shared/types.ts` under `IpcChannels`
2. Add the handler in `src/main/ipc-handlers.ts`
3. Expose the method in `src/main/preload.ts`
4. Call it from the renderer via `window.electronAPI.yourMethod()`

### State Management

Zustand stores in `src/renderer/store/`:
- **app.store.ts** — global UI state (active project, active tab, sidebar, terminal, settings)
- **session.store.ts** — chat state (messages, active session, streaming flag)
- **project.store.ts** — project list from `~/.claude/projects/`

## Guidelines

- **TypeScript strict** — no `any` types unless wrapping external untyped APIs
- **No new dependencies** without discussion — keep the bundle lean
- **Windows first** — test on Windows or at least use `path.join()` everywhere
- **Match the design system** — colors, spacing, and fonts are defined in `tailwind.config.mjs`
- **One PR = one feature** — keep it focused

## Before Submitting

```bash
npx tsc -p tsconfig.main.json    # TypeScript check (main process)
npx vite build                   # Renderer build
npm test                         # Unit tests (39 tests)
```

All three must pass.

## Submitting a PR

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run the checks above — all must pass
5. Open a PR with a clear description (use the PR template)

## Labels

- `good-first-issue` — great for newcomers
- `help-wanted` — we'd love community help here

## Reporting Bugs

Use GitHub Issues. Include your OS, Node version, and Claude Code version.

## Feature Requests

Open a GitHub Discussion before building anything large — let's align first.
