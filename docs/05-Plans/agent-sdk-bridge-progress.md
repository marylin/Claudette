# Agent SDK Bridge Rewrite — Progress

## Current State
Phase A+B+C+D partially complete. Core bridge rewritten, builds clean. Remaining: status bar cost, auth check, settings UI, cleanup.

## Next Steps
Task 12: Update status bar to show cost from claude:cost event
Then tasks 13-19 (auth check, model selector, permission mode, cleanup, test)

## Tasks

### Phase A — Install & Foundation
- [x] 1. Install `@anthropic-ai/claude-agent-sdk` — v0.2.71
- [x] 2. Update `Settings` interface — added PermissionMode, CostEvent, ToolUseEvent types

### Phase B — Rewrite Bridge
- [x] 3. Rewrite `claude-bridge.ts` — full SDK rewrite with query(), includePartialMessages, AbortController
- [x] 4. Update `sendMessage()` API — cwd, resume, permissionMode support
- [x] 5. Implement `stopClaude()` — AbortController + query.close()
- [x] 6. Handle slash commands — /compact, /review etc. mapped to prompts through SDK

### Phase C — Enhanced IPC Events
- [x] 7. Add `claude:tool-use` IPC event
- [x] 8. Add `claude:session` IPC event
- [x] 9. Add `claude:cost` IPC event

### Phase D — Renderer Updates
- [x] 10. Update `useClaudeBridge` hook — handles new events, simplified buffer
- [x] 11. Update session store — auto-set activeSessionId from claude:session
- [ ] 12. Update status bar with cost

### Phase E — Settings & Auth
- [ ] 13. Auth check on startup
- [ ] 14. Model selector integration
- [ ] 15. Permission mode selector

### Phase F — Remove Dead Code & Test
- [ ] 16. Remove old bridge code (detectClaudePath, .cmd logic)
- [ ] 17. Remove DebugLog.tsx
- [ ] 18. Update Playwright e2e test
- [ ] 19. Build verification
