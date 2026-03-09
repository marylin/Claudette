# Product Requirements Document
## Claudette — Claude Code GUI for Windows

**Version**: 1.0  
**Status**: Draft  
**Author**: WhateverAI  
**Last Updated**: March 2026

---

## 1. Executive Summary

Claudette is a free, open-source desktop application that wraps the Claude Code CLI in a polished, visual interface. It targets developers who use Claude Code via subscription but find the terminal-only experience limiting — particularly on Windows, where no reliable GUI alternative currently exists.

The product's core bet: **the biggest untapped gap in the Claude Code ecosystem is a one-click Windows installer that just works with your existing subscription**. Every existing GUI wrapper either requires building from source, only ships macOS/Linux binaries, has auth issues with subscription plans, or is abandoned. Claudette fills all of those gaps simultaneously.

---

## 2. Problem Statement

### 2.1 The Core Pain

Claude Code is one of the most capable AI coding agents available, but it is entirely terminal-based. For developers who prefer visual interfaces — file explorers, diff views, session history browsing, analytics dashboards — the experience is unnecessarily friction-heavy.

### 2.2 The Windows Gap

Existing GUI wrappers have failed Windows users in specific ways:

| Tool | Windows Issue |
|---|---|
| **Opcode** | No Windows binary shipped. Requires Rust + Bun build from source. Community workarounds via WSL are unstable. Auth issues with Claude subscription (vs. API keys). |
| **CodePilot** | Electron-based so Windows is theoretically supported, but binaries are unsigned, sessions clear randomly mid-conversation, and setup requires multiple manual steps. |
| **claudecodeui** | Web-only. No desktop app. Requires running a local server. No git integration, no CLAUDE.md editor, no agents. |

### 2.3 The Subscription Auth Gap

Claude Code supports two auth modes: API key and subscription (OAuth). Most GUI wrappers were built assuming API keys, causing silent failures for users on Pro or Max subscription plans — which is the majority of regular Claude Code users.

### 2.4 The Discoverability Gap

None of the existing tools have strong GitHub presence, good READMEs, or clear value propositions for Windows users specifically. There is no canonical "install this" answer for Windows developers wanting a GUI.

---

## 3. Goals & Non-Goals

### Goals

- Provide a beautiful, polished desktop GUI for Claude Code on Windows (primary) and macOS/Linux (secondary)
- Require zero extra subscriptions — use the user's existing Claude Code authentication
- Ship a working `.exe` installer that requires only Node.js (already installed for Claude Code)
- Build an open-source project that earns GitHub stars and community trust
- Cover the full Claude Code workflow: chat, files, git, custom agents, CLAUDE.md, and usage analytics
- Establish WhateverAI as a credible open-source contributor in the AI developer tooling space

### Non-Goals

- **Not** a replacement for Claude Code CLI — it is a visual layer on top of it
- **Not** a new AI model or provider — purely a UI wrapper
- **Not** a paid product (v1) — free and open source, monetization considered for later versions
- **Not** a browser extension or web app — desktop only
- **Not** a multi-model tool at launch — Claude models only, via Claude Code

---

## 4. Target Users

### Primary: The Subscription Windows Developer

- Uses Claude Code daily via a Pro or Max subscription
- Comfortable with the terminal but prefers visual tools
- Uses VS Code or JetBrains but finds the Claude Code extension lacks features (no git panel, no agent management, no analytics)
- Frustrated by existing GUI options that require building from source
- Windows 10 or 11

### Secondary: The Open Source Contributor / Builder

- Wants to contribute to or fork a Claude Code GUI
- Interested in Electron + React architecture
- Prefers a project with clear architecture docs (`CLAUDE.md`)

### Tertiary: Non-Technical Claude Code Users

- Designers, PMs, or founders who want to use Claude Code for automation tasks but are intimidated by the terminal
- Benefits most from the visual layout, clear status indicators, and guided onboarding

---

## 5. User Stories

### Onboarding

- As a new user, I want the app to auto-detect my Claude Code installation so I don't have to configure paths manually
- As a subscription user, I want to log in with my Anthropic account (not an API key) so my existing plan is used
- As a Windows user, I want a one-click `.exe` installer so I can start in under 60 seconds

### Chat & Sessions

- As a developer, I want to see Claude's responses stream in real time with syntax-highlighted code blocks so I can follow what it's doing
- As a developer, I want to browse my session history and resume any past conversation so I never lose context
- As a developer, I want to see Claude's permission prompts visually so I can approve or deny actions without typing in the terminal

### File Management

- As a developer, I want a file explorer that shows my project tree so I can understand what Claude is modifying
- As a developer, I want to open files in a code viewer with syntax highlighting so I can review changes inline

### Git

- As a developer, I want to see all modified files after a Claude session so I can review what changed
- As a developer, I want to view diffs, stage files, and commit directly in the app so I never need to switch to another tool for git

### CLAUDE.md & Agents

- As a developer, I want a dedicated Monaco editor for CLAUDE.md with live preview so I can maintain my project context files easily
- As a developer, I want to create reusable custom agents with system prompts and model selection so I can automate repeated workflows

### Analytics

- As a developer, I want to see my daily token usage and estimated costs in a chart so I can monitor my Claude Code spend

---

## 6. Functional Requirements

### 6.1 Onboarding & Setup

| ID | Requirement | Priority |
|---|---|---|
| F-01 | Auto-detect Claude Code CLI path on launch (check PATH, common install dirs) | P0 |
| F-02 | Show friendly setup screen if CLI not found, with install instructions | P0 |
| F-03 | Support both OAuth subscription auth and API key auth | P0 |
| F-04 | Persist settings (CLI path, model preference, layout) across sessions | P1 |

### 6.2 Project & Session Management

| ID | Requirement | Priority |
|---|---|---|
| F-05 | Read `~/.claude/projects/` and list all projects in sidebar | P0 |
| F-06 | Show last session date and session count per project | P1 |
| F-07 | Allow opening a new folder as a project via folder picker dialog | P0 |
| F-08 | List all past sessions for the active project | P0 |
| F-09 | Resume a past session via `claude --resume` | P0 |
| F-10 | Create a new session for the active project | P0 |

### 6.3 Chat Panel

| ID | Requirement | Priority |
|---|---|---|
| F-11 | Stream Claude Code stdout/stderr in real time, line by line | P0 |
| F-12 | Render markdown in assistant messages (headers, bold, lists, code blocks) | P0 |
| F-13 | Apply syntax highlighting to code blocks after streaming completes | P1 |
| F-14 | Show streaming indicator (animated dots) while Claude is running | P0 |
| F-15 | Detect permission prompts in Claude output and surface them as UI buttons | P1 |
| F-16 | Allow stopping Claude mid-response via a Stop button | P0 |
| F-17 | Show token count and model name in the chat header | P2 |

### 6.4 Terminal Panel

| ID | Requirement | Priority |
|---|---|---|
| F-18 | Embed xterm.js terminal connected to the claude CLI process | P0 |
| F-19 | Allow collapsing/expanding the terminal panel | P1 |
| F-20 | Sync terminal with chat (same underlying process) | P1 |

### 6.5 File Explorer

| ID | Requirement | Priority |
|---|---|---|
| F-21 | Display file tree of the active project root | P1 |
| F-22 | Support expand/collapse of directories | P1 |
| F-23 | Open files in Monaco editor viewer with syntax highlighting | P1 |
| F-24 | Highlight files that were modified in the current session | P2 |

### 6.6 Git Panel

| ID | Requirement | Priority |
|---|---|---|
| F-25 | Show current branch, modified, staged, and untracked files | P1 |
| F-26 | Display inline diff for any modified file | P1 |
| F-27 | Stage and unstage files via checkbox UI | P1 |
| F-28 | Write and submit a commit message | P1 |
| F-29 | Hide git tab gracefully if project is not a git repo | P1 |

### 6.7 CLAUDE.md Editor

| ID | Requirement | Priority |
|---|---|---|
| F-30 | Open and display `CLAUDE.md` from the project root in Monaco editor | P1 |
| F-31 | Show live markdown preview pane alongside the editor | P2 |
| F-32 | Save changes back to the file with Ctrl+S | P1 |
| F-33 | Create `CLAUDE.md` if it doesn't exist | P1 |

### 6.8 Agents Manager

| ID | Requirement | Priority |
|---|---|---|
| F-34 | List all saved custom agents | P1 |
| F-35 | Create new agent with name, description, system prompt, model, and tool permissions | P1 |
| F-36 | Edit and delete existing agents | P1 |
| F-37 | Launch a session using a selected agent | P2 |

### 6.9 Usage Dashboard

| ID | Requirement | Priority |
|---|---|---|
| F-38 | Parse session JSONL files to extract token usage data | P2 |
| F-39 | Show daily token usage bar chart (input vs. output) | P2 |
| F-40 | Show total cost estimate based on model pricing | P2 |
| F-41 | Show breakdown by model | P3 |

### 6.10 Settings

| ID | Requirement | Priority |
|---|---|---|
| F-42 | Configure Claude CLI path manually | P0 |
| F-43 | Select default model | P1 |
| F-44 | Toggle auto-accept permissions mode | P1 |
| F-45 | Configure font size for terminal and editor | P2 |

---

## 7. Non-Functional Requirements

### Performance
- App launch to usable state: < 3 seconds on mid-range hardware
- Chat streaming latency from CLI output to UI render: < 100ms
- File tree rendering for projects up to 10,000 files: < 500ms

### Reliability
- App must not crash if `~/.claude/` directory is missing or malformed
- App must handle Claude CLI process termination gracefully
- All async operations must have loading states and error boundaries

### Windows Compatibility
- Must run on Windows 10 (build 1903+) and Windows 11
- Must handle paths with spaces (e.g., `C:\Users\My Name\`)
- `.exe` installer must not require admin privileges for user-install mode

### Security
- Never store or transmit API keys — delegate all auth to Claude Code CLI
- Agents stored locally in app data, no telemetry

### Distribution
- Windows: NSIS `.exe` installer via electron-builder
- macOS: `.dmg`
- Linux: `.AppImage`
- File size target: < 150MB installer

---

## 8. Design Requirements

### Visual Language
- Dark mode only (v1)
- Primary background: `#0d0f12`
- Accent: `#7c6af7` (soft violet)
- Font: Geist / Geist Mono
- IDE-density: 13px base font, compact spacing

### Layout
- Three-panel layout: sidebar (projects) + main panel (tab-based) + collapsible terminal
- Frameless window with custom title bar (draggable)
- Persistent status bar: connection status, project name, branch, token count

### Key UX Principles
- **Zero setup friction**: app works immediately after install if Claude Code is already configured
- **No modal hell**: permission prompts appear inline in chat, not as blocking dialogs
- **Keyboard-first**: all primary actions have keyboard shortcuts
- **Honest empty states**: every empty list has a clear CTA explaining what to do

---

## 9. Success Metrics

### GitHub Traction (6 months post-launch)
- 1,000+ GitHub stars
- 50+ forks
- 10+ external contributors
- Featured in at least one developer newsletter or blog

### Quality Indicators
- < 5 open critical bugs at any time
- Zero "won't work on Windows" issues due to path handling
- Positive mentions in Claude Code community forums/Discord

### Usage
- 500+ downloads of the `.exe` installer in first 30 days
- Retained as daily driver by at least 50 self-reported users

---

## 10. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | Should agents be stored in `~/.claude/agents/` (compatible with Claude Code CLI) or in app-specific storage? | Engineering | Open |
| 2 | Can we reliably parse token usage from session JSONL files, or does the format change across Claude Code versions? | Engineering | Open |
| 3 | Should the app auto-update via electron-updater, or manual download only for v1? | Product | Deferred to v0.3 |
| 4 | Is there demand for a light mode, or is dark mode sufficient for v1? | Design | Deferred to v0.2 |
| 5 | Should MCP server management be in scope for v1 or pushed to v0.4? | Product | Pushed to v0.4 |

---

## 11. Dependencies

| Dependency | Purpose | Risk |
|---|---|---|
| Claude Code CLI | Core functionality — app is a wrapper | High — API/auth changes could break integration |
| `~/.claude/projects/` format | Session and project discovery | Medium — format not officially documented |
| Electron | Desktop shell | Low — stable, widely used |
| simple-git | Git panel | Low — stable library |
| Monaco Editor | CLAUDE.md editor, code viewer | Low — stable, same as VS Code |

---

## 12. Timeline

| Milestone | Deliverable | Target |
|---|---|---|
| v0.1 | Core: chat, terminal, session history, project sidebar, `.exe` installer | Month 1 |
| v0.2 | File explorer, git panel, CLAUDE.md editor, agents manager | Month 2 |
| v0.3 | Usage dashboard, auto-updater, polish pass | Month 3 |
| v0.4 | MCP server manager, multi-workspace, community feedback iteration | Month 4-5 |
| v1.0 | Stable release, full README with screenshots, Product Hunt launch | Month 6 |
