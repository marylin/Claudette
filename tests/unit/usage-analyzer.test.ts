import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import path from 'path'
import fs from 'fs'
import os from 'os'

// Mock electron
vi.mock('electron', () => ({
  app: {
    getPath: (name: string) => {
      if (name === 'home') return os.tmpdir()
      return os.tmpdir()
    },
  },
}))

const TEST_HOME = path.join(os.tmpdir(), 'claudette-test-ua')

// Mock electron with unique test dir
vi.mock('electron', () => ({
  app: {
    getPath: (name: string) => {
      if (name === 'home') return path.join(os.tmpdir(), 'claudette-test-ua')
      return os.tmpdir()
    },
  },
}))

// Re-import each test to reset module-level file cache
let getUsageData: typeof import('../../src/main/usage-analyzer').getUsageData

beforeEach(async () => {
  vi.resetModules()
  vi.doMock('electron', () => ({
    app: {
      getPath: (name: string) => {
        if (name === 'home') return TEST_HOME
        return os.tmpdir()
      },
    },
  }))
  const mod = await import('../../src/main/usage-analyzer')
  getUsageData = mod.getUsageData
})

const CLAUDE_DIR = path.join(TEST_HOME, '.claude')
const PROJECTS_DIR = path.join(CLAUDE_DIR, 'projects')

function createSessionFile(projectName: string, sessionId: string, entries: object[]) {
  const projectDir = path.join(PROJECTS_DIR, projectName)
  fs.mkdirSync(projectDir, { recursive: true })
  const content = entries.map((e) => JSON.stringify(e)).join('\n') + '\n'
  fs.writeFileSync(path.join(projectDir, `${sessionId}.jsonl`), content)
}

describe('usage-analyzer', () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_HOME)) {
      fs.rmSync(TEST_HOME, { recursive: true, force: true })
    }
  })

  afterEach(() => {
    if (fs.existsSync(TEST_HOME)) {
      fs.rmSync(TEST_HOME, { recursive: true, force: true })
    }
  })

  it('returns empty data when no projects exist', () => {
    const data = getUsageData()
    expect(data.daily).toEqual([])
    expect(data.total.inputTokens).toBe(0)
    expect(data.total.outputTokens).toBe(0)
    expect(data.total.cost).toBe(0)
  })

  it('returns empty data when projects dir is empty', () => {
    fs.mkdirSync(PROJECTS_DIR, { recursive: true })
    const data = getUsageData()
    expect(data.daily).toEqual([])
    expect(data.total.cost).toBe(0)
  })

  it('aggregates token usage from session files', () => {
    createSessionFile('test-proj', 'session-1', [
      {
        message: {
          role: 'assistant',
          model: 'claude-sonnet-4-5-20251101',
          usage: {
            input_tokens: 1000,
            output_tokens: 500,
            cache_creation_input_tokens: 0,
            cache_read_input_tokens: 0,
          },
        },
        timestamp: '2026-03-09T10:00:00Z',
      },
    ])

    const data = getUsageData()
    expect(data.total.inputTokens).toBe(1000)
    expect(data.total.outputTokens).toBe(500)
    expect(data.total.cost).toBeGreaterThan(0)
  })

  it('groups usage by date', () => {
    createSessionFile('test-proj', 'session-1', [
      {
        message: {
          role: 'assistant',
          model: 'claude-sonnet-4-5-20251101',
          usage: { input_tokens: 100, output_tokens: 50 },
        },
        timestamp: '2026-03-08T10:00:00Z',
      },
      {
        message: {
          role: 'assistant',
          model: 'claude-sonnet-4-5-20251101',
          usage: { input_tokens: 200, output_tokens: 100 },
        },
        timestamp: '2026-03-09T15:00:00Z',
      },
    ])

    const data = getUsageData()
    expect(data.daily.length).toBe(2)
    expect(data.daily[0].date).toBe('2026-03-08')
    expect(data.daily[1].date).toBe('2026-03-09')
  })

  it('groups usage by model', () => {
    createSessionFile('test-proj', 'session-1', [
      {
        message: {
          role: 'assistant',
          model: 'claude-sonnet-4-5-20251101',
          usage: { input_tokens: 500, output_tokens: 200 },
        },
        timestamp: '2026-03-09T10:00:00Z',
      },
      {
        message: {
          role: 'assistant',
          model: 'claude-haiku-4-5-20251001',
          usage: { input_tokens: 300, output_tokens: 100 },
        },
        timestamp: '2026-03-09T11:00:00Z',
      },
    ])

    const data = getUsageData()
    expect(data.byModel['Claude Sonnet']).toBeDefined()
    expect(data.byModel['Claude Haiku']).toBeDefined()
    expect(data.byModel['Claude Sonnet'].inputTokens).toBe(500)
    expect(data.byModel['Claude Haiku'].inputTokens).toBe(300)
  })

  it('calculates cost correctly for Sonnet model', () => {
    createSessionFile('test-proj', 'session-1', [
      {
        message: {
          role: 'assistant',
          model: 'claude-sonnet-4-5-20251101',
          usage: {
            input_tokens: 1_000_000,
            output_tokens: 1_000_000,
            cache_creation_input_tokens: 0,
            cache_read_input_tokens: 0,
          },
        },
        timestamp: '2026-03-09T10:00:00Z',
      },
    ])

    const data = getUsageData()
    // Sonnet: $3/M input + $15/M output = $18 total
    expect(data.total.cost).toBeCloseTo(18, 1)
  })

  it('skips non-assistant messages', () => {
    createSessionFile('test-proj', 'session-1', [
      {
        message: { role: 'user', content: 'Hello' },
        timestamp: '2026-03-09T10:00:00Z',
      },
      {
        message: {
          role: 'assistant',
          model: 'claude-sonnet-4-5-20251101',
          usage: { input_tokens: 100, output_tokens: 50 },
        },
        timestamp: '2026-03-09T10:01:00Z',
      },
    ])

    const data = getUsageData()
    expect(data.total.inputTokens).toBe(100)
    expect(data.total.outputTokens).toBe(50)
  })

  it('handles malformed JSONL lines gracefully', () => {
    const projectDir = path.join(PROJECTS_DIR, 'broken-proj')
    fs.mkdirSync(projectDir, { recursive: true })
    fs.writeFileSync(
      path.join(projectDir, 'session.jsonl'),
      'not json\n{broken\n' +
        JSON.stringify({
          message: {
            role: 'assistant',
            model: 'claude-sonnet-4-5-20251101',
            usage: { input_tokens: 100, output_tokens: 50 },
          },
          timestamp: '2026-03-09T10:00:00Z',
        }) +
        '\n'
    )

    const data = getUsageData()
    expect(data.total.inputTokens).toBe(100)
    expect(data.total.outputTokens).toBe(50)
  })

  it('counts unique sessions', () => {
    createSessionFile('test-proj', 'session-1', [
      {
        message: {
          role: 'assistant',
          model: 'claude-sonnet-4-5-20251101',
          usage: { input_tokens: 100, output_tokens: 50 },
        },
        timestamp: '2026-03-09T10:00:00Z',
      },
    ])
    createSessionFile('test-proj', 'session-2', [
      {
        message: {
          role: 'assistant',
          model: 'claude-sonnet-4-5-20251101',
          usage: { input_tokens: 200, output_tokens: 100 },
        },
        timestamp: '2026-03-09T11:00:00Z',
      },
    ])

    const data = getUsageData()
    expect(data.total.sessions).toBe(2)
  })

  it('includes cache tokens in input aggregation', () => {
    createSessionFile('test-proj', 'session-1', [
      {
        message: {
          role: 'assistant',
          model: 'claude-sonnet-4-5-20251101',
          usage: {
            input_tokens: 100,
            output_tokens: 50,
            cache_creation_input_tokens: 500,
            cache_read_input_tokens: 200,
          },
        },
        timestamp: '2026-03-09T10:00:00Z',
      },
    ])

    const data = getUsageData()
    // Input includes base + cache_write + cache_read
    expect(data.total.inputTokens).toBe(800)
    expect(data.total.outputTokens).toBe(50)
  })
})
