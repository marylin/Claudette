# Changelog

All notable changes to Claudette will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Tooltip, ContextMenu, ResizeHandle, LoadingSpinner shared components
- TooltipProvider wired into app root with Radix UI tooltips on StatusBar and TabBar

## [0.1.0] - 2026-03-09

### Added
- **Core Shell (Phase 0.1)**: Electron app with frameless window, custom title bar, project sidebar, chat panel with streaming, embedded xterm.js terminal, session management, settings panel with Claude CLI auto-detection
- **Visual Power (Phase 0.2)**: File explorer with tree view and Monaco code viewer, Git panel with diff viewer and commit support, CLAUDE.md editor with live preview, Agents manager with CRUD and model selection, global keyboard shortcuts (Ctrl+1-5 tabs, Ctrl+B sidebar, Ctrl+\` terminal, Ctrl+K command palette)
- **Intelligence (Phase 0.3)**: Usage dashboard with token charts and cost breakdown by model, Command palette (Ctrl+K) with fuzzy search, Toast notification system, Error boundaries and crash recovery banners, Performance optimizations (React.memo, lazy loading), Accessibility improvements (reduced motion, focus-visible, ARIA), Keyboard shortcuts help panel (? key), Font size setting
- **Ecosystem (Phase 0.4)**: MCP server manager (add/remove/toggle stdio/sse servers), Prompt template system with 6 built-in templates and custom CRUD, GitHub integration (remote URL detection, open on GitHub)
- **Stable Launch (Phase 1.0)**: Dark mode audit, typography/animation/empty state/loading/error state audits, Unit tests for session-manager, git-manager, usage-analyzer, claude-bridge (39 tests), GitHub Actions CI workflow for releases, SECURITY.md, issue/PR templates, CONTRIBUTING.md

### Technical Details
- Electron 31 + React 18 + TypeScript
- Tailwind CSS with custom dark theme (violet accent #7c6af7)
- Zustand for state management
- Monaco Editor for code viewing and CLAUDE.md editing
- xterm.js for embedded terminal
- Recharts for usage analytics
- simple-git for Git operations
- Radix UI primitives for tooltips, dialogs, menus

[Unreleased]: https://github.com/marylin/claudette/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/marylin/claudette/releases/tag/v0.1.0
