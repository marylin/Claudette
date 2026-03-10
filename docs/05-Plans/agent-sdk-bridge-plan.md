# Agent SDK Bridge Rewrite Plan

## Summary
Replace the fragile CLI-spawn bridge (`claude-bridge.ts`) with the official `@anthropic-ai/claude-agent-sdk`. This eliminates all Windows spawning bugs (wrong `.cmd` path, missing `--verbose`, stdout buffering) and gives us typed streaming messages, built-in session management, permission control, and tool visibility — the same approach Pencil and other production Claude apps use.

## Authentication
Use Claude Code's existing OAuth credentials — same as Pencil. Users authenticate via `claude` CLI login (browser-based OAuth). The Agent SDK spawns Claude Code as a subprocess which inherits those credentials. No API key required. If not authenticated, show onboarding screen directing user to run `claude` in terminal.

## Decisions (approved)
1. **API key storage**: Plaintext MVP, encrypt later with Electron `safeStorage`
2. **Legacy sessions**: Only show sessions created after SDK implementation. Don't show old CLI sessions.
3. **Auth**: OAuth via Claude Code login, not API key

## Tasks

### Phase A — Install & Foundation
1. [S] Install `@anthropic-ai/claude-agent-sdk` — `npm install @anthropic-ai/claude-agent-sdk`
2. [S] Update `Settings` interface in `types.ts` — add `permissionMode` field, remove `claudePath` (no longer needed)

### Phase B — Rewrite Bridge
3. [L] Rewrite `claude-bridge.ts` — replace entire file: use `query()` with `includePartialMessages: true` for token streaming, `for await` loop emitting IPC events. Keep same IPC contract (`claude:output`, `claude:status`, `claude:command`). Handle message types: `system` (init → session ID), `stream_event` (deltas → text), `assistant` (tool use summaries), `result` (completion/error). Use `AbortController` for stop. Pass `cwd` for active project.
4. [M] Update `sendMessage()` API — support `cwd` (active project path), `resume` (session ID), `permissionMode` from settings
5. [S] Implement `stopClaude()` — use `AbortController.abort()` or `query.close()` instead of `taskkill`
6. [S] Handle slash commands via SDK — `/compact`, `/review`, `/test`, `/commit` become prompt strings sent through `query()`. Keep `/clear` and `/help` local-only.

### Phase C — Enhanced IPC Events
7. [M] Add new IPC event `claude:tool-use` — emit structured tool use info (tool name, input summary, status) instead of inline system messages. Update preload.
8. [S] Add `claude:session` IPC event — emit session ID on init so renderer can track it. Update preload.
9. [S] Add `claude:cost` IPC event — emit `total_cost_usd` and `usage` from result message. Update preload.

### Phase D — Renderer Updates
10. [M] Update `useClaudeBridge` hook — handle new IPC events (`claude:tool-use`, `claude:session`, `claude:cost`). Simplify streaming buffer since SDK provides cleaner deltas.
11. [S] Update session store — auto-set `activeSessionId` from `claude:session` event
12. [S] Update status bar — show cost from `claude:cost` event

### Phase E — Settings & Auth
13. [M] Auth check on startup — detect if Claude Code is authenticated. If not, show onboarding screen with "Run `claude` in your terminal to log in" instructions.
14. [S] Model selector integration — pass `model` option to `query()` from settings
15. [S] Permission mode selector — add dropdown in settings: "Ask" / "Auto-approve edits" / "Auto-approve all"

### Phase F — Remove Dead Code & Test
16. [S] Remove old bridge code — delete `detectClaudePath()` from settings.ts, remove `.cmd` detection, remove `isPermissionPrompt()`, remove `spawnClaude()`, remove all `child_process` usage
17. [S] Remove `DebugLog.tsx` — no longer needed (SDK handles all parsing)
18. [M] Update Playwright e2e test — verify send message → receive response flow with SDK. Clean up `test-spawn.js` diagnostic files.
19. [S] Build verification — `npx tsc -p tsconfig.main.json && npx vite build` passes clean

## Dependencies
- Phase A before Phase B (need SDK installed + types updated)
- Phase B before Phase C and D (new bridge must exist before updating consumers)
- Phase E can run parallel with D
- Phase F after all others
