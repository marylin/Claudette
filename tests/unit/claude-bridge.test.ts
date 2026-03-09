import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { EventEmitter, Readable } from 'stream'

// Mock dependencies
const mockWindow = {
  isDestroyed: vi.fn(() => false),
  webContents: { send: vi.fn() },
}

vi.mock('./index', () => ({
  getMainWindow: () => mockWindow,
}))

vi.mock('electron', () => ({
  app: { getPath: () => '/tmp' },
}))

// Mock settings
vi.mock('../../src/main/settings', () => ({
  getSettings: () => ({
    claudePath: '/usr/bin/claude',
    autoAcceptPermissions: false,
  }),
}))

// Mock main process index
vi.mock('../../src/main/index', () => ({
  getMainWindow: () => mockWindow,
}))

// Create mock process
function createMockProcess() {
  const proc = new EventEmitter() as any
  proc.stdout = new Readable({ read() {} })
  proc.stderr = new Readable({ read() {} })
  proc.stdin = { write: vi.fn() }
  proc.pid = 12345
  proc.kill = vi.fn()
  return proc
}

let spawnMock: ReturnType<typeof vi.fn>
let mockProcess: any

vi.mock('child_process', () => ({
  spawn: (...args: any[]) => spawnMock(...args),
  execSync: vi.fn(),
}))

describe('claude-bridge', () => {
  beforeEach(() => {
    mockProcess = createMockProcess()
    spawnMock = vi.fn(() => mockProcess)
    vi.clearAllMocks()
    mockWindow.isDestroyed.mockReturnValue(false)
  })

  it('exports required functions', async () => {
    const bridge = await import('../../src/main/claude-bridge')
    expect(bridge.sendMessage).toBeDefined()
    expect(bridge.stopClaude).toBeDefined()
    expect(bridge.getClaudeStatus).toBeDefined()
  })

  it('getClaudeStatus returns idle by default', async () => {
    const { getClaudeStatus } = await import('../../src/main/claude-bridge')
    const status = getClaudeStatus()
    expect(status.status).toBe('idle')
  })
})
