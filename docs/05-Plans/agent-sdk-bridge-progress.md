# Agent SDK Bridge Rewrite — Progress

## Current State
Starting Phase A — Install & Foundation

## Next Steps
Task 1: Install @anthropic-ai/claude-agent-sdk

## Tasks

### Phase A — Install & Foundation
- [ ] 1. Install `@anthropic-ai/claude-agent-sdk`
- [ ] 2. Update `Settings` interface in `types.ts`

### Phase B — Rewrite Bridge
- [ ] 3. Rewrite `claude-bridge.ts`
- [ ] 4. Update `sendMessage()` API
- [ ] 5. Implement `stopClaude()` via AbortController
- [ ] 6. Handle slash commands via SDK

### Phase C — Enhanced IPC Events
- [ ] 7. Add `claude:tool-use` IPC event
- [ ] 8. Add `claude:session` IPC event
- [ ] 9. Add `claude:cost` IPC event

### Phase D — Renderer Updates
- [ ] 10. Update `useClaudeBridge` hook
- [ ] 11. Update session store
- [ ] 12. Update status bar with cost

### Phase E — Settings & Auth
- [ ] 13. Auth check on startup
- [ ] 14. Model selector integration
- [ ] 15. Permission mode selector

### Phase F — Remove Dead Code & Test
- [ ] 16. Remove old bridge code
- [ ] 17. Remove DebugLog.tsx
- [ ] 18. Update Playwright e2e test
- [ ] 19. Build verification
