# Agent SDK Bridge Rewrite — Progress

## Current State
Phases A-D complete. Phase F partially done (old bridge code removed). Remaining: auth check (13), model selector (14), permission mode (15), remove DebugLog (17), e2e test (18), final build verify (19).

## Next Steps
Task 13: Auth check on startup — detect if Claude Code is authenticated, show onboarding if not

## Tasks

### Phase A — Install & Foundation
- [x] 1. Install `@anthropic-ai/claude-agent-sdk` — v0.2.71
- [x] 2. Update `Settings` interface — added PermissionMode, CostEvent, ToolUseEvent types

### Phase B — Rewrite Bridge
- [x] 3. Rewrite `claude-bridge.ts` — full SDK rewrite with query(), includePartialMessages, AbortController
- [x] 4. Update `sendMessage()` API — cwd, resume, permissionMode support
- [x] 5. Implement `stopClaude()` — AbortController + query.close()
- [x] 6. Handle slash commands — mapped to prompts through SDK

### Phase C — Enhanced IPC Events
- [x] 7. Add `claude:tool-use` IPC event
- [x] 8. Add `claude:session` IPC event
- [x] 9. Add `claude:cost` IPC event

### Phase D — Renderer Updates
- [x] 10. Update `useClaudeBridge` hook
- [x] 11. Update session store — auto-set activeSessionId
- [x] 12. Update status bar with cost display

### Phase E — Settings & Auth
- [ ] 13. Auth check on startup
- [ ] 14. Model selector integration
- [ ] 15. Permission mode selector

### Phase F — Remove Dead Code & Test
- [x] 16. Remove old bridge code (detectClaudePath, .cmd logic, execSync)
- [ ] 17. Remove DebugLog.tsx
- [ ] 18. Update Playwright e2e test
- [ ] 19. Build verification
